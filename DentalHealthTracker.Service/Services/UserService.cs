using System;
using System.Threading.Tasks;
using DentalHealthTracker.Core.DTOs;
using DentalHealthTracker.Core.Helpers;
using DentalHealthTracker.Data;
using DentalHealthTracker.Service.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DentalHealthTracker.Service.Services
{
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;

        public UserService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<UserProfileDto?> GetProfileAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return null;

            return new UserProfileDto
            {
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                BirthDate = user.BirthDate,
                Password = EncryptionHelper.Decrypt(user.PasswordHash) // Reversible encryption requirement
            };
        }

        public async Task<bool> UpdateProfileAsync(int userId, UserProfileDto profileDto)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            // Check if the new email belongs to someone else
            if (user.Email != profileDto.Email)
            {
                var emailExists = await _context.Users.AnyAsync(u => u.Email == profileDto.Email);
                if (emailExists)
                {
                    throw new Exception("DUPLICATE_EMAIL");
                }
            }

            user.FirstName = profileDto.FirstName;
            user.LastName = profileDto.LastName;
            user.Email = profileDto.Email;
            user.BirthDate = profileDto.BirthDate;
            user.PasswordHash = EncryptionHelper.Encrypt(profileDto.Password); // Re-encrypt

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
