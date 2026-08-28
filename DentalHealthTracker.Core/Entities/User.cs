using System;
using System.Collections.Generic;

namespace DentalHealthTracker.Core.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public DateTime BirthDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsAdmin { get; set; } = false;
        public bool IsBanned { get; set; } = false;

        // Navigation properties
        public ICollection<HabitRecord> HabitRecords { get; set; } = new List<HabitRecord>();
        public ICollection<Goal> Goals { get; set; } = new List<Goal>();
        public ICollection<Achievement> Achievements { get; set; } = new List<Achievement>();
    }
}
