"""
FastAPI Server for Anonymous Crime Reporting DApp — AI Crime Classifier.
Provides RESTful endpoints for real-time ML inference, category lookup,
risk evaluation, health checks, and retraining.
"""

import os
import sys
import sklearn
from typing import Dict, List, Any, Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Ensure project root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.data import CATEGORIES, CATEGORY_METADATA
from backend.classifier import engine, classify_crime
from backend.train import train_model


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan handler: ensures model is loaded/trained at startup."""
    # Engine initialization loads model or trains it if missing
    _ = engine.model
    yield


app = FastAPI(
    title="Anonymous Crime Reporting — AI Crime Classifier API",
    description=(
        "High-performance ML classification backend using Scikit-Learn. "
        "Predicts crime category (Theft, Assault, Cyber Crime, Fraud, Vandalism), "
        "assesses risk level (Low, Medium, High, Critical), and provides confidence scores."
    ),
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend applications (Vite default ports, production origins, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Pydantic Request & Response Schemas ────────────────────────────────────────

class ClassifyRequest(BaseModel):
    description: str = Field(
        ...,
        min_length=3,
        max_length=5000,
        description="The description of the crime incident to classify.",
        examples=["Someone smashed my car window and stole my laptop backpack from the backseat."]
    )


class ClassifyResponse(BaseModel):
    category: str = Field(..., description="Predicted crime category (Theft, Assault, Cyber Crime, Fraud, Vandalism)")
    category_id: int = Field(..., description="Numeric category ID aligned with on-chain smart contract")
    category_icon: str = Field(..., description="Emoji/icon representing the category")
    risk_level: str = Field(..., description="Evaluated risk level (Low, Medium, High, Critical)")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score between 0.0 and 1.0")
    probabilities: Dict[str, float] = Field(..., description="Probability distribution across all 5 categories")
    risk_factors: List[str] = Field(default_factory=list, description="Detected indicators and threat keywords")
    explanation: str = Field(..., description="Human-readable explanation of the classification")


class CategoryDetail(BaseModel):
    id: int
    name: str
    icon: str
    base_risk: str
    description: str
    examples: List[str]


class HealthResponse(BaseModel):
    status: str
    service: str
    model_loaded: bool
    categories: List[str]
    scikit_learn_version: str
    total_training_samples: Optional[int] = None


# ── Endpoints ──────────────────────────────────────────────────────────────────

@app.get("/", tags=["General"])
async def root():
    """Service status and quick links."""
    return {
        "service": "Anonymous Crime Reporting — AI Crime Classifier",
        "status": "online",
        "documentation": "/docs",
        "endpoints": {
            "classify": "POST /api/classify",
            "categories": "GET /api/categories",
            "health": "GET /api/health",
            "stats": "GET /api/stats",
            "retrain": "POST /api/retrain"
        }
    }


@app.get("/api/health", response_model=HealthResponse, tags=["Diagnostics"])
@app.get("/health", response_model=HealthResponse, tags=["Diagnostics"], include_in_schema=False)
async def health_check():
    """Health check verifying model status and Scikit-Learn environment."""
    meta = engine.metadata or {}
    return HealthResponse(
        status="healthy",
        service="ai-crime-classifier",
        model_loaded=engine.model is not None,
        categories=CATEGORIES,
        scikit_learn_version=sklearn.__version__,
        total_training_samples=meta.get("total_samples")
    )


@app.post("/api/classify", response_model=ClassifyResponse, tags=["Classification"])
@app.post("/classify", response_model=ClassifyResponse, tags=["Classification"], include_in_schema=False)
async def classify(request: ClassifyRequest):
    """
    Classify a crime description using the trained Scikit-Learn model.

    Returns:
    - **category**: The predicted category out of Theft, Assault, Cyber Crime, Fraud, Vandalism
    - **risk_level**: Low, Medium, High, or Critical
    - **confidence**: Score from 0.0 to 1.0 (calibrated probability)
    - **probabilities**: Full probability distribution for all categories
    - **risk_factors**: Detected threat keywords and modifiers
    - **explanation**: Rationale for the classification
    """
    try:
        result = classify_crime(request.description)
        return ClassifyResponse(**result)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Classification error: {str(e)}"
        )


@app.get("/api/categories", response_model=Dict[str, CategoryDetail], tags=["Categories"])
@app.get("/categories", response_model=Dict[str, CategoryDetail], tags=["Categories"], include_in_schema=False)
async def get_categories():
    """Get metadata for all supported crime categories."""
    output = {}
    for cat_name, meta in CATEGORY_METADATA.items():
        output[cat_name] = CategoryDetail(
            id=meta["id"],
            name=meta["label"],
            icon=meta["icon"],
            base_risk=meta["base_risk"],
            description=meta["description"],
            examples=meta["examples"]
        )
    return output


@app.get("/api/stats", tags=["Model Information"])
async def get_stats():
    """Get model training metrics, cross-validation scores, and feature keywords."""
    if not engine.metadata:
        engine.reload()
    return engine.metadata or {"status": "Model metadata pending."}


@app.post("/api/retrain", tags=["Training"])
async def retrain():
    """Trigger the Scikit-Learn training pipeline to retrain the model."""
    try:
        pipeline, metadata = train_model()
        engine.reload()
        return {
            "success": True,
            "message": "Model retrained and reloaded successfully.",
            "metrics": metadata.get("metrics"),
            "total_samples": metadata.get("total_samples")
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Retraining error: {str(e)}"
        )
