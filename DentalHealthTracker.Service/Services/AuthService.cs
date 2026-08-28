using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using DentalHealthTracker.Core.DTOs;
using DentalHealthTracker.Core.Entities;
using DentalHealthTracker.Core.Helpers;
using DentalHealthTracker.Data;
using DentalHealthTracker.Service.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace DentalHealthTracker.Service.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<User?> RegisterAsync(UserRegisterDto registerDto)
        {
            // Check if email already exists
            if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
            {
                throw new Exception("Bu e-posta adresi zaten kullanımda.");
            }

            // Encrypt password (symmetric encryption per requirements)
            var passwordHash = EncryptionHelper.Encrypt(registerDto.Password);

            var user = new User
            {
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName,
                Email = registerDto.Email,
                PasswordHash = passwordHash,
                BirthDate = registerDto.BirthDate,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            
            // Generate default goals for the user
            var defaultGoal = new Goal
            {
                User = user,
                TargetBrushingPerDay = 2,
                TargetFlossingPerWeek = 7,
                TargetMouthwashPerWeek = 7
            };
            _context.Goals.Add(defaultGoal);
            
            await _context.SaveChangesAsync();

            // Send registration email
            _ = EmailService.SendRegistrationEmailAsync(user.Email, $"{user.FirstName} {user.LastName}");

            return user;
        }

        public async Task<string?> LoginAsync(UserLoginDto loginDto)
        {
            // Admin auto-login or seed check
            if (loginDto.Email == "admin@gmail.com" && loginDto.Password == "admin")
            {
                var adminUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == "admin@gmail.com");
                if (adminUser == null)
                {
                    adminUser = new User
                    {
                        FirstName = "Admin",
                        LastName = "User",
                        Email = "admin@gmail.com",
                        PasswordHash = EncryptionHelper.Encrypt("admin"),
                        IsAdmin = true,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.Users.Add(adminUser);
                    await _context.SaveChangesAsync();
                }
                return GenerateJwtToken(adminUser);
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginDto.Email);

            if (user == null)
                throw new Exception("USER_NOT_FOUND");

            if (user.IsBanned)
                throw new Exception("BANNED");

            try 
            {
                var decryptedPassword = EncryptionHelper.Decrypt(user.PasswordHash);
                if (decryptedPassword != loginDto.Password)
                    throw new Exception("INVALID_PASSWORD");
            }
            catch
            {
                // Fallback for previously BCrypt hashed passwords during testing, if necessary.
                // Since this is a new requirement, we'll just throw on failure to decrypt.
                throw new Exception("INVALID_PASSWORD");
            }

            return GenerateJwtToken(user);
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var key = Encoding.UTF8.GetBytes(jwtSettings["Key"] ?? "super_secret_key_change_me_in_production!");

            var claimsList = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}")
            };

            if (user.IsAdmin)
            {
                claimsList.Add(new Claim(ClaimTypes.Role, "Admin"));
            }

            var claims = claimsList.ToArray();

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddDays(Convert.ToDouble(jwtSettings["ExpireDays"] ?? "7")),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
                Issuer = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"]
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }

        public async Task<bool> ForgotPasswordAsync(string email, string clientUrl)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return true; // Pretend true to avoid email enumeration

            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtSettings = _configuration.GetSection("Jwt");
            var key = Encoding.UTF8.GetBytes(jwtSettings["Key"] ?? "super_secret_key_change_me_in_production!");

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim("id", user.Id.ToString()),
                    new Claim("purpose", "reset_password")
                }),
                Expires = DateTime.UtcNow.AddHours(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            var resetLink = $"{clientUrl}?token={tokenString}";
            await EmailService.SendPasswordResetEmailAsync(user.Email, resetLink);
            return true;
        }

        public async Task<bool> ResetPasswordAsync(string token, string newPassword)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var jwtSettings = _configuration.GetSection("Jwt");
                var key = Encoding.UTF8.GetBytes(jwtSettings["Key"] ?? "super_secret_key_change_me_in_production!");
                
                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                var jwtToken = (JwtSecurityToken)validatedToken;
                var purpose = jwtToken.Claims.First(x => x.Type == "purpose").Value;
                if (purpose != "reset_password") return false;

                var userId = int.Parse(jwtToken.Claims.First(x => x.Type == "id").Value);

                var user = await _context.Users.FindAsync(userId);
                if (user == null) return false;

                user.PasswordHash = EncryptionHelper.Encrypt(newPassword);
                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> VerifyEmailAsync(string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            return user != null;
        }

        public async Task<bool> ResetPasswordDirectAsync(string email, string newPassword)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return false;

            user.PasswordHash = EncryptionHelper.Encrypt(newPassword);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
