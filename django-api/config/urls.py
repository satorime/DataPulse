from django.urls import include, path

urlpatterns = [
    path('api/analytics/', include('analytics.urls')),
]
