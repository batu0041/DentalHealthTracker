using System;

namespace DentalHealthTracker.Core.DTOs
{
    public class CustomGoalDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Period { get; set; }
        public string Priority { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool HasRecords { get; set; }
    }
}
