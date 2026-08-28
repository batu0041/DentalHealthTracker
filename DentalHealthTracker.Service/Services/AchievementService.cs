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
    public class AchievementService : IAchievementService
    {
        private readonly ApplicationDbContext _context;

        public AchievementService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<AchievementDto>> GetUserAchievementsAsync(int userId)
        {
            var achievements = await _context.Achievements
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.EarnedAt)
                .ToListAsync();

            // Group by type and return with count
            return achievements
                .GroupBy(a => a.Type)
                .Select(g => new AchievementDto
                {
                    Id = g.First().Id,
                    Type = g.Key,
                    Title = g.First().Title,
                    Description = g.First().Description,
                    Icon = g.First().Icon,
                    EarnedAt = g.Max(a => a.EarnedAt),
                    Count = g.Count()
                })
                .OrderByDescending(a => a.EarnedAt)
                .ToList();
        }

        public async Task<List<AchievementDto>> CheckAndAwardAsync(int userId)
        {
            var newAchievements = new List<Achievement>();
            var goal = await _context.Goals.FirstOrDefaultAsync(g => g.UserId == userId);
            if (goal == null) return new List<AchievementDto>();

            var today = DateTime.UtcNow.Date;
            var todayRecord = await _context.HabitRecords
                .FirstOrDefaultAsync(r => r.UserId == userId && r.RecordDate == today);

            if (todayRecord == null) return new List<AchievementDto>();

            // --- 1. DAILY STAR: Did user meet ALL daily goals today? ---
            // Daily flossing target = weekly / 7, daily mouthwash target = weekly / 7
            var dailyFlossingTarget = Math.Max(1, goal.TargetFlossingPerWeek / 7);
            var dailyMouthwashTarget = Math.Max(1, goal.TargetMouthwashPerWeek / 7);
            
            bool dailyGoalMet = todayRecord.BrushingCount >= goal.TargetBrushingPerDay
                && todayRecord.FlossingCount >= dailyFlossingTarget
                && todayRecord.MouthwashCount >= dailyMouthwashTarget;

            if (dailyGoalMet)
            {
                // Only award once per day
                var alreadyAwarded = await _context.Achievements
                    .AnyAsync(a => a.UserId == userId && a.Type == "daily_star" && a.EarnedAt.Date == today);
                if (!alreadyAwarded)
                {
                    newAchievements.Add(new Achievement
                    {
                        UserId = userId,
                        Type = "daily_star",
                        Title = "Günlük Yıldız",
                        Description = "Bugünkü tüm hedeflerini tamamladın!",
                        Icon = "🏅",
                        EarnedAt = DateTime.UtcNow
                    });
                }
            }

            // --- 2. WEEKLY ACHIEVEMENTS ---
            // Get start of current week (Monday)
            var dayOfWeek = (int)today.DayOfWeek;
            var weekStart = today.AddDays(-(dayOfWeek == 0 ? 6 : dayOfWeek - 1));
            var weekEnd = weekStart.AddDays(7);

            var weekRecords = await _context.HabitRecords
                .Where(r => r.UserId == userId && r.RecordDate >= weekStart && r.RecordDate < weekEnd)
                .ToListAsync();

            var weeklyBrushing = weekRecords.Sum(r => r.BrushingCount);
            var weeklyFlossing = weekRecords.Sum(r => r.FlossingCount);
            var weeklyMouthwash = weekRecords.Sum(r => r.MouthwashCount);
            var weeklyBrushingTarget = goal.TargetBrushingPerDay * 7;

            // Weekly Brushing Master
            if (weeklyBrushing >= weeklyBrushingTarget)
            {
                var alreadyAwarded = await _context.Achievements
                    .AnyAsync(a => a.UserId == userId && a.Type == "weekly_brushing" && a.EarnedAt >= weekStart);
                if (!alreadyAwarded)
                {
                    newAchievements.Add(new Achievement
                    {
                        UserId = userId,
                        Type = "weekly_brushing",
                        Title = "Haftalık Fırçalama Ustası",
                        Description = "Bu haftaki fırçalama hedefini tamamladın!",
                        Icon = "🥇",
                        EarnedAt = DateTime.UtcNow
                    });
                }
            }

            // Weekly Flossing Master
            if (weeklyFlossing >= goal.TargetFlossingPerWeek)
            {
                var alreadyAwarded = await _context.Achievements
                    .AnyAsync(a => a.UserId == userId && a.Type == "weekly_flossing" && a.EarnedAt >= weekStart);
                if (!alreadyAwarded)
                {
                    newAchievements.Add(new Achievement
                    {
                        UserId = userId,
                        Type = "weekly_flossing",
                        Title = "Haftalık Diş İpi Ustası",
                        Description = "Bu haftaki diş ipi hedefini tamamladın!",
                        Icon = "🥇",
                        EarnedAt = DateTime.UtcNow
                    });
                }
            }

            // Weekly Mouthwash Master
            if (weeklyMouthwash >= goal.TargetMouthwashPerWeek)
            {
                var alreadyAwarded = await _context.Achievements
                    .AnyAsync(a => a.UserId == userId && a.Type == "weekly_mouthwash" && a.EarnedAt >= weekStart);
                if (!alreadyAwarded)
                {
                    newAchievements.Add(new Achievement
                    {
                        UserId = userId,
                        Type = "weekly_mouthwash",
                        Title = "Haftalık Gargara Ustası",
                        Description = "Bu haftaki gargara hedefini tamamladın!",
                        Icon = "🥇",
                        EarnedAt = DateTime.UtcNow
                    });
                }
            }

            // Weekly Champion (all three weekly goals met)
            if (weeklyBrushing >= weeklyBrushingTarget && weeklyFlossing >= goal.TargetFlossingPerWeek && weeklyMouthwash >= goal.TargetMouthwashPerWeek)
            {
                var alreadyAwarded = await _context.Achievements
                    .AnyAsync(a => a.UserId == userId && a.Type == "weekly_champion" && a.EarnedAt >= weekStart);
                if (!alreadyAwarded)
                {
                    newAchievements.Add(new Achievement
                    {
                        UserId = userId,
                        Type = "weekly_champion",
                        Title = "Haftalık Şampiyon",
                        Description = "Bu hafta tüm hedeflerini tamamladın!",
                        Icon = "🏆",
                        EarnedAt = DateTime.UtcNow
                    });
                }
            }

            // --- 3. MONTHLY LEGEND ---
            var monthStart = new DateTime(today.Year, today.Month, 1);
            var monthEnd = monthStart.AddMonths(1);
            
            var monthRecords = await _context.HabitRecords
                .Where(r => r.UserId == userId && r.RecordDate >= monthStart && r.RecordDate < monthEnd)
                .ToListAsync();

            var daysInMonth = DateTime.DaysInMonth(today.Year, today.Month);
            var monthlyBrushing = monthRecords.Sum(r => r.BrushingCount);
            var monthlyFlossing = monthRecords.Sum(r => r.FlossingCount);
            var monthlyMouthwash = monthRecords.Sum(r => r.MouthwashCount);
            var monthlyBrushingTarget = goal.TargetBrushingPerDay * daysInMonth;
            var monthlyFlossingTarget = (int)Math.Ceiling(goal.TargetFlossingPerWeek * (daysInMonth / 7.0));
            var monthlyMouthwashTarget = (int)Math.Ceiling(goal.TargetMouthwashPerWeek * (daysInMonth / 7.0));

            if (monthlyBrushing >= monthlyBrushingTarget && monthlyFlossing >= monthlyFlossingTarget && monthlyMouthwash >= monthlyMouthwashTarget)
            {
                var alreadyAwarded = await _context.Achievements
                    .AnyAsync(a => a.UserId == userId && a.Type == "monthly_legend" && a.EarnedAt >= monthStart);
                if (!alreadyAwarded)
                {
                    newAchievements.Add(new Achievement
                    {
                        UserId = userId,
                        Type = "monthly_legend",
                        Title = "Aylık Efsane",
                        Description = "Bu ay tüm hedeflerini tamamladın!",
                        Icon = "💎",
                        EarnedAt = DateTime.UtcNow
                    });
                }
            }

            // --- 4. STREAK ACHIEVEMENTS ---
            // Calculate consecutive days where daily goals were met
            var allRecords = await _context.HabitRecords
                .Where(r => r.UserId == userId && r.RecordDate <= today)
                .OrderByDescending(r => r.RecordDate)
                .ToListAsync();

            int streak = 0;
            for (int i = 0; i < allRecords.Count; i++)
            {
                var expectedDate = today.AddDays(-i);
                var record = allRecords.FirstOrDefault(r => r.RecordDate.Date == expectedDate);
                if (record == null) break;

                var dft = Math.Max(1, goal.TargetFlossingPerWeek / 7);
                var dmt = Math.Max(1, goal.TargetMouthwashPerWeek / 7);

                if (record.BrushingCount >= goal.TargetBrushingPerDay
                    && record.FlossingCount >= dft
                    && record.MouthwashCount >= dmt)
                {
                    streak++;
                }
                else
                {
                    break;
                }
            }

            // 7-day streak
            if (streak >= 7)
            {
                var alreadyAwarded = await _context.Achievements
                    .AnyAsync(a => a.UserId == userId && a.Type == "streak_7" && a.EarnedAt >= today.AddDays(-7));
                if (!alreadyAwarded)
                {
                    newAchievements.Add(new Achievement
                    {
                        UserId = userId,
                        Type = "streak_7",
                        Title = "7 Gün Serisi",
                        Description = "7 gün üst üste tüm hedeflerini tamamladın!",
                        Icon = "⭐",
                        EarnedAt = DateTime.UtcNow
                    });
                }
            }

            // 30-day streak
            if (streak >= 30)
            {
                var alreadyAwarded = await _context.Achievements
                    .AnyAsync(a => a.UserId == userId && a.Type == "streak_30" && a.EarnedAt >= today.AddDays(-30));
                if (!alreadyAwarded)
                {
                    newAchievements.Add(new Achievement
                    {
                        UserId = userId,
                        Type = "streak_30",
                        Title = "30 Gün Serisi",
                        Description = "30 gün üst üste tüm hedeflerini tamamladın!",
                        Icon = "🔥",
                        EarnedAt = DateTime.UtcNow
                    });
                }
            }

            // Save new achievements
            if (newAchievements.Any())
            {
                _context.Achievements.AddRange(newAchievements);
                await _context.SaveChangesAsync();
            }

            return newAchievements.Select(a => new AchievementDto
            {
                Id = a.Id,
                Type = a.Type,
                Title = a.Title,
                Description = a.Description,
                Icon = a.Icon,
                EarnedAt = a.EarnedAt,
                Count = 1
            }).ToList();
        }
    }
}
