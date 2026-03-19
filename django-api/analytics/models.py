from django.db import models


class HealthRecord(models.Model):
    """
    Read-only mirror of the health_records table created by the .NET API.
    managed=False means Django won't create or alter this table.
    Column names match EFCore.NamingConventions snake_case output.
    """
    user_id = models.IntegerField()
    weight = models.DecimalField(max_digits=6, decimal_places=2, null=True)
    systolic_bp = models.IntegerField(null=True)
    diastolic_bp = models.IntegerField(null=True)
    steps = models.IntegerField(null=True)
    sleep_hours = models.DecimalField(max_digits=4, decimal_places=2, null=True)
    heart_rate = models.IntegerField(null=True)
    notes = models.TextField(null=True, blank=True)
    date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'health_records'
