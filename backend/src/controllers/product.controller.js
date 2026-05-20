const axios = require('axios');
const Product = require('../models/Product');
const Scan = require('../models/Scan');

const OFF_BASE_URL = 'https://world.openfoodfacts.org/api/v2/product';

function splitList(value = '') {
  return value
    .split(/[,;]+/)
    .map((item) => item.trim().replace(/^en:/, ''))
    .filter(Boolean);
}

function normalizeProduct(barcode, offProduct) {
  const nutriments = offProduct.nutriments || {};
  const ingredientsText = offProduct.ingredients_text || offProduct.ingredients_text_en || '';
  const ingredients = offProduct.ingredients?.length
    ? offProduct.ingredients.map((item) => item.text || item.id).filter(Boolean)
    : splitList(ingredientsText);

  return {
    barcode,
    name: offProduct.product_name || offProduct.product_name_en || 'Unnamed product',
    brand: offProduct.brands || 'Unknown brand',
    imageUrl: offProduct.image_front_url || offProduct.image_url,
    category: offProduct.categories_tags?.[0]?.replace('en:', '') || offProduct.categories,
    ingredientsText,
    ingredients,
    allergens: splitList(offProduct.allergens || ''),
    nutrition: {
      calories: nutriments['energy-kcal_100g'] ?? nutriments['energy-kcal'],
      sugar: nutriments.sugars_100g,
      fat: nutriments.fat_100g,
      saturatedFat: nutriments['saturated-fat_100g'],
      protein: nutriments.proteins_100g,
      fiber: nutriments.fiber_100g,
      salt: nutriments.salt_100g,
      sodium: nutriments.sodium_100g,
    },
    rawScore: offProduct.nutriscore_score,
    lastFetchedAt: new Date(),
  };
}

async function fetchFromOpenFoodFacts(barcode) {
  const fields = [
    'product_name',
    'product_name_en',
    'brands',
    'image_url',
    'image_front_url',
    'ingredients_text',
    'ingredients_text_en',
    'ingredients',
    'allergens',
    'nutriments',
    'categories',
    'categories_tags',
    'nutriscore_score',
  ].join(',');

  const { data } = await axios.get(`${OFF_BASE_URL}/${barcode}.json`, {
    params: { fields },
    timeout: 12000,
    headers: { 'User-Agent': 'PureScan student prototype - contact: demo@example.com' },
  });

  if (!data.product) {
    const error = new Error('Product not found in Open Food Facts');
    error.status = 404;
    throw error;
  }

  return normalizeProduct(barcode, data.product);
}

async function analyzeWithAI(product, profile) {
  const aiUrl = process.env.AI_SERVICE_URL;
  if (!aiUrl) return null;

  try {
    const { data } = await axios.post(
      `${aiUrl}/analyze-product`,
      {
        barcode: product.barcode,
        product_name: product.name,
        ingredients: product.ingredients,
        allergens: product.allergens,
        nutrition: product.nutrition,
        profile,
      },
      { timeout: 10000 }
    );
    return data;
  } catch (error) {
    console.warn('[PureScan] AI service unavailable:', error.message);
    return null;
  }
}

function fallbackAnalyze(product, profile = {}) {
  const nutrition = product.nutrition || {};
  const warnings = [];
  let score = 100;

  if ((nutrition.sugar || 0) > 15) {
    score -= 22;
    warnings.push('High sugar per 100g');
  }
  if ((nutrition.salt || 0) > 1.5 || (nutrition.sodium || 0) > 0.6) {
    score -= 16;
    warnings.push('High salt or sodium');
  }
  if ((nutrition.saturatedFat || 0) > 5) {
    score -= 14;
    warnings.push('High saturated fat');
  }
  if ((nutrition.protein || 0) > 10) score += 8;
  if ((nutrition.fiber || 0) > 5) score += 8;

  const allergenHits = (profile.allergies || []).filter((allergy) =>
    product.allergens.some((item) => item.toLowerCase().includes(allergy.toLowerCase()))
  );
  if (allergenHits.length) {
    score -= 30;
    warnings.push(`Allergy conflict: ${allergenHits.join(', ')}`);
  }

  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const riskLevel = clamped >= 80 ? 'Healthy' : clamped >= 60 ? 'Moderate' : clamped >= 40 ? 'Use carefully' : 'Avoid often';

  return {
    health_score: clamped,
    risk_level: riskLevel,
    risky_ingredients: [],
    warnings,
    recommendation:
      clamped >= 80
        ? 'This product looks suitable for regular use based on available nutrition data.'
        : 'Use this product occasionally and compare it with lower sugar, lower sodium alternatives.',
  };
}

exports.analyzeBarcode = async (req, res, next) => {
  try {
    const { barcode } = req.params;
    const profile = req.body?.profile || {};

    let product = await Product.findOne({ barcode }).lean();
    if (!product) {
      const normalized = await fetchFromOpenFoodFacts(barcode);
      product = (await Product.create(normalized)).toObject();
    }

    const aiResult = (await analyzeWithAI(product, profile)) || fallbackAnalyze(product, profile);

    await Scan.create({
      barcode,
      product: product._id,
      profile,
      healthScore: aiResult.health_score,
      riskLevel: aiResult.risk_level,
      warnings: aiResult.warnings || [],
      recommendation: aiResult.recommendation,
    });

    res.json({ product, analysis: aiResult });
  } catch (error) {
    next(error);
  }
};

exports.searchProducts = async (req, res, next) => {
  try {
    const query = req.query.q?.trim();
    if (!query) return res.status(400).json({ error: 'Search query is required' });

    const { data } = await axios.get('https://world.openfoodfacts.org/cgi/search.pl', {
      params: {
        search_terms: query,
        search_simple: 1,
        action: 'process',
        json: 1,
        page_size: 8,
        fields: 'code,product_name,brands,image_front_url,nutriments',
      },
      timeout: 12000,
    });

    res.json({
      results: (data.products || []).map((item) => ({
        barcode: item.code,
        name: item.product_name || 'Unnamed product',
        brand: item.brands || 'Unknown brand',
        imageUrl: item.image_front_url,
      })),
    });
  } catch (error) {
    next(error);
  }
};

exports.getRecentScans = async (req, res, next) => {
  try {
    const scans = await Scan.find().sort({ createdAt: -1 }).limit(20).populate('product');
    res.json({ scans });
  } catch (error) {
    next(error);
  }
};
