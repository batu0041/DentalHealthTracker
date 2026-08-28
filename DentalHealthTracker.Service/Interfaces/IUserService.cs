using System.Threading.Tasks;
using DentalHealthTracker.Core.DTOs;

namespace DentalHealthTracker.Service.Interfaces
{
    public interface IUserService
    {
        Task<UserProfileDto?> GetProfileAsync(int userId);
        Task<bool> UpdateProfileAsync(int userId, UserProfileDto profileDto);
    }
}
