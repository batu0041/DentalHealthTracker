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
    public class HabitsController : ControllerBase
    {
        private readonly IHabitService _habitService;

        public HabitsController(IHabitService habitService)
        {
            _habitService = habitService;
        }

        private int GetUserId()
        {
            return int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
        }

        [HttpPost("record")]
        public async Task<IActionResult> AddRecord([FromBody] HabitRecordDto recordDto)
        {
            recordDto.UserId = GetUserId();
            var record = await _habitService.AddRecordAsync(recordDto);
            return Ok(record);
        }

        [HttpGet("records")]
        public async Task<IActionResult> GetRecords()
        {
            var userId = GetUserId();
            var records = await _habitService.GetRecordsByUserIdAsync(userId);
            return Ok(records);
        }

        [HttpPut("record/{id}")]
        public async Task<IActionResult> UpdateRecord(int id, [FromBody] HabitRecordDto recordDto)
        {
            var userId = GetUserId();
            var updatedRecord = await _habitService.UpdateRecordAsync(id, recordDto, userId);
            if (updatedRecord == null) return NotFound("Kayıt bulunamadı veya yetkiniz yok.");
            return Ok(updatedRecord);
        }

        [HttpDelete("record/{id}")]
        public async Task<IActionResult> DeleteRecord(int id)
        {
            var userId = GetUserId();
            var success = await _habitService.DeleteRecordAsync(id, userId);
            if (!success) return NotFound("Kayıt bulunamadı veya yetkiniz yok.");
            return Ok("Kayıt başarıyla silindi.");
        }

        [HttpGet("goal")]
        public async Task<IActionResult> GetGoal()
        {
            var userId = GetUserId();
            var goal = await _habitService.GetGoalByUserIdAsync(userId);
            if (goal == null) return NotFound();
            return Ok(goal);
        }

        [HttpPut("goal")]
        public async Task<IActionResult> UpdateGoal([FromBody] GoalDto goalDto)
        {
            goalDto.UserId = GetUserId();
            var updatedGoal = await _habitService.UpdateGoalAsync(goalDto);
            return Ok(updatedGoal);
        }
    }
}
