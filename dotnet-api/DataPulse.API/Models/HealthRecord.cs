namespace DataPulse.API.Models;

public class HealthRecord
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public decimal? Weight { get; set; }       // kg
    public int? SystolicBp { get; set; }       // mmHg
    public int? DiastolicBp { get; set; }      // mmHg
    public int? Steps { get; set; }
    public decimal? SleepHours { get; set; }
    public int? HeartRate { get; set; }        // bpm
    public string? Notes { get; set; }
    public DateTime Date { get; set; } = DateTime.UtcNow;
}
