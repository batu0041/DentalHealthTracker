using System.Collections.Generic;
using System.Threading.Tasks;
using DentalHealthTracker.Core.DTOs;

namespace DentalHealthTracker.Service.Interfaces
{
    public interface IAchievementService
    {
        Task<List<AchievementDto>> GetUserAchievementsAsync(int userId);
        Task<List<AchievementDto>> CheckAndAwardAsync(int userId);
    }
}
