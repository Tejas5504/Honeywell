"""
ML Model API endpoints.
Provides model training, metrics retrieval, and anomaly prediction.
"""
from fastapi import APIRouter, Depends, HTTPException

from app.database import get_db
from app.services.ml_pipeline import train_model, predict_anomalies
from app.utils.helpers import serialize_doc

router = APIRouter(prefix="/api/v1/model", tags=["Model"])


@router.post("/train")
async def train(db=Depends(get_db)):
    """
    Train the Isolation Forest model on current access log data.
    Evaluates against ground-truth labels and stores performance metrics.
    """
    metrics = await train_model(db)
    if "error" in metrics:
        raise HTTPException(status_code=400, detail=metrics["error"])

    return {
        "status": "completed",
        "message": f"Model trained on {metrics.get('training_samples', 0)} samples",
        "metrics": {
            "model_type": metrics.get("model_type", "IsolationForest"),
            "accuracy": metrics.get("accuracy", 0),
            "precision": metrics.get("precision", 0),
            "recall": metrics.get("recall", 0),
            "f1_score": metrics.get("f1_score", 0),
            "confusion_matrix": metrics.get("confusion_matrix", []),
            "feature_importances": metrics.get("feature_importances", {}),
            "training_samples": metrics.get("training_samples", 0),
            "trained_at": str(metrics.get("trained_at", "")),
            "hyperparameters": metrics.get("hyperparameters", {}),
        },
    }


@router.get("/metrics")
async def get_metrics(db=Depends(get_db)):
    """Get latest model performance metrics."""
    cursor = db.model_metrics.find().sort("trained_at", -1).limit(1)
    metrics_list = await cursor.to_list(length=1)

    if not metrics_list:
        return {
            "model_type": "IsolationForest",
            "accuracy": 0,
            "precision": 0,
            "recall": 0,
            "f1_score": 0,
            "confusion_matrix": [[0, 0], [0, 0]],
            "feature_importances": {},
            "training_samples": 0,
            "trained_at": None,
            "hyperparameters": {},
        }

    return serialize_doc(metrics_list[0])


@router.post("/predict")
async def predict(db=Depends(get_db)):
    """
    Run anomaly detection inference using the trained model.
    Creates alerts for all detected anomalies with risk scores and explanations.
    """
    result = await predict_anomalies(db)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    return result
