using System;

namespace DentalHealthTracker.Core.DTOs
{
    public class HabitRecordDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public DateTime RecordDate { get; set; }
        public int BrushingCount { get; set; }
        public int FlossingCount { get; set; }
        public int MouthwashCount { get; set; }
        public string? Notes { get; set; }
    }
}
