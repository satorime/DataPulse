from datetime import timedelta

import numpy as np
import pandas as pd
from rest_framework.decorators import api_view
from rest_framework.response import Response
from sklearn.linear_model import LinearRegression

from .models import HealthRecord


def _records_df(user_id: int) -> pd.DataFrame:
    qs = HealthRecord.objects.filter(user_id=user_id).order_by("date").values()
    return pd.DataFrame(list(qs))


@api_view(["GET"])
def predict_weight(request):
    df = _records_df(request.user.id)
    if df.empty:
        return Response({"error": "No health records found."}, status=400)

    weight_df = df[df["weight"].notna()].reset_index(drop=True)
    if len(weight_df) < 3:
        return Response({"error": "Need at least 3 weight records to predict."}, status=400)

    X = np.arange(len(weight_df)).reshape(-1, 1)
    y = weight_df["weight"].astype(float).values

    model = LinearRegression()
    model.fit(X, y)

    last_date = pd.to_datetime(weight_df["date"].iloc[-1])
    future_X = np.arange(len(weight_df), len(weight_df) + 7).reshape(-1, 1)
    predictions = model.predict(future_X)

    result = [
        {
            "date": (last_date + timedelta(days=i + 1)).strftime("%Y-%m-%dT%H:%M:%S"),
            "weight": round(float(w), 2),
        }
        for i, w in enumerate(predictions)
    ]

    return Response({"predictions": result})


@api_view(["GET"])
def health_summary(request):
    df = _records_df(request.user.id)
    if df.empty:
        return Response({"error": "No health records found."}, status=400)

    # Use the 30 most recent records
    df = df.tail(30)

    summary = {}
    fields = {
        "weight": "kg",
        "steps": "steps",
        "sleep_hours": "hrs",
        "heart_rate": "bpm",
    }

    for field, unit in fields.items():
        col = df[field].dropna().astype(float)
        if len(col) > 0:
            summary[field] = {
                "avg": round(col.mean(), 2),
                "min": round(col.min(), 2),
                "max": round(col.max(), 2),
                "latest": round(col.iloc[-1], 2),
                "unit": unit,
            }

    return Response(summary)


@api_view(["GET"])
def detect_anomalies(request):
    df = _records_df(request.user.id)
    if df.empty:
        return Response({"anomalies": []})

    df = df.tail(30)
    anomalies = []

    # Blood pressure check (high BP threshold: 140/90)
    bp_df = df[df["systolic_bp"].notna() & df["diastolic_bp"].notna()]
    for _, row in bp_df.iterrows():
        sys_bp = int(row["systolic_bp"])
        dia_bp = int(row["diastolic_bp"])
        if sys_bp > 140 or dia_bp > 90:
            anomalies.append({
                "date": pd.to_datetime(row["date"]).strftime("%Y-%m-%d"),
                "type": "High Blood Pressure",
                "value": f"{sys_bp}/{dia_bp} mmHg",
                "severity": "high" if sys_bp > 160 else "medium",
            })

    # Heart rate check (normal: 60–100 bpm)
    hr_df = df[df["heart_rate"].notna()]
    for _, row in hr_df.iterrows():
        hr = int(row["heart_rate"])
        if hr > 100 or hr < 50:
            anomalies.append({
                "date": pd.to_datetime(row["date"]).strftime("%Y-%m-%d"),
                "type": "Abnormal Heart Rate",
                "value": f"{hr} bpm",
                "severity": "high" if hr > 120 or hr < 40 else "medium",
            })

    # Sleep check (less than 5 hours)
    sleep_df = df[df["sleep_hours"].notna()]
    for _, row in sleep_df.iterrows():
        hrs = float(row["sleep_hours"])
        if hrs < 5:
            anomalies.append({
                "date": pd.to_datetime(row["date"]).strftime("%Y-%m-%d"),
                "type": "Low Sleep",
                "value": f"{hrs} hrs",
                "severity": "medium",
            })

    return Response({"anomalies": anomalies[:15]})
