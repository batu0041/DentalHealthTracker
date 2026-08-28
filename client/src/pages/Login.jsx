import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 3. Mail adresi ve parola alanlarının dolu olup olmadığı ara yüzde kontrol edilmelidir.
    if (!formData.email && !formData.password) {
      setError('Lütfen e-posta ve şifre alanlarını doldurunuz.');
      return;
    }
    if (!formData.email) {
      setError('Lütfen e-posta alanını doldurunuz.');
      return;
    }
    if (!formData.password) {
      setError('Lütfen şifre alanını doldurunuz.');
      return;
    }
    
    setError(''); // clear previous errors

    try {
      const response = await api.post('/auth/login', formData);
      localStorage.setItem('token', response.data.token);
      
      // 6. Doğru ise kullanıcı uygulama ana sayfasına yönlendirilmelidir.
      window.location.href = '/'; 
    } catch (err) {
      // 5. Kayıt değilse veya parola doğru değilse farklı uyarı mesajları
      const errorMsg = err.response?.data?.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.';
      setError(errorMsg);
    }
  };

  return (
    <div className="container grid" style={{ placeItems: 'center', minHeight: '80vh' }}>
      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 className="text-center mb-4">Giriş Yap</h2>
        {error && <div className="error-text text-center mb-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '0.5rem' }}>{error}</div>}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">E-Posta</label>
            <input
              type="email"
              className="form-control"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Şifre</label>
            <input
              type="password"
              className="form-control"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block">Giriş Yap</button>
        </form>
        <div className="text-center mt-4" style={{ fontSize: '0.875rem' }}>
          <p>Hesabınız yok mu? <Link to="/register">Kayıt Ol</Link></p>
          <p className="mt-2"><Link to="/reset-password">Şifremi Unuttum</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Login;
