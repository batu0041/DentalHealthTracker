using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DentalHealthTracker.Core.DTOs;
using DentalHealthTracker.Core.Entities;
using DentalHealthTracker.Data;
using DentalHealthTracker.Service.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DentalHealthTracker.Service.Services
{
    public class CustomGoalService : ICustomGoalService
    {
        private readonly ApplicationDbContext _context;

        public CustomGoalService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<CustomGoalDto>> GetGoalsAsync(int userId)
        {
            var goals = await _context.CustomGoals
                .Include(g => g.Records)
                .Where(g => g.UserId == userId)
                .OrderByDescending(g => g.CreatedAt)
                .ToListAsync();

            return goals.Select(g => new CustomGoalDto
            {
                Id = g.Id,
                Title = g.Title,
                Description = g.Description,
                Period = g.Period,
                Priority = g.Priority,
                CreatedAt = g.CreatedAt,
                HasRecords = g.Records != null && g.Records.Any()
            }).ToList();
        }

        public async Task<CustomGoalDto> AddGoalAsync(int userId, CustomGoalDto dto)
        {
            var goal = new CustomGoal
            {
                UserId = userId,
                Title = dto.Title,
                Description = dto.Description,
                Period = dto.Period,
                Priority = dto.Priority,
                CreatedAt = DateTime.UtcNow
            };

            _context.CustomGoals.Add(goal);
            await _context.SaveChangesAsync();

            dto.Id = goal.Id;
            dto.CreatedAt = goal.CreatedAt;
            return dto;
        }

        public async Task<bool> DeleteGoalAsync(int userId, int goalId)
        {
            var goal = await _context.CustomGoals
                .Include(g => g.Records)
                .FirstOrDefaultAsync(g => g.Id == goalId && g.UserId == userId);

            if (goal == null) return false;

            if (goal.Records != null && goal.Records.Any())
            {
                _context.CustomGoalRecords.RemoveRange(goal.Records);
            }

            _context.CustomGoals.Remove(goal);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<CustomGoalRecordDto>> GetRecentRecordsAsync(int userId, int days = 7)
        {
            var since = DateTime.UtcNow.Date.AddDays(-days);

            var records = await _context.CustomGoalRecords
                .Include(r => r.CustomGoal)
                .Where(r => r.CustomGoal.UserId == userId && r.Date >= since)
                .OrderByDescending(r => r.Date).ThenByDescending(r => r.Time)
                .ToListAsync();

            return records.Select(r => new CustomGoalRecordDto
            {
                Id = r.Id,
                CustomGoalId = r.CustomGoalId,
                CustomGoalTitle = r.CustomGoal.Title,
                Date = r.Date,
                Time = r.Time.ToString(@"hh\:mm"),
                DurationMinutes = r.DurationMinutes,
                IsApplied = r.IsApplied,
                Note = r.Note,
                ImageUrl = r.ImageUrl
            }).ToList();
        }

        public async Task<CustomGoalRecordDto> AddRecordAsync(int userId, CustomGoalRecordDto dto)
        {
            // Verify ownership
            var goal = await _context.CustomGoals.FirstOrDefaultAsync(g => g.Id == dto.CustomGoalId && g.UserId == userId);
            if (goal == null) throw new Exception("UNAUTHORIZED");

            var record = new CustomGoalRecord
            {
                CustomGoalId = dto.CustomGoalId,
                Date = dto.Date,
                Time = TimeSpan.Parse(dto.Time),
                DurationMinutes = dto.DurationMinutes,
                IsApplied = dto.IsApplied,
                Note = dto.Note,
                ImageUrl = dto.ImageUrl
            };

            _context.CustomGoalRecords.Add(record);
            await _context.SaveChangesAsync();

            dto.Id = record.Id;
            dto.CustomGoalTitle = goal.Title;
            return dto;
        }
    }
}
