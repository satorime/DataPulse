from django.urls import path
from . import views

urlpatterns = [
    path("predict/weight/", views.predict_weight, name="predict-weight"),
    path("summary/", views.health_summary, name="health-summary"),
    path("anomalies/", views.detect_anomalies, name="detect-anomalies"),
]
