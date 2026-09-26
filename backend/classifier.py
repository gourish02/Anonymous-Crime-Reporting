"""
AI Crime Classifier & Risk Assessment Engine.
Provides high-performance inference using the trained Scikit-Learn model,
calculates category probabilities, confidence scores, and multi-factor risk levels.
"""

import json
import logging
import re
from pathlib import Path
from typing import Dict, List, Any, Optional

import joblib
import numpy as np

import sys
_parent_dir = str(Path(__file__).resolve().parent.parent)
if _parent_dir not in sys.path:
    sys.path.insert(0, _parent_dir)

try:
    from backend.data import CATEGORIES, CATEGORY_METADATA
    from backend.train import (
        MODEL_PATH,
        META_PATH,
        CRITICAL_INDICATORS,
        HIGH_INDICATORS,
        LOW_INDICATORS,
        train_model
    )
except ImportError:
    from data import CATEGORIES, CATEGORY_METADATA
    from train import (
        MODEL_PATH,
        META_PATH,
        CRITICAL_INDICATORS,
        HIGH_INDICATORS,
        LOW_INDICATORS,
        train_model
    )

logger = logging.getLogger("ai_crime_classifier.inference")

BASE_CATEGORY_RISK_SCORES: Dict[str, int] = {
    "Assault": 3,      # High baseline (physical harm danger)
    "Cyber Crime": 3,  # High baseline (data/extortion/infrastructure harm)
    "Fraud": 2,        # Medium baseline (financial harm)
    "Theft": 2,        # Medium baseline (property loss)
    "Vandalism": 1,    # Low baseline (property defacement)
}


class CrimeClassifierEngine:
    """Inference engine encapsulating Scikit-Learn model and risk assessment."""

    def __init__(self):
        self.model = None
        self.metadata = None
        self._load_or_train()

    def _load_or_train(self):
        """Loads existing model from disk, or automatically trains if not present."""
        if not MODEL_PATH.exists() or not META_PATH.exists():
            logger.info("Model not found on disk. Automatically running training pipeline...")
            self.model, self.metadata = train_model()
        else:
            try:
                self.model = joblib.load(MODEL_PATH)
                with open(META_PATH, "r", encoding="utf-8") as f:
                    self.metadata = json.load(f)
                logger.info(f"Loaded model from {MODEL_PATH}")
            except Exception as e:
                logger.warning(f"Failed to load model: {e}. Retraining...")
                self.model, self.metadata = train_model()

    def reload(self):
        """Reloads the model from disk or retrains."""
        self._load_or_train()

    def _assess_risk(
        self,
        text: str,
        category: str,
        confidence: float
    ) -> Dict[str, Any]:
        """
        Calculates multi-factor risk level based on:
        - Base category severity (Assault > Cyber Crime > Fraud > Theft > Vandalism)
        - Lexical urgency & danger indicators (weapons, physical injury, extortion, infrastructure)
        - High confidence weighting
        """
        text_lower = text.lower()
        words = set(re.findall(r"\b[a-z0-9\-]+\b", text_lower))

        detected_critical = [w for w in CRITICAL_INDICATORS if re.search(r"\b" + re.escape(w) + r"\b", text_lower)]
        detected_high = [w for w in HIGH_INDICATORS if re.search(r"\b" + re.escape(w) + r"\b", text_lower)]
        detected_low = [w for w in LOW_INDICATORS if re.search(r"\b" + re.escape(w) + r"\b", text_lower)]

        score = BASE_CATEGORY_RISK_SCORES.get(category, 2)

        # Critical indicators add 2 risk points each (capped at +3)
        if detected_critical:
            score += min(3, len(detected_critical) * 2)

        # High indicators add 1 risk point each (capped at +2)
        if detected_high:
            score += min(2, len(detected_high))

        # Low indicators reduce risk slightly if no critical keywords present
        if detected_low and not detected_critical and not detected_high:
            score = max(1, score - 1)

        # High confidence boost if borderline
        if confidence > 0.90 and score == 2 and category in ["Assault", "Cyber Crime"]:
            score = 3

        # Map integer score to Risk Level
        if score >= 4 or len(detected_critical) >= 1 and category == "Assault":
            risk_level = "Critical"
        elif score == 3:
            risk_level = "High"
        elif score == 2:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        # Collect detected factors
        all_factors = detected_critical + detected_high
        if not all_factors and detected_low:
            all_factors = detected_low

        return {
            "risk_level": risk_level,
            "risk_score": score,
            "risk_factors": list(dict.fromkeys(all_factors))[:6],  # unique top 6
        }

    def classify(self, description: str) -> Dict[str, Any]:
        """
        Main classification function.
        Takes crime description and outputs:
        - category: Crime category (Theft, Assault, Cyber Crime, Fraud, Vandalism)
        - risk_level: Risk level (Low, Medium, High, Critical)
        - confidence: Confidence score (float 0.0 to 1.0)
        - probabilities: Breakdown across all 5 categories
        - risk_factors: Detected threat indicators
        - explanation: Transparent rationale
        """
        clean_text = description.strip()
        if not clean_text:
            return {
                "category": "Theft",
                "risk_level": "Low",
                "confidence": 0.0,
                "probabilities": {cat: 0.2 for cat in CATEGORIES},
                "risk_factors": [],
                "explanation": "Empty description provided."
            }

        if self.model is None:
            self._load_or_train()

        # Scikit-Learn predict & predict_proba
        probabilities_raw = self.model.predict_proba([clean_text])[0]
        classes = self.model.classes_

        # Temperature scaling (T=0.5) for intuitive, well-calibrated confidence in a 5-class distribution
        T = 0.5
        logits = np.log(np.maximum(probabilities_raw, 1e-12)) / T
        exp_logits = np.exp(logits - np.max(logits))
        calibrated_probs = exp_logits / np.sum(exp_logits)

        prob_dict: Dict[str, float] = {}
        for c, p in zip(classes, calibrated_probs):
            prob_dict[c] = round(float(p), 4)

        # Fill any missing categories with 0.0
        for cat in CATEGORIES:
            if cat not in prob_dict:
                prob_dict[cat] = 0.0

        # Best category and confidence score
        best_category = str(self.model.predict([clean_text])[0])
        confidence = float(prob_dict.get(best_category, max(calibrated_probs)))

        # Risk assessment
        risk_data = self._assess_risk(clean_text, best_category, confidence)
        risk_level = risk_data["risk_level"]
        risk_factors = risk_data["risk_factors"]

        # Human-readable explanation
        pct = round(confidence * 100, 1)
        factor_str = f" Key indicators: {', '.join(risk_factors)}." if risk_factors else ""
        explanation = (
            f"Classified as {best_category} with {pct}% confidence. "
            f"Evaluated as {risk_level} risk.{factor_str}"
        )

        cat_meta = CATEGORY_METADATA.get(best_category, {})

        return {
            "category": best_category,
            "category_id": cat_meta.get("id", 1),
            "category_icon": cat_meta.get("icon", "📋"),
            "risk_level": risk_level,
            "confidence": round(confidence, 4),
            "probabilities": prob_dict,
            "risk_factors": risk_factors,
            "explanation": explanation,
        }


# Global singleton instance
engine = CrimeClassifierEngine()


def classify_crime(description: str) -> Dict[str, Any]:
    """Helper entry point for API routes."""
    return engine.classify(description)
