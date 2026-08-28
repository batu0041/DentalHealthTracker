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
    public class HabitService : IHabitService
    {
        private readonly ApplicationDbContext _context;

        public HabitService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<HabitRecord> AddRecordAsync(HabitRecordDto recordDto)
        {
            var recordDate = recordDto.RecordDate.Date;
            
            // Check if record already exists for this date
            var existingRecord = await _context.HabitRecords
                .FirstOrDefaultAsync(r => r.UserId == recordDto.UserId && r.RecordDate == recordDate);

            if (existingRecord != null)
            {
                // Update existing record
                existingRecord.BrushingCount = recordDto.BrushingCount;
                existingRecord.FlossingCount = recordDto.FlossingCount;
                existingRecord.MouthwashCount = recordDto.MouthwashCount;
                existingRecord.Notes = recordDto.Notes;
                await _context.SaveChangesAsync();
                return existingRecord;
            }

            var record = new HabitRecord
            {
                UserId = recordDto.UserId,
                RecordDate = recordDate,
                BrushingCount = recordDto.BrushingCount,
                FlossingCount = recordDto.FlossingCount,
                MouthwashCount = recordDto.MouthwashCount,
                Notes = recordDto.Notes
            };

            _context.HabitRecords.Add(record);
            await _context.SaveChangesAsync();

            return record;
        }

        public async Task<IEnumerable<HabitRecord>> GetRecordsByUserIdAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return new List<HabitRecord>();

            var startDate = user.CreatedAt.Date;
            var endDate = DateTime.UtcNow.Date;

            var existingRecords = await _context.HabitRecords
                .Where(r => r.UserId == userId)
                .ToListAsync();

            var existingDates = existingRecords.Select(r => r.RecordDate.Date).ToHashSet();
            var newRecords = new List<HabitRecord>();

            for (var date = startDate; date <= endDate; date = date.AddDays(1))
            {
                if (!existingDates.Contains(date))
                {
                    newRecords.Add(new HabitRecord
                    {
                        UserId = userId,
                        RecordDate = date,
                        BrushingCount = 0,
                        FlossingCount = 0,
                        MouthwashCount = 0,
                        Notes = "Veri girilmedi."
                    });
                }
            }

            if (newRecords.Any())
            {
                _context.HabitRecords.AddRange(newRecords);
                await _context.SaveChangesAsync();
                existingRecords.AddRange(newRecords);
            }

            return existingRecords.OrderByDescending(r => r.RecordDate);
        }

        public async Task<HabitRecord?> UpdateRecordAsync(int id, HabitRecordDto recordDto, int userId)
        {
            var record = await _context.HabitRecords.FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);
            if (record == null) return null;

            record.RecordDate = recordDto.RecordDate.Date;
            record.BrushingCount = recordDto.BrushingCount;
            record.FlossingCount = recordDto.FlossingCount;
            record.MouthwashCount = recordDto.MouthwashCount;
            record.Notes = recordDto.Notes;

            await _context.SaveChangesAsync();
            return record;
        }

        public async Task<bool> DeleteRecordAsync(int id, int userId)
        {
            var record = await _context.HabitRecords.FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);
            if (record == null) return false;

            _context.HabitRecords.Remove(record);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<Goal?> GetGoalByUserIdAsync(int userId)
        {
            return await _context.Goals
                .FirstOrDefaultAsync(g => g.UserId == userId);
        }

        public async Task<Goal> UpdateGoalAsync(GoalDto goalDto)
        {
            var goal = await _context.Goals
                .FirstOrDefaultAsync(g => g.UserId == goalDto.UserId);

            if (goal == null)
            {
                goal = new Goal { UserId = goalDto.UserId };
                _context.Goals.Add(goal);
            }

            goal.TargetBrushingPerDay = goalDto.TargetBrushingPerDay;
            goal.TargetFlossingPerWeek = goalDto.TargetFlossingPerWeek;
            goal.TargetMouthwashPerWeek = goalDto.TargetMouthwashPerWeek;

            await _context.SaveChangesAsync();

            return goal;
        }
    }
}
