using System;

namespace DentalHealthTracker.Core.Entities
{
    public class HabitRecord
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public DateTime RecordDate { get; set; } = DateTime.UtcNow.Date;
        
        public int BrushingCount { get; set; }
        public int FlossingCount { get; set; }
        public int MouthwashCount { get; set; }
        
        public string? Notes { get; set; }

        // Navigation property
        [System.Text.Json.Serialization.JsonIgnore]
        public User? User { get; set; }
    }
}
