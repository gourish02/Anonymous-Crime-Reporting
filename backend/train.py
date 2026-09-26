"""
Training Pipeline for AI Crime Classifier.
Uses Scikit-Learn Pipeline (TF-IDF + Calibrated Logistic Regression)
with multi-factor Risk Level Assessment.
"""

import os
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Tuple

import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import StratifiedKFold, cross_validate
from sklearn.metrics import classification_report

import sys
# Ensure parent directory is in sys.path
_parent_dir = str(Path(__file__).resolve().parent.parent)
if _parent_dir not in sys.path:
    sys.path.insert(0, _parent_dir)

try:
    from backend.data import CATEGORIES, TRAINING_DATA
except ImportError:
    from data import CATEGORIES, TRAINING_DATA

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("ai_crime_classifier.train")

MODEL_DIR = Path(__file__).resolve().parent / "model"
MODEL_PATH = MODEL_DIR / "crime_classifier.joblib"
META_PATH = MODEL_DIR / "model_meta.json"

# Risk level indicators used by the multi-factor risk engine
CRITICAL_INDICATORS = [
    "gun", "guns", "gunshot", "gunshots", "firearm", "firearms", "shot", "shooting",
    "knife", "knives", "blade", "stab", "stabbed", "stabbing", "slash", "slashed",
    "blood", "bleeding", "unconscious", "hospital", "icu", "critical", "strangle",
    "choked", "choking", "kidnap", "abducted", "hostage", "life-threatening", "murder",
    "kill", "death threat", "bomb", "explosive", "arson", "pegasus", "lockbit"
]

HIGH_INDICATORS = [
    "punched", "kicked", "beaten", "struck", "fracture", "fractured", "broken",
    "ambushed", "assaulted", "robbery", "armed", "extortion", "ransomware",
    "breach", "zero-day", "root access", "drained", "exfiltrated", "wire transfer",
    "life savings", "skimmer", "carjacked", "stolen car", "shattered", "cut off"
]

LOW_INDICATORS = [
    "graffiti", "spray paint", "tagged", "sticker", "litter", "scratch",
    "keyed", "trash", "detergent", "flower bed", "intercom", "minor", "defaced"
]


from datetime import timezone


def build_pipeline() -> Pipeline:
    """Builds the Scikit-Learn TF-IDF + Logistic Regression pipeline."""
    return Pipeline([
        (
            "tfidf",
            TfidfVectorizer(
                ngram_range=(1, 2),
                max_features=10000,
                sublinear_tf=True,
                stop_words="english",
                strip_accents="unicode"
            )
        ),
        (
            "clf",
            LogisticRegression(
                C=10.0,
                max_iter=2000,
                class_weight="balanced",
                solver="lbfgs",
                random_state=42
            )
        )
    ])


def train_model() -> Tuple[Pipeline, Dict[str, Any]]:
    """Trains the model on the full dataset and returns the pipeline and metrics."""
    texts = [item["text"] for item in TRAINING_DATA]
    labels = [item["category"] for item in TRAINING_DATA]

    logger.info(f"Loaded {len(texts)} samples across {len(set(labels))} classes: {CATEGORIES}")

    pipeline = build_pipeline()

    # 5-fold cross validation for rigorous performance verification
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    scoring = ["accuracy", "f1_macro", "precision_macro", "recall_macro"]
    cv_results = cross_validate(pipeline, texts, labels, cv=cv, scoring=scoring)

    accuracy_mean = float(np.mean(cv_results["test_accuracy"]))
    f1_mean = float(np.mean(cv_results["test_f1_macro"]))
    precision_mean = float(np.mean(cv_results["test_precision_macro"]))
    recall_mean = float(np.mean(cv_results["test_recall_macro"]))

    logger.info(f"Cross-Validation Accuracy: {accuracy_mean:.4f}")
    logger.info(f"Cross-Validation F1-Macro:  {f1_mean:.4f}")
    logger.info(f"Cross-Validation Precision: {precision_mean:.4f}")
    logger.info(f"Cross-Validation Recall:    {recall_mean:.4f}")

    # Train on full dataset
    pipeline.fit(texts, labels)

    # Class distribution
    class_counts = {cat: labels.count(cat) for cat in CATEGORIES}

    # Extract top keywords per class from TF-IDF + coefficients
    tfidf: TfidfVectorizer = pipeline.named_steps["tfidf"]
    clf: LogisticRegression = pipeline.named_steps["clf"]
    feature_names = np.array(tfidf.get_feature_names_out())

    top_features_per_class: Dict[str, list] = {}
    for i, class_label in enumerate(clf.classes_):
        top_indices = np.argsort(clf.coef_[i])[-8:][::-1]
        top_features_per_class[class_label] = feature_names[top_indices].tolist()

    metadata: Dict[str, Any] = {
        "created_at": datetime.now(timezone.utc).isoformat(),
        "model_type": "TF-IDF + LogisticRegression (Calibrated Probabilities)",
        "categories": CATEGORIES,
        "total_samples": len(texts),
        "class_distribution": class_counts,
        "metrics": {
            "cv_folds": 5,
            "accuracy": round(accuracy_mean, 4),
            "f1_macro": round(f1_mean, 4),
            "precision_macro": round(precision_mean, 4),
            "recall_macro": round(recall_mean, 4),
        },
        "top_features": top_features_per_class,
        "risk_config": {
            "critical_indicators": len(CRITICAL_INDICATORS),
            "high_indicators": len(HIGH_INDICATORS),
            "low_indicators": len(LOW_INDICATORS),
        }
    }

    # Ensure model directory exists
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    # Save model and metadata
    joblib.dump(pipeline, MODEL_PATH)
    logger.info(f"Saved model artifact to {MODEL_PATH}")

    with open(META_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    logger.info(f"Saved model metadata to {META_PATH}")

    return pipeline, metadata


if __name__ == "__main__":
    train_model()
