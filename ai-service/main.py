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

# Define the expected input shape
class UserFeatures(BaseModel):
    avg_quiz_score: float
    quizzes_taken: int
    phishing_clicked: int
    phishing_reported: int
    incidents_reported: int

@app.get("/")
def root():
    return {"service": "ML Risk Prediction", "status": "running"}

@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": model is not None}

@app.post("/predict")
def predict(features: UserFeatures):
    # Arrange features in the same order the model was trained on
    x = np.array([[
        features.avg_quiz_score,
        features.quizzes_taken,
        features.phishing_clicked,
        features.phishing_reported,
        features.incidents_reported,
    ]])

    # Predicted class + probability for each class
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
    }