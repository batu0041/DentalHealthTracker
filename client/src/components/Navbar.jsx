import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch {
        localStorage.removeItem('token');
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="navbar animate-fade-in">
      <div className="container">
        <Link to="/" className="nav-brand">
          🦷 Dental Tracker
        </Link>
        <div className="nav-links">
          {user ? (
            <>
              <Link to="/" className="nav-link">Dashboard</Link>
              <Link to="/health" className="nav-link">Kayıtlarım</Link>
              {user.role === 'Admin' && (
                <Link to="/admin" className="nav-link" style={{ color: '#D97706', fontWeight: 'bold' }}>Admin Paneli</Link>
              )}
              <Link to="/profile" className="nav-link">Profil ({user.unique_name})</Link>
              <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.875rem' }}>
                Çıkış Yap
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Giriş Yap</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.875rem' }}>Kayıt Ol</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
