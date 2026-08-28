namespace DentalHealthTracker.Core.DTOs
{
    public class GoalDto
    {
        public int UserId { get; set; }
        public int TargetBrushingPerDay { get; set; }
        public int TargetFlossingPerWeek { get; set; }
        public int TargetMouthwashPerWeek { get; set; }
    }
}
