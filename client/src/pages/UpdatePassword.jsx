import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../utils/api';

function UpdatePassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Geçersiz veya eksik sıfırlama bağlantısı.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError('Şifreniz en az 8 karakter uzunluğunda olmalı, en az bir büyük harf, bir küçük harf ve bir rakam içermelidir.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      setMessage('Şifreniz başarıyla güncellendi! Artık giriş yapabilirsiniz.');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Şifre güncellenirken bir hata oluştu.');
    }
    setLoading(false);
  };

  return (
    <div className="container grid" style={{ placeItems: 'center', minHeight: '80vh' }}>
      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 className="text-center mb-4">Yeni Şifre Belirle</h2>
        
        {error && <div className="error-text text-center mb-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '0.5rem' }}>{error}</div>}
        {message && <div style={{ color: 'var(--success)', marginBottom: '1rem', textAlign: 'center' }}>{message}</div>}
        
        {!message && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Yeni Şifre</label>
              <input
                type="password"
                className="form-control"
                required
                disabled={!token || loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Yeni Şifre (Tekrar)</label>
              <input
                type="password"
                className="form-control"
                required
                disabled={!token || loading}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={!token || loading}>
              {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
            </button>
          </form>
        )}
        <div className="text-center mt-4" style={{ fontSize: '0.875rem' }}>
          <Link to="/login">Giriş Ekranına Dön</Link>
        </div>
      </div>
    </div>
  );
}

export default UpdatePassword;
