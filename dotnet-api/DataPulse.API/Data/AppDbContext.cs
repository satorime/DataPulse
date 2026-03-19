using DataPulse.API.Models;
using Microsoft.EntityFrameworkCore;

namespace DataPulse.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<HealthRecord> HealthRecords => Set<HealthRecord>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<HealthRecord>()
            .HasOne(h => h.User)
            .WithMany(u => u.HealthRecords)
            .HasForeignKey(h => h.UserId);
    }
}
