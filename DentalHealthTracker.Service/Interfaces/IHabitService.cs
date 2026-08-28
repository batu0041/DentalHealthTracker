using System.Collections.Generic;
using System.Threading.Tasks;
using DentalHealthTracker.Core.DTOs;
using DentalHealthTracker.Core.Entities;

namespace DentalHealthTracker.Service.Interfaces
{
    public interface IHabitService
    {
        Task<HabitRecord> AddRecordAsync(HabitRecordDto recordDto);
        Task<HabitRecord?> UpdateRecordAsync(int id, HabitRecordDto recordDto, int userId);
        Task<bool> DeleteRecordAsync(int id, int userId);
        Task<IEnumerable<HabitRecord>> GetRecordsByUserIdAsync(int userId);
        Task<Goal?> GetGoalByUserIdAsync(int userId);
        Task<Goal> UpdateGoalAsync(GoalDto goalDto);
    }
}
