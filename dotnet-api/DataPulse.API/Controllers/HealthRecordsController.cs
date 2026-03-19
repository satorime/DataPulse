using System.Security.Claims;
using DataPulse.API.Data;
using DataPulse.API.DTOs;
using DataPulse.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DataPulse.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class HealthRecordsController : ControllerBase
{
    private readonly AppDbContext _db;

    public HealthRecordsController(AppDbContext db) => _db = db;

    private int GetUserId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var records = await _db.HealthRecords
            .Where(r => r.UserId == GetUserId())
            .OrderByDescending(r => r.Date)
            .ToListAsync();

        return Ok(records);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var record = await _db.HealthRecords
            .FirstOrDefaultAsync(r => r.Id == id && r.UserId == GetUserId());

        return record == null ? NotFound() : Ok(record);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] HealthRecordDto dto)
    {
        var record = new HealthRecord
        {
            UserId = GetUserId(),
            Weight = dto.Weight,
            SystolicBp = dto.SystolicBp,
            DiastolicBp = dto.DiastolicBp,
            Steps = dto.Steps,
            SleepHours = dto.SleepHours,
            HeartRate = dto.HeartRate,
            Notes = dto.Notes,
            Date = dto.Date ?? DateTime.UtcNow
        };

        _db.HealthRecords.Add(record);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = record.Id }, record);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] HealthRecordDto dto)
    {
        var record = await _db.HealthRecords
            .FirstOrDefaultAsync(r => r.Id == id && r.UserId == GetUserId());

        if (record == null) return NotFound();

        record.Weight = dto.Weight ?? record.Weight;
        record.SystolicBp = dto.SystolicBp ?? record.SystolicBp;
        record.DiastolicBp = dto.DiastolicBp ?? record.DiastolicBp;
        record.Steps = dto.Steps ?? record.Steps;
        record.SleepHours = dto.SleepHours ?? record.SleepHours;
        record.HeartRate = dto.HeartRate ?? record.HeartRate;
        record.Notes = dto.Notes ?? record.Notes;

        await _db.SaveChangesAsync();
        return Ok(record);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var record = await _db.HealthRecords
            .FirstOrDefaultAsync(r => r.Id == id && r.UserId == GetUserId());

        if (record == null) return NotFound();

        _db.HealthRecords.Remove(record);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
