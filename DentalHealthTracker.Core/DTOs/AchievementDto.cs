using System;

namespace DentalHealthTracker.Core.DTOs
{
    public class AchievementDto
    {
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
        public DateTime EarnedAt { get; set; }
        public int Count { get; set; } // how many times earned
    }
}
