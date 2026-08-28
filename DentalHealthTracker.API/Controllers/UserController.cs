using System;
using System.Security.Claims;
using System.Threading.Tasks;
using DentalHealthTracker.Core.DTOs;
using DentalHealthTracker.Service.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DentalHealthTracker.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        private int GetUserId()
        {
            return int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = GetUserId();
            var profile = await _userService.GetProfileAsync(userId);
            if (profile == null) return NotFound("Kullanıcı bulunamadı.");
            return Ok(profile);
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UserProfileDto profileDto)
        {
            var userId = GetUserId();
            try
            {
                var success = await _userService.UpdateProfileAsync(userId, profileDto);
                if (!success) return NotFound("Kullanıcı bulunamadı.");
                return Ok(new { message = "Profiliniz başarıyla güncellendi." });
            }
            catch (Exception ex)
            {
                if (ex.Message == "DUPLICATE_EMAIL")
                {
                    return BadRequest(new { message = "Bu e-posta adresi başka bir kullanıcı tarafından kullanılmaktadır." });
                }
                return StatusCode(500, "Bir hata oluştu.");
            }
        }
    }
}
