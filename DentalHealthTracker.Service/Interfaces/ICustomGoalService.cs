using System.Collections.Generic;
using System.Threading.Tasks;
using DentalHealthTracker.Core.DTOs;

namespace DentalHealthTracker.Service.Interfaces
{
    public interface ICustomGoalService
    {
        Task<List<CustomGoalDto>> GetGoalsAsync(int userId);
        Task<CustomGoalDto> AddGoalAsync(int userId, CustomGoalDto dto);
        Task<bool> DeleteGoalAsync(int userId, int goalId);
        
        Task<List<CustomGoalRecordDto>> GetRecentRecordsAsync(int userId, int days = 7);
        Task<CustomGoalRecordDto> AddRecordAsync(int userId, CustomGoalRecordDto dto);
    }
}
