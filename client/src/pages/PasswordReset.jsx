import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

function PasswordReset() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError('Lütfen e-posta adresinizi giriniz.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setMessage('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu kontrol edin.');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.';
      setError(errorMsg);
    }
    setLoading(false);
  };

  return (
    <div className="container grid" style={{ placeItems: 'center', minHeight: '80vh' }}>
      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 className="text-center mb-4">Şifremi Unuttum</h2>

        {error && <div className="error-text text-center mb-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '0.5rem' }}>{error}</div>}
        {message && <div style={{ color: 'var(--success)', marginBottom: '1rem', textAlign: 'center' }}>{message}</div>}

        {!message && (
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">E-Posta Adresiniz</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
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

export default PasswordReset;
