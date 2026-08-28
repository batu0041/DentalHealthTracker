import { useState, useEffect } from 'react';
import api from '../utils/api';

function Profile() {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    birthDate: '',
    password: ''
  });
  
  const [goal, setGoal] = useState({ targetBrushingPerDay: 2, targetFlossingPerWeek: 7, targetMouthwashPerWeek: 7 });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [goalMessage, setGoalMessage] = useState('');
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, goalRes, achieveRes] = await Promise.all([
          api.get('/user/profile'),
          api.get('/habits/goal'),
          api.get('/achievement')
        ]);
        
        if (profileRes.data) {
          // Format birthDate to YYYY-MM-DD for input type="date"
          const bd = new Date(profileRes.data.birthDate);
          const formattedDate = bd.toISOString().split('T')[0];
          
          setProfile({
            ...profileRes.data,
            birthDate: formattedDate
          });
        }
        
        if (goalRes.data) {
          setGoal(goalRes.data);
        }
        if (achieveRes.data) {
          setAchievements(achieveRes.data);
        }
      } catch (err) {
        console.error('Error fetching data', err);
      }
    };
    
    fetchData();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // 6. Eksik bilgi kontrolü
    if (!profile.firstName || !profile.lastName || !profile.email || !profile.password || !profile.birthDate) {
      setError('Lütfen tüm alanları doldurunuz.');
      return;
    }

    // 5. Mail formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profile.email)) {
      setError('Lütfen geçerli bir e-posta adresi giriniz.');
      return;
    }

    // 2. Yeni girilecek parola kriterleri (en az 8, büyük/küçük/rakam)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(profile.password)) {
      setError('Şifreniz en az 8 karakter uzunluğunda olmalı, en az bir büyük harf, bir küçük harf ve bir rakam içermelidir.');
      return;
    }

    try {
      const response = await api.put('/user/profile', profile);
      setMessage(response.data.message || 'Profil başarıyla güncellendi.');
    } catch (err) {
      // 3 & 4. Aynı e-posta kullanımı backend tarafından "DUPLICATE_EMAIL" olarak engellendiğinde yakalanır.
      setError(err.response?.data?.message || 'Profil güncellenirken bir hata oluştu.');
    }
  };

  const handleGoalSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put('/habits/goal', goal);
      setGoalMessage('Hedefler başarıyla güncellendi.');
    } catch (err) {
      setGoalMessage('Hedef güncellenirken hata oluştu.');
    }
  };

  return (
    <div className="container animate-fade-in grid md:grid-cols-2" style={{ gap: '2rem', padding: '2rem 1rem' }}>
      
      {/* Profil Güncelleme */}
      <div className="card">
        <h2 className="mb-4">Profil Bilgileri</h2>
        {error && <div className="error-text text-center mb-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '0.5rem' }}>{error}</div>}
        {message && <div style={{ color: 'var(--success)', marginBottom: '1rem', textAlign: 'center' }}>{message}</div>}
        
        <form onSubmit={handleProfileSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Ad</label>
            <input 
              type="text" 
              className="form-control" 
              value={profile.firstName} 
              onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Soyad</label>
            <input 
              type="text" 
              className="form-control" 
              value={profile.lastName} 
              onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Doğum Tarihi</label>
            <input 
              type="date" 
              className="form-control" 
              value={profile.birthDate} 
              onChange={(e) => setProfile({ ...profile, birthDate: e.target.value })} 
            />
          </div>
          <div className="form-group">
            <label className="form-label">E-Posta</label>
            <input 
              type="email" 
              className="form-control" 
              value={profile.email} 
              onChange={(e) => setProfile({ ...profile, email: e.target.value })} 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Şifre (Simetrik Çözülmüş)</label>
            <input 
              type="text" 
              className="form-control" 
              value={profile.password} 
              onChange={(e) => setProfile({ ...profile, password: e.target.value })} 
            />
            <small style={{ color: 'var(--text-secondary)' }}>
              *Şifreniz veritabanından çözülerek getirilmiştir. Değiştirip kaydedebilirsiniz.
            </small>
          </div>
          <button type="submit" className="btn btn-primary mt-2">Profili Güncelle</button>
        </form>
      </div>

      {/* Hedef Güncelleme */}
      <div className="card">
        <h2 className="mb-4">Sağlık Hedeflerim</h2>
        {goalMessage && <div style={{ color: 'var(--success)', marginBottom: '1rem', textAlign: 'center' }}>{goalMessage}</div>}
        <form onSubmit={handleGoalSubmit}>
          <div className="form-group">
            <label className="form-label">Günlük Diş Fırçalama Hedefi</label>
            <input
              type="number"
              className="form-control"
              value={goal.targetBrushingPerDay}
              onChange={(e) => setGoal({ ...goal, targetBrushingPerDay: parseInt(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Haftalık Diş İpi Hedefi</label>
            <input
              type="number"
              className="form-control"
              value={goal.targetFlossingPerWeek}
              onChange={(e) => setGoal({ ...goal, targetFlossingPerWeek: parseInt(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Haftalık Ağız Gargarası Hedefi</label>
            <input
              type="number"
              className="form-control"
              value={goal.targetMouthwashPerWeek}
              onChange={(e) => setGoal({ ...goal, targetMouthwashPerWeek: parseInt(e.target.value) })}
            />
          </div>
          <button type="submit" className="btn btn-secondary mt-2">Hedefleri Kaydet</button>
        </form>
      </div>

      {/* Madalyalarım Section */}
      <div className="card" style={{ gridColumn: '1 / -1', marginTop: '0' }}>
        <h2 className="mb-4">🏆 Madalyalarım</h2>
        {achievements.length === 0 ? (
          <p className="text-center" style={{ color: 'var(--text-secondary)' }}>
            Henüz madalya kazanılmamış. Hedeflerinizi tamamlayarak madalya kazanın!
          </p>
        ) : (
          <div className="medal-grid">
            {achievements.map((a, i) => (
              <div key={i} className="medal-card">
                <span className="medal-icon">{a.icon}</span>
                <div className="medal-info">
                  <h3 className="medal-title">{a.title}</h3>
                  <p className="medal-desc">{a.description}</p>
                  <div className="medal-meta">
                    <span className="medal-count">×{a.count}</span>
                    <span className="medal-date">{new Date(a.earnedAt).toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Locked Medals */}
        <div style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Kazanılmamış Madalyalar</h3>
          <div className="medal-grid">
            {[
              { type: 'daily_star', icon: '🏅', title: 'Günlük Yıldız', desc: 'Günlük tüm hedefleri tamamla' },
              { type: 'weekly_brushing', icon: '🥇', title: 'Haftalık Fırçalama Ustası', desc: 'Haftalık fırçalama hedefine ulaş' },
              { type: 'weekly_flossing', icon: '🥇', title: 'Haftalık Diş İpi Ustası', desc: 'Haftalık diş ipi hedefine ulaş' },
              { type: 'weekly_mouthwash', icon: '🥇', title: 'Haftalık Gargara Ustası', desc: 'Haftalık gargara hedefine ulaş' },
              { type: 'weekly_champion', icon: '🏆', title: 'Haftalık Şampiyon', desc: 'Haftada tüm hedeflere ulaş' },
              { type: 'monthly_legend', icon: '💎', title: 'Aylık Efsane', desc: 'Tüm aylık hedeflere ulaş' },
              { type: 'streak_7', icon: '⭐', title: '7 Gün Serisi', desc: '7 gün üst üste hedef tamamla' },
              { type: 'streak_30', icon: '🔥', title: '30 Gün Serisi', desc: '30 gün üst üste hedef tamamla' }
            ]
              .filter(m => !achievements.some(a => a.type === m.type))
              .map((m, i) => (
                <div key={i} className="medal-card medal-locked">
                  <span className="medal-icon">🔒</span>
                  <div className="medal-info">
                    <h3 className="medal-title">{m.title}</h3>
                    <p className="medal-desc">{m.desc}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

    </div>
  );
}

export default Profile;
