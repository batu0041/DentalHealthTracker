using System;

namespace DentalHealthTracker.Core.DTOs
{
    public class CustomGoalRecordDto
    {
        public int Id { get; set; }
        public int CustomGoalId { get; set; }
        public string CustomGoalTitle { get; set; }
        public DateTime Date { get; set; }
        public string Time { get; set; } // TimeSpan parsed to string "HH:mm"
        public int DurationMinutes { get; set; }
        public bool IsApplied { get; set; }
        public string Note { get; set; }
        public string ImageUrl { get; set; }
    }
}
