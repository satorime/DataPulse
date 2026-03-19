namespace DataPulse.API.DTOs;

public record HealthRecordDto(
    decimal? Weight,
    int? SystolicBp,
    int? DiastolicBp,
    int? Steps,
    decimal? SleepHours,
    int? HeartRate,
    string? Notes,
    DateTime? Date
);
