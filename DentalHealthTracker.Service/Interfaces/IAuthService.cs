using System.Threading.Tasks;
using DentalHealthTracker.Core.DTOs;
using DentalHealthTracker.Core.Entities;

namespace DentalHealthTracker.Service.Interfaces
{
    public interface IAuthService
    {
        Task<User?> RegisterAsync(UserRegisterDto registerDto);
        Task<string?> LoginAsync(UserLoginDto loginDto);
        Task<bool> ForgotPasswordAsync(string email, string clientUrl);
        Task<bool> ResetPasswordAsync(string token, string newPassword);
        Task<bool> VerifyEmailAsync(string email);
        Task<bool> ResetPasswordDirectAsync(string email, string newPassword);
    }
}
