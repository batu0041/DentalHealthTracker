using DentalHealthTracker.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace DentalHealthTracker.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<HabitRecord> HabitRecords { get; set; }
        public DbSet<Goal> Goals { get; set; }
        public DbSet<CustomGoal> CustomGoals { get; set; }
        public DbSet<CustomGoalRecord> CustomGoalRecords { get; set; }
        public DbSet<Achievement> Achievements { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(150);
                entity.HasIndex(e => e.Email).IsUnique(); // Email must be unique
                entity.Property(e => e.PasswordHash).IsRequired();
                entity.Property(e => e.FirstName).IsRequired().HasMaxLength(50);
                entity.Property(e => e.LastName).IsRequired().HasMaxLength(50);
            });

            // HabitRecord configuration
            modelBuilder.Entity<HabitRecord>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(d => d.User)
                    .WithMany(p => p.HabitRecords)
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Goal configuration
            modelBuilder.Entity<Goal>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(d => d.User)
                    .WithMany(p => p.Goals)
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Achievement configuration
            modelBuilder.Entity<Achievement>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(d => d.User)
                    .WithMany(p => p.Achievements)
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
