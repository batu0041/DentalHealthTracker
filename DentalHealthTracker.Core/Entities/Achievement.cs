using System;

namespace DentalHealthTracker.Core.Entities
{
    public class Achievement
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Type { get; set; } = string.Empty; // daily_star, weekly_brushing, weekly_flossing, weekly_mouthwash, weekly_champion, monthly_legend, streak_7, streak_30
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty; // emoji
        public DateTime EarnedAt { get; set; } = DateTime.UtcNow;

        [System.Text.Json.Serialization.JsonIgnore]
        public User? User { get; set; }
    }
}
