from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np

app = FastAPI(title="Cyber Awareness ML Service")

# Allow the Node backend to call this service
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the trained model once at startup
model = joblib.load("risk_model.joblib")

LABELS = {0: "LOW", 1: "MEDIUM", 2: "HIGH"}

# Human-readable feature names for explanations
FEATURE_INFO = [
    ("avg_quiz_score", "Average quiz score"),
    ("quizzes_taken", "Quizzes taken"),
    ("phishing_clicked", "Phishing links clicked"),
    ("phishing_reported", "Phishing emails reported"),
    ("incidents_reported", "Incidents reported"),
]


# Define the expected input shape
class UserFeatures(BaseModel):
    avg_quiz_score: float
    quizzes_taken: int
    phishing_clicked: int
    phishing_reported: int
    incidents_reported: int


def build_explanation(feature_values):
    """
    Combine the model's global feature importances with this user's actual
    values to explain what drove their prediction.
    """
    importances = model.feature_importances_
    explanation = []

    for i, (key, label) in enumerate(FEATURE_INFO):
        value = feature_values[i]
        importance = float(importances[i])

        # Decide whether this factor is pushing risk up or down
        if key == "phishing_clicked":
            direction = "increases risk" if value > 0 else "neutral"
        elif key in ("phishing_reported", "incidents_reported", "quizzes_taken"):
            direction = "reduces risk" if value > 0 else "neutral"
        elif key == "avg_quiz_score":
            direction = "reduces risk" if value >= 60 else "increases risk"
        else:
            direction = "neutral"

        explanation.append({
            "factor": label,
            "value": value,
            "importance": round(importance, 3),
            "effect": direction,
        })

    # Sort by how much the model weights each factor
    explanation.sort(key=lambda x: -x["importance"])
    return explanation


@app.get("/")
def root():
    return {"service": "ML Risk Prediction", "status": "running"}


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": model is not None}


@app.post("/predict")
def predict(features: UserFeatures):
    feature_values = [
        features.avg_quiz_score,
        features.quizzes_taken,
        features.phishing_clicked,
        features.phishing_reported,
        features.incidents_reported,
    ]
    x = np.array([feature_values])

    pred = int(model.predict(x)[0])
    probs = model.predict_proba(x)[0]
    confidence = float(probs[pred])

    return {
        "predicted_risk": LABELS[pred],
        "confidence": round(confidence, 3),
        "probabilities": {
            "LOW": round(float(probs[0]), 3),
            "MEDIUM": round(float(probs[1]), 3),
            "HIGH": round(float(probs[2]), 3),
        },
        "explanation": build_explanation(feature_values),
    }