using System.Threading.Tasks;
using DentalHealthTracker.Core.DTOs;
using DentalHealthTracker.Service.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DentalHealthTracker.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserRegisterDto registerDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _authService.RegisterAsync(registerDto);

            if (user == null)
                return BadRequest(new { message = "Email already in use." });

            return Ok(new { message = "Registration successful" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDto loginDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var token = await _authService.LoginAsync(loginDto);
                if (token == null)
                    return Unauthorized(new { message = "Giriş başarısız." });
                return Ok(new { token });
            }
            catch (Exception ex)
            {
                if (ex.Message == "USER_NOT_FOUND")
                    return Unauthorized(new { message = "Kullanıcı bulunamadı. Lütfen kayıt olun." });
                if (ex.Message == "INVALID_PASSWORD")
                    return Unauthorized(new { message = "Hatalı parola girdiniz." });
                if (ex.Message == "BANNED")
                    return Unauthorized(new { message = "Hesabınız yasaklandı." });
                
                return Unauthorized(new { message = "Giriş başarısız." });
            }
        }

        public class ForgotPasswordDto { public string Email { get; set; } }
        public class ResetPasswordDto { public string Token { get; set; } public string NewPassword { get; set; } }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            try
            {
                var clientUrl = "http://localhost:5175/update-password";
                await _authService.ForgotPasswordAsync(dto.Email, clientUrl);
                return Ok(new { message = "Eğer kayıtlı ise sıfırlama bağlantısı gönderildi." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ForgotPassword hata: {ex.Message}");
                return StatusCode(500, new { message = $"E-posta gönderilemedi: {ex.Message}" });
            }
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            var result = await _authService.ResetPasswordAsync(dto.Token, dto.NewPassword);
            if (!result) return BadRequest(new { message = "Geçersiz veya süresi dolmuş token." });
            return Ok(new { message = "Şifreniz başarıyla güncellendi." });
        }

        public class VerifyEmailDto { public string Email { get; set; } }
        public class ResetPasswordDirectDto { public string Email { get; set; } public string NewPassword { get; set; } }

        [HttpPost("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailDto dto)
        {
            var exists = await _authService.VerifyEmailAsync(dto.Email);
            if (!exists) return NotFound(new { message = "Kullanıcı bilgisi bulunamadı." });
            return Ok(new { message = "Kullanıcı bulundu." });
        }

        [HttpPost("reset-password-direct")]
        public async Task<IActionResult> ResetPasswordDirect([FromBody] ResetPasswordDirectDto dto)
        {
            var result = await _authService.ResetPasswordDirectAsync(dto.Email, dto.NewPassword);
            if (!result) return BadRequest(new { message = "İşlem başarısız." });
            return Ok(new { message = "Şifreniz başarıyla güncellendi." });
        }
    }
}
