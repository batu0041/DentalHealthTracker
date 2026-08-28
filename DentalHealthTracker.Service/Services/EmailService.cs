using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;

namespace DentalHealthTracker.Service.Services
{
    public class EmailService
    {
        public static async Task SendRegistrationEmailAsync(string toEmail, string fullName)
        {
            try
            {
                var smtpClient = new SmtpClient("smtp.gmail.com")
                {
                    Port = 587,
                    Credentials = new NetworkCredential("batuhanparlak82@gmail.com", "jucvtrvzqkeconax"),
                    EnableSsl = true,
                };

                var mailMessage = new MailMessage
                {
                    From = new MailAddress("batuhanparlak82@gmail.com"),
                    Subject = "Kayıt Başarılı - Dental Tracker",
                    Body = $"<h1>Hoş Geldiniz, {fullName}!</h1><p>Dental Tracker sistemine başarıyla kayıt oldunuz. Sağlıklı gülüşler dileriz.</p>",
                    IsBodyHtml = true,
                };

                mailMessage.To.Add(toEmail);
                await smtpClient.SendMailAsync(mailMessage);
                Console.WriteLine($"E-posta gönderildi: {toEmail}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"=== E-POSTA HATASI (Kayıt) ===");
                Console.WriteLine($"Hata: {ex.Message}");
                if (ex.InnerException != null)
                    Console.WriteLine($"Inner: {ex.InnerException.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                Console.WriteLine($"===============================");
            }
        }

        public static async Task SendPasswordResetEmailAsync(string toEmail, string resetLink)
        {
            try
            {
                var smtpClient = new SmtpClient("smtp.gmail.com")
                {
                    Port = 587,
                    Credentials = new NetworkCredential("batuhanparlak82@gmail.com", "jucvtrvzqkeconax"),
                    EnableSsl = true,
                };

                var mailMessage = new MailMessage
                {
                    From = new MailAddress("batuhanparlak82@gmail.com"),
                    Subject = "Şifre Sıfırlama - Dental Tracker",
                    Body = $"<h1>Şifre Sıfırlama Talebi</h1><p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p><p><a href='{resetLink}'>{resetLink}</a></p><p>Eğer bu talebi siz yapmadıysanız bu mesajı görmezden gelebilirsiniz.</p>",
                    IsBodyHtml = true,
                };

                mailMessage.To.Add(toEmail);
                await smtpClient.SendMailAsync(mailMessage);
                Console.WriteLine($"Sıfırlama e-postası gönderildi: {toEmail}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"=== E-POSTA HATASI (Sıfırlama) ===");
                Console.WriteLine($"Hata: {ex.Message}");
                if (ex.InnerException != null)
                    Console.WriteLine($"Inner: {ex.InnerException.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                Console.WriteLine($"====================================");
                throw; // Hatayı yukarı fırlat ki API'den de görelim
            }
        }
    }
}
