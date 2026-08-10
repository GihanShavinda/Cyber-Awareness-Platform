import numpy as np
import pandas as pd

# Reproducible randomness
np.random.seed(42)

N = 2000  # number of synthetic users

def make_user():
    # Realistic feature ranges
    avg_quiz_score = np.random.randint(0, 101)          # 0-100
    quizzes_taken = np.random.randint(0, 21)            # 0-20
    phishing_clicked = np.random.randint(0, 6)          # 0-5
    phishing_reported = np.random.randint(0, 6)         # 0-5
    incidents_reported = np.random.randint(0, 4)        # 0-3

    # --- Assign a "true" risk using security logic ---
    # Start from an inverted quiz score (low score = higher risk baseline)
    risk_points = (100 - avg_quiz_score) / 2  # 0-50

    # Clicking phishing raises risk; reporting lowers it
    risk_points += phishing_clicked * 12
    risk_points -= phishing_reported * 8
    risk_points -= incidents_reported * 5

    # Very low engagement (few quizzes) nudges risk up slightly
    if quizzes_taken < 3:
        risk_points += 10

    # Add noise so patterns aren't perfectly clean
    risk_points += np.random.normal(0, 8)

    # Convert to a 3-class label
    if risk_points < 20:
        label = 0  # low risk
    elif risk_points < 45:
        label = 1  # medium risk
    else:
        label = 2  # high risk

    return {
        "avg_quiz_score": avg_quiz_score,
        "quizzes_taken": quizzes_taken,
        "phishing_clicked": phishing_clicked,
        "phishing_reported": phishing_reported,
        "incidents_reported": incidents_reported,
        "risk_label": label,
    }

# Build the dataset
data = [make_user() for _ in range(N)]
df = pd.DataFrame(data)

# Save it
df.to_csv("training_data.csv", index=False)

# Quick summary so we can sanity-check
print(f"Generated {len(df)} users")
print("\nRisk label distribution:")
print(df["risk_label"].value_counts().sort_index())
print("\nFirst few rows:")
print(df.head())