using System.Security.Claims;
using System.Threading.Tasks;
using DentalHealthTracker.Service.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DentalHealthTracker.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class AchievementController : ControllerBase
    {
        private readonly IAchievementService _achievementService;

        public AchievementController(IAchievementService achievementService)
        {
            _achievementService = achievementService;
        }

        private int GetUserId()
        {
            return int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
        }

        [HttpGet]
        public async Task<IActionResult> GetAchievements()
        {
            var userId = GetUserId();
            var achievements = await _achievementService.GetUserAchievementsAsync(userId);
            return Ok(achievements);
        }

        [HttpPost("check")]
        public async Task<IActionResult> CheckAchievements()
        {
            var userId = GetUserId();
            var newAchievements = await _achievementService.CheckAndAwardAsync(userId);
            return Ok(newAchievements);
        }
    }
}
