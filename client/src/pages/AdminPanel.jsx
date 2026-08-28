import { useState, useEffect } from 'react';
import api from '../utils/api';

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (err) {
      setError('Kullanıcılar getirilirken hata oluştu. Yetkiniz olmayabilir.');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleBan = async (id) => {
    try {
      await api.post(`/admin/ban/${id}`);
      fetchUsers(); // Refresh the list
    } catch (err) {
      alert(err.response?.data || 'İşlem başarısız.');
    }
  };

  if (error) {
    return (
      <div className="container animate-fade-in">
        <div className="card text-center" style={{ borderColor: 'var(--danger)' }}>
          <h2 style={{ color: 'var(--danger)' }}>Erişim Engellendi</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in">
      <div className="mb-4">
        <h1>Admin Paneli 👑</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Kullanıcı yönetimi ve istatistikler.</p>
      </div>

      <div className="stat-card mb-4" style={{ maxWidth: '300px' }}>
        <div className="stat-label">Toplam Kayıtlı Kullanıcı</div>
        <div className="stat-value">{users.length}</div>
      </div>

      <div className="card">
        <h2 className="mb-4">Kullanıcı Listesi</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '1rem' }}>ID</th>
                <th style={{ padding: '1rem' }}>İsim</th>
                <th style={{ padding: '1rem' }}>E-Posta</th>
                <th style={{ padding: '1rem' }}>Kayıt Tarihi</th>
                <th style={{ padding: '1rem' }}>Durum</th>
                <th style={{ padding: '1rem' }}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem' }}>{user.id}</td>
                  <td style={{ padding: '1rem' }}>{user.firstName} {user.lastName}</td>
                  <td style={{ padding: '1rem' }}>{user.email}</td>
                  <td style={{ padding: '1rem' }}>{new Date(user.createdAt).toLocaleDateString('tr-TR')}</td>
                  <td style={{ padding: '1rem' }}>
                    {user.isAdmin ? (
                      <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>Admin</span>
                    ) : user.isBanned ? (
                      <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>Banlı</span>
                    ) : (
                      <span style={{ color: 'var(--success)' }}>Aktif</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {!user.isAdmin && (
                      <button 
                        onClick={() => toggleBan(user.id)}
                        className="btn" 
                        style={{ 
                          backgroundColor: user.isBanned ? 'var(--success)' : 'var(--danger)',
                          color: 'white',
                          padding: '0.4rem 0.8rem',
                          fontSize: '0.9rem'
                        }}
                      >
                        {user.isBanned ? 'Banı Kaldır' : 'Banla'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
