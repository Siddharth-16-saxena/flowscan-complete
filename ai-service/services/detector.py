from models.schemas import ProductAnalysisRequest, ProductAnalysisResponse, RiskyIngredient


RISKY_INGREDIENTS = {
    "aspartame": ("moderate", "Artificial sweetener; best limited for frequent consumption."),
    "acesulfame": ("moderate", "Artificial sweetener detected."),
    "high fructose corn syrup": ("high", "Concentrated sweetener associated with high sugar intake."),
    "corn syrup": ("moderate", "Added sweetener detected."),
    "sodium nitrite": ("high", "Processed meat preservative that should be limited."),
    "monosodium glutamate": ("moderate", "Flavour enhancer detected."),
    "msg": ("moderate", "Flavour enhancer detected."),
    "tartrazine": ("moderate", "Artificial colour detected."),
    "sunset yellow": ("moderate", "Artificial colour detected."),
    "palm oil": ("moderate", "Processed fat source detected."),
    "hydrogenated": ("high", "Hydrogenated fat may indicate trans-fat risk."),
    "maltodextrin": ("moderate", "Highly processed carbohydrate detected."),
    "butylated hydroxyanisole": ("high", "Synthetic preservative detected."),
    "bha": ("high", "Synthetic preservative detected."),
    "butylated hydroxytoluene": ("high", "Synthetic preservative detected."),
    "bht": ("high", "Synthetic preservative detected."),
}


def _value(number):
    return number if number is not None else 0


def _risk_level(score):
    if score >= 80:
        return "Healthy"
    if score >= 60:
        return "Moderate"
    if score >= 40:
        return "Use carefully"
    return "Avoid often"


def _ingredient_risks(ingredients):
    joined = " | ".join(ingredients).lower()
    risks = []
    for name, (level, reason) in RISKY_INGREDIENTS.items():
        if name in joined:
            risks.append(RiskyIngredient(ingredient=name, risk_level=level, reason=reason))
    return risks


def analyze_product(payload: ProductAnalysisRequest) -> ProductAnalysisResponse:
    nutrition = payload.nutrition
    profile = payload.profile
    score = 100
    warnings = []
    positives = []

    sugar = _value(nutrition.sugar)
    salt = _value(nutrition.salt)
    sodium = _value(nutrition.sodium)
    saturated_fat = _value(nutrition.saturatedFat)
    protein = _value(nutrition.protein)
    fiber = _value(nutrition.fiber)

    if sugar > 22:
        score -= 30
        warnings.append("Very high sugar per 100g.")
    elif sugar > 15:
        score -= 22
        warnings.append("High sugar per 100g.")
    elif sugar and sugar < 5:
        positives.append("Low sugar compared with many packaged foods.")

    if salt > 1.5 or sodium > 0.6:
        score -= 16
        warnings.append("High salt or sodium level.")

    if saturated_fat > 5:
        score -= 14
        warnings.append("High saturated fat level.")

    if protein >= 10:
        score += 8
        positives.append("Good protein content.")

    if fiber >= 5:
        score += 8
        positives.append("Good fiber content.")

    risky_ingredients = _ingredient_risks(payload.ingredients)
    for item in risky_ingredients:
        score -= 12 if item.risk_level == "high" else 7
        warnings.append(f"{item.ingredient.title()} detected: {item.reason}")

    allergen_text = " | ".join(payload.allergens + payload.ingredients).lower()
    allergy_hits = [a for a in profile.allergies if a.lower() in allergen_text]
    if allergy_hits:
        score -= 35
        warnings.append(f"Allergy conflict detected: {', '.join(allergy_hits)}.")

    if profile.condition == "diabetes" and sugar > 8:
        score -= 15
        warnings.append("Not ideal for diabetes-friendly preference due to sugar level.")

    if profile.condition == "hypertension" and (salt > 1 or sodium > 0.4):
        score -= 15
        warnings.append("Not ideal for low-sodium or hypertension-friendly preference.")

    if profile.goal == "muscle_gain" and protein < 8:
        warnings.append("Low protein for a muscle gain profile.")

    score = max(0, min(100, round(score)))
    risk_level = _risk_level(score)

    if score >= 80:
        recommendation = "Suitable choice based on available nutrition and ingredient data."
    elif score >= 60:
        recommendation = "Okay occasionally. Compare with lower sugar, lower sodium alternatives."
    elif score >= 40:
        recommendation = "Use carefully. This product has nutrition or ingredient concerns for your profile."
    else:
        recommendation = "Avoid frequent use. Choose a cleaner alternative with fewer risk flags."

    return ProductAnalysisResponse(
        health_score=score,
        risk_level=risk_level,
        risky_ingredients=risky_ingredients,
        warnings=list(dict.fromkeys(warnings)),
        positives=list(dict.fromkeys(positives)),
        recommendation=recommendation,
    )
