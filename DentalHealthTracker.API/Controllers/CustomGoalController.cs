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
    public class CustomGoalController : ControllerBase
    {
        private readonly ICustomGoalService _service;

        public CustomGoalController(ICustomGoalService service)
        {
            _service = service;
        }

        private int GetUserId()
        {
            return int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
        }

        [HttpGet]
        public async Task<IActionResult> GetGoals()
        {
            var goals = await _service.GetGoalsAsync(GetUserId());
            return Ok(goals);
        }

        [HttpPost]
        public async Task<IActionResult> AddGoal([FromBody] CustomGoalDto dto)
        {
            var goal = await _service.AddGoalAsync(GetUserId(), dto);
            return Ok(goal);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGoal(int id)
        {
            var success = await _service.DeleteGoalAsync(GetUserId(), id);
            if (!success) return NotFound();
            return Ok(new { message = "Silindi." });
        }

        [HttpGet("records")]
        public async Task<IActionResult> GetRecords()
        {
            var records = await _service.GetRecentRecordsAsync(GetUserId(), 7);
            return Ok(records);
        }

        [HttpPost("records")]
        public async Task<IActionResult> AddRecord([FromBody] CustomGoalRecordDto dto)
        {
            try
            {
                var record = await _service.AddRecordAsync(GetUserId(), dto);
                return Ok(record);
            }
            catch
            {
                return Unauthorized();
            }
        }
    }
}
