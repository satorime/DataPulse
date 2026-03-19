from rest_framework import serializers


class PredictionPointSerializer(serializers.Serializer):
    date = serializers.CharField()
    weight = serializers.FloatField()


class AnomalySerializer(serializers.Serializer):
    date = serializers.CharField()
    type = serializers.CharField()
    value = serializers.CharField()
    severity = serializers.CharField()


class SummaryStatSerializer(serializers.Serializer):
    avg = serializers.FloatField()
    min = serializers.FloatField()
    max = serializers.FloatField()
    latest = serializers.FloatField()
