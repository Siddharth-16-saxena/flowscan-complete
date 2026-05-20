from pydantic import BaseModel, Field
from typing import List, Optional


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str


class Nutrition(BaseModel):
    calories: Optional[float] = None
    sugar: Optional[float] = None
    fat: Optional[float] = None
    saturatedFat: Optional[float] = None
    protein: Optional[float] = None
    fiber: Optional[float] = None
    salt: Optional[float] = None
    sodium: Optional[float] = None


class UserProfile(BaseModel):
    goal: Optional[str] = "general_health"
    allergies: List[str] = Field(default_factory=list)
    diet: Optional[str] = "balanced"
    condition: Optional[str] = "none"


class ProductAnalysisRequest(BaseModel):
    barcode: str
    product_name: Optional[str] = None
    ingredients: List[str] = Field(default_factory=list)
    allergens: List[str] = Field(default_factory=list)
    nutrition: Nutrition = Field(default_factory=Nutrition)
    profile: UserProfile = Field(default_factory=UserProfile)


class RiskyIngredient(BaseModel):
    ingredient: str
    risk_level: str
    reason: str


class ProductAnalysisResponse(BaseModel):
    health_score: int
    risk_level: str
    risky_ingredients: List[RiskyIngredient]
    warnings: List[str]
    positives: List[str]
    recommendation: str
