import os
from dotenv import load_dotenv
load_dotenv()

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from models.schemas import HealthResponse
from models.schemas import ProductAnalysisRequest, ProductAnalysisResponse
from services.detector import analyze_product

app = FastAPI(
    title="PureScan AI Service",
    description="Ingredient risk and nutrition scoring microservice",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", response_model=HealthResponse, tags=["System"])
async def health():
    return HealthResponse(
        status="ok",
        service="PureScan AI Service",
        version="1.0.0",
    )


@app.post("/analyze-product", response_model=ProductAnalysisResponse, tags=["PureScan"])
async def analyze_product_endpoint(payload: ProductAnalysisRequest):
    return analyze_product(payload)


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"error": str(exc), "type": type(exc).__name__},
    )


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("ENV", "production") == "development",
        log_level=os.getenv("LOG_LEVEL", "info"),
    )
