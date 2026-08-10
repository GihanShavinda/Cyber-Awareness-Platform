import pandas as pd
import joblib
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

# 1. Load the data
df = pd.read_csv("training_data.csv")

FEATURES = [
    "avg_quiz_score",
    "quizzes_taken",
    "phishing_clicked",
    "phishing_reported",
    "incidents_reported",
]
TARGET = "risk_label"

X = df[FEATURES]
y = df[TARGET]

# 2. Split into training and test sets (80/20), keeping class balance
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f"Training on {len(X_train)} users, testing on {len(X_test)} users\n")

# 3. Train the XGBoost model
model = XGBClassifier(
    n_estimators=150,
    max_depth=4,
    learning_rate=0.1,
    objective="multi:softprob",  # multi-class with probabilities
    num_class=3,
    eval_metric="mlogloss",
    random_state=42,
)
model.fit(X_train, y_train)

# 4. Evaluate on the held-back test set
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print(f"Test accuracy: {accuracy:.1%}\n")
print("Per-class performance:")
print(classification_report(y_test, y_pred, target_names=["Low", "Medium", "High"]))
print("Confusion matrix (rows=actual, cols=predicted):")
print(confusion_matrix(y_test, y_pred))

# Show which features matter most
print("\nFeature importance:")
for feat, imp in sorted(zip(FEATURES, model.feature_importances_), key=lambda x: -x[1]):
    print(f"  {feat}: {imp:.3f}")

# 5. Save the trained model
joblib.dump(model, "risk_model.joblib")
print("\nModel saved to risk_model.joblib")