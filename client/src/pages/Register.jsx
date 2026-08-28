import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    firstName: '', 
    lastName: '', 
    email: '', 
    password: '', 
    confirmPassword: '', 
    birthDate: '' 
  });
  const [kvkkAccepted, setKvkkAccepted] = useState(false);
  const [showKvkkModal, setShowKvkkModal] = useState(false);
  const [error, setError] = useState('');

  const validateForm = () => {
    // 6. Eksik bilgi kontrolü
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword || !formData.birthDate) {
      setError('Lütfen tüm alanları doldurunuz.');
      return false;
    }

    // 5. Mail formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Lütfen geçerli bir e-posta adresi giriniz.');
      return false;
    }

    // 2. Parola kuralları: en az 8 karakter, büyük-küçük harf ve rakam
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('Şifreniz en az 8 karakter uzunluğunda olmalı, en az bir büyük harf, bir küçük harf ve bir rakam içermelidir.');
      return false;
    }

    // 4. Parola tekrar kontrolü
    if (formData.password !== formData.confirmPassword) {
      setError('Girdiğiniz şifreler eşleşmiyor.');
      return false;
    }

    if (!kvkkAccepted) {
      setError('Lütfen KVKK aydınlatma metnini onaylayın.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }
    
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        birthDate: formData.birthDate
      };

      await api.post('/auth/register', payload);
      // Auto-login after successful registration
      const loginResponse = await api.post('/auth/login', { 
        email: formData.email, 
        password: formData.password 
      });
      localStorage.setItem('token', loginResponse.data.token);
      window.location.href = '/'; // redirect and reload state
    } catch (err) {
      if (!err.response) {
        setError('Sunucuya ulaşılamıyor (Backend çalışmıyor olabilir). Lütfen API terminalinizi kontrol edin.');
        return;
      }
      
      const serverError = err.response?.data?.message || err.response?.data;
      setError(typeof serverError === 'string' ? serverError : 'Kayıt işlemi başarısız. Aynı e-posta adresiyle kayıtlı bir kullanıcı olabilir.');
    }
  };

  return (
    <div className="container grid" style={{ placeItems: 'center', minHeight: '80vh' }}>
      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px', marginTop: '2rem', marginBottom: '2rem' }}>
        <h2 className="text-center mb-4">Kayıt Ol</h2>
        {error && <div className="error-text text-center mb-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '0.5rem' }}>{error}</div>}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Ad</label>
            <input type="text" className="form-control" 
              value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Soyad</label>
            <input type="text" className="form-control" 
              value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Doğum Tarihi</label>
            <input type="date" className="form-control" 
              value={formData.birthDate} onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">E-Posta</label>
            <input type="email" className="form-control" 
              value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Şifre</label>
            <input type="password" className="form-control" 
              value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Şifre Tekrar</label>
            <input type="password" className="form-control" 
              value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} />
          </div>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="checkbox-group" style={{ alignItems: 'flex-start', display: 'flex', gap: '0.5rem' }}>
              <input 
                type="checkbox" 
                checked={kvkkAccepted} 
                onChange={(e) => setKvkkAccepted(e.target.checked)} 
                style={{ marginTop: '0.2rem' }}
              />
              <span style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                <span 
                  onClick={() => setShowKvkkModal(true)}
                  style={{ color: 'var(--primary-color)', cursor: 'pointer', textDecoration: 'underline' }}>
                  KVKK Aydınlatma Metni
                </span>
                'ni okudum ve kabul ediyorum.
              </span>
            </label>
          </div>
          <button type="submit" className="btn btn-primary btn-block">Kayıt Ol</button>
        </form>
        <div className="text-center mt-4" style={{ fontSize: '0.875rem' }}>
          <p>Zaten hesabınız var mı? <Link to="/login">Giriş Yap</Link></p>
        </div>
      </div>

      {showKvkkModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, 
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="card" style={{ maxWidth: '500px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
            <h3 className="mb-4">KVKK Aydınlatma Metni</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Kişisel verileriniz, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında 
              kullanıcı hesabı oluşturulması ve diş sağlığı takibinizin yapılabilmesi amacıyla işlenmektedir. 
              Sisteme girdiğiniz sağlık verileri üçüncü şahıslarla paylaşılmayacaktır.
            </p>
            <button 
              onClick={() => setShowKvkkModal(false)} 
              className="btn btn-secondary mt-4" style={{ width: '100%' }}>Kapat</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Register;
