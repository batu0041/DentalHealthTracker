using System;
using System.Collections.Generic;

namespace DentalHealthTracker.Core.Entities
{
    public class CustomGoal
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User User { get; set; }

        public string Title { get; set; }
        public string Description { get; set; }
        public string Period { get; set; } // Günde bir, altı ayda bir
        public string Priority { get; set; } // düşük, orta, yüksek
        public DateTime CreatedAt { get; set; }

        public ICollection<CustomGoalRecord> Records { get; set; }
    }
}
