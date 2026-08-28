using System;

namespace DentalHealthTracker.Core.Entities
{
    public class CustomGoalRecord
    {
        public int Id { get; set; }
        public int CustomGoalId { get; set; }
        public CustomGoal CustomGoal { get; set; }

        public DateTime Date { get; set; }
        public TimeSpan Time { get; set; }
        public int DurationMinutes { get; set; }
        public bool IsApplied { get; set; }
        public string Note { get; set; }
        public string ImageUrl { get; set; }
    }
}
