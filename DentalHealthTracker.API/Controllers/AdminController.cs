using System.Linq;
using System.Threading.Tasks;
using DentalHealthTracker.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DentalHealthTracker.API.Controllers
{
    [Authorize(Roles = "Admin")]
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users
                .Select(u => new
                {
                    u.Id,
                    u.FirstName,
                    u.LastName,
                    u.Email,
                    u.IsAdmin,
                    u.IsBanned,
                    u.CreatedAt
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpPost("ban/{id}")]
        public async Task<IActionResult> ToggleBan(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound();

            if (user.IsAdmin)
                return BadRequest("Cannot ban an admin.");

            user.IsBanned = !user.IsBanned;
            await _context.SaveChangesAsync();

            return Ok(new { message = user.IsBanned ? "User banned successfully." : "User unbanned successfully.", isBanned = user.IsBanned });
        }
    }
}
