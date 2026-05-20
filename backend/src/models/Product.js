const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    barcode: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    brand: { type: String, default: 'Unknown brand' },
    imageUrl: String,
    category: String,
    ingredientsText: String,
    ingredients: [String],
    allergens: [String],
    nutrition: {
      calories: Number,
      sugar: Number,
      fat: Number,
      saturatedFat: Number,
      protein: Number,
      fiber: Number,
      salt: Number,
      sodium: Number,
    },
    source: { type: String, default: 'open_food_facts' },
    rawScore: Number,
    lastFetchedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', ProductSchema);
