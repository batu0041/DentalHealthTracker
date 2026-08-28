using System;

namespace DentalHealthTracker.Core.Entities
{
    public class Goal
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        
        public int TargetBrushingPerDay { get; set; } = 2;
        public int TargetFlossingPerWeek { get; set; } = 7;
        public int TargetMouthwashPerWeek { get; set; } = 7;

        // Navigation property
        public User? User { get; set; }
    }
}
