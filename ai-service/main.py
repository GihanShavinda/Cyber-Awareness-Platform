from fastapi import FastAPI

app = FastAPI(title="Cyber Awareness ML Service")

@app.get("/")
def root():
    return {"service": "ML Risk Prediction", "status": "running"}

@app.get("/health")
def health():
    return {"status": "ok"}