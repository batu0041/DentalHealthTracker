import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const TIPS = [
  "Dişlerinizi günde en az 2 kez, 2'şer dakika fırçalamayı unutmayın.",
  "Diş fırçanızı her 3 ayda bir değiştirmek diş sağlığınız için çok önemlidir.",
  "Şekerli gıdalar tükettikten sonra ağzınızı suyla çalkalamak çürük riskini azaltır.",
  "Sadece fırçalamak yetmez, günde 1 kez diş ipi kullanarak arayüz çürüklerini önleyin.",
  "Asitli içecekleri pipetle içmek, diş minenize zarar gelmesini engeller."
];

function Home() {
  const [userName, setUserName] = useState('');
  const [dailyTip, setDailyTip] = useState('');
  const [goal, setGoal] = useState({ targetBrushingPerDay: 2, targetFlossingPerWeek: 7, targetMouthwashPerWeek: 7 });
  const [todayRecord, setTodayRecord] = useState({ brushingCount: 0, flossingCount: 0, mouthwashCount: 0 });
  const [weekStats, setWeekStats] = useState({ brushing: 0, flossing: 0, mouthwash: 0 });
  const [last7Days, setLast7Days] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 6. Rastgele öneri seçimi
    const randomTip = TIPS[Math.floor(Math.random() * TIPS.length)];
    setDailyTip(randomTip);

    // Get user details from JWT token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserName(payload.unique_name || payload.name || 'Kullanıcı');
      } catch (e) {
        console.error(e);
      }
    }

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [goalRes, recordsRes] = await Promise.all([
        api.get('/habits/goal'),
        api.get('/habits/records')
      ]);

      if (goalRes.data) {
        setGoal(goalRes.data);
      }

      const records = recordsRes.data || [];
      const sortedRecords = [...records].sort((a, b) => new Date(b.recordDate) - new Date(a.recordDate));
      setLast7Days(sortedRecords.slice(0, 7));

      // Bugünkü kaydı bul
      const todayStr = new Date().toISOString().split('T')[0];
      const todayRec = records.find(r => new Date(r.recordDate).toISOString().split('T')[0] === todayStr);
      if (todayRec) {
        setTodayRecord({
          brushingCount: todayRec.brushingCount || 0,
          flossingCount: todayRec.flossingCount || 0,
          mouthwashCount: todayRec.mouthwashCount || 0
        });
      }

      // Bu haftanın kayıtlarını topla (Pazartesi'den itibaren)
      const now = new Date();
      const dayOfWeek = now.getDay();
      const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const weekStartDate = new Date(now);
      weekStartDate.setDate(now.getDate() - diffToMonday);
      weekStartDate.setHours(0, 0, 0, 0);

      const thisWeekRecords = records.filter(r => new Date(r.recordDate) >= weekStartDate);
      const totalBrushing = thisWeekRecords.reduce((sum, r) => sum + (r.brushingCount || 0), 0);
      const totalFlossing = thisWeekRecords.reduce((sum, r) => sum + (r.flossingCount || 0), 0);
      const totalMouthwash = thisWeekRecords.reduce((sum, r) => sum + (r.mouthwashCount || 0), 0);

      setWeekStats({
        brushing: totalBrushing,
        flossing: totalFlossing,
        mouthwash: totalMouthwash
      });

    } catch (error) {
      console.error('Veriler alınamadı', error);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  // Günlük hedefler
  const targetBrushingDaily = goal.targetBrushingPerDay || 2;
  const targetFlossingDaily = Math.max(1, Math.floor((goal.targetFlossingPerWeek || 7) / 7));
  const targetMouthwashDaily = Math.max(1, Math.floor((goal.targetMouthwashPerWeek || 7) / 7));

  // Günlük oranlar ve yüzdeler
  const dailyBrushingPct = Math.min(100, Math.round((todayRecord.brushingCount / targetBrushingDaily) * 100));
  const dailyFlossingPct = Math.min(100, Math.round((todayRecord.flossingCount / targetFlossingDaily) * 100));
  const dailyMouthwashPct = Math.min(100, Math.round((todayRecord.mouthwashCount / targetMouthwashDaily) * 100));
  const overallDailyPct = Math.round((dailyBrushingPct + dailyFlossingPct + dailyMouthwashPct) / 3);

  // Haftalık hedefler ve yüzdeler
  const targetBrushingWeekly = targetBrushingDaily * 7;
  const targetFlossingWeekly = goal.targetFlossingPerWeek || 7;
  const targetMouthwashWeekly = goal.targetMouthwashPerWeek || 7;

  const weeklyBrushingPct = Math.min(100, Math.round((weekStats.brushing / targetBrushingWeekly) * 100));
  const weeklyFlossingPct = Math.min(100, Math.round((weekStats.flossing / targetFlossingWeekly) * 100));
  const weeklyMouthwashPct = Math.min(100, Math.round((weekStats.mouthwash / targetMouthwashWeekly) * 100));

  const isTodayComplete = todayRecord.brushingCount >= targetBrushingDaily &&
                          todayRecord.flossingCount >= targetFlossingDaily &&
                          todayRecord.mouthwashCount >= targetMouthwashDaily;

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1rem' }}>
      
      {/* 1. Kullanıcı Karşılama Başlığı */}
      <div className="text-center mb-4">
        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          Hoş Geldiniz, {userName}!
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Ağız ve diş sağlığı hedeflerinizdeki son durumunuz:
        </p>
      </div>

      {/* Genel Günlük Skor Özeti Kartı */}
      <div className="summary-score-card mb-4 animate-fade-in">
        <div className="summary-score-left">
          <div className="summary-circle">
            %{overallDailyPct}
          </div>
          <div>
            <h2 style={{ color: 'white', margin: '0 0 0.25rem 0', fontSize: '1.5rem' }}>
              {isTodayComplete ? '🌟 Günlük Hedefler Tamamlandı!' : '🎯 Bugünkü Hedef İlerlemesi'}
            </h2>
            <p style={{ margin: 0, opacity: 0.9 }}>
              {isTodayComplete 
                ? 'Tebrikler! Bugün yapılması gereken tüm ağız bakımını eksiksiz yaptınız.' 
                : `Bugünkü genel hedeflerinizin %${overallDailyPct}'sini tamamladınız. Adım adım hedefe yaklaşıyorsunuz!`}
            </p>
          </div>
        </div>
        <Link to="/health" className="btn btn-secondary" style={{ backgroundColor: 'white', color: 'var(--primary-color)', fontWeight: 'bold' }}>
          {isTodayComplete ? 'Kayıtları Gör' : '✨ Bakımını Kaydet'}
        </Link>
      </div>

      {/* 2. GÜNLÜK HEDEFLER GÖRSEL İLERLEME KARTLARI */}
      <div className="card mb-4">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h2 style={{ margin: 0 }}>📅 Bugünün Hedef Durumu</h2>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Hedefler: Profilinizdeki ayarlara göredir
          </span>
        </div>

        <div className="goal-dashboard-grid">
          {/* Diş Fırçalama */}
          <div className={`goal-progress-card ${todayRecord.brushingCount >= targetBrushingDaily ? 'completed' : ''}`}>
            <div className="goal-card-header">
              <div className="goal-card-title">
                <span style={{ fontSize: '1.5rem' }}>🪥</span>
                <span>Diş Fırçalama</span>
              </div>
              <span className={`goal-badge ${todayRecord.brushingCount >= targetBrushingDaily ? 'success' : todayRecord.brushingCount > 0 ? 'pending' : 'neutral'}`}>
                {todayRecord.brushingCount >= targetBrushingDaily ? 'Tamamlandı ✅' : todayRecord.brushingCount > 0 ? 'Devam Ediyor ⏳' : 'Yapılmadı'}
              </span>
            </div>
            
            <div className="progress-bar-bg">
              <div 
                className={`progress-bar-fill brushing ${todayRecord.brushingCount >= targetBrushingDaily ? 'completed' : ''}`}
                style={{ width: `${dailyBrushingPct}%` }}
              ></div>
            </div>

            <div className="goal-stat-footer">
              <span>Hedefe Kalan: <strong>{Math.max(0, targetBrushingDaily - todayRecord.brushingCount)} kez</strong></span>
              <span className="goal-stat-count">{todayRecord.brushingCount} / {targetBrushingDaily} kez (%{dailyBrushingPct})</span>
            </div>
          </div>

          {/* Diş İpi */}
          <div className={`goal-progress-card ${todayRecord.flossingCount >= targetFlossingDaily ? 'completed' : ''}`}>
            <div className="goal-card-header">
              <div className="goal-card-title">
                <span style={{ fontSize: '1.5rem' }}>🦷</span>
                <span>Diş İpi</span>
              </div>
              <span className={`goal-badge ${todayRecord.flossingCount >= targetFlossingDaily ? 'success' : todayRecord.flossingCount > 0 ? 'pending' : 'neutral'}`}>
                {todayRecord.flossingCount >= targetFlossingDaily ? 'Tamamlandı ✅' : todayRecord.flossingCount > 0 ? 'Devam Ediyor ⏳' : 'Yapılmadı'}
              </span>
            </div>
            
            <div className="progress-bar-bg">
              <div 
                className={`progress-bar-fill flossing ${todayRecord.flossingCount >= targetFlossingDaily ? 'completed' : ''}`}
                style={{ width: `${dailyFlossingPct}%` }}
              ></div>
            </div>

            <div className="goal-stat-footer">
              <span>Hedefe Kalan: <strong>{Math.max(0, targetFlossingDaily - todayRecord.flossingCount)} kez</strong></span>
              <span className="goal-stat-count">{todayRecord.flossingCount} / {targetFlossingDaily} kez (%{dailyFlossingPct})</span>
            </div>
          </div>

          {/* Gargara */}
          <div className={`goal-progress-card ${todayRecord.mouthwashCount >= targetMouthwashDaily ? 'completed' : ''}`}>
            <div className="goal-card-header">
              <div className="goal-card-title">
                <span style={{ fontSize: '1.5rem' }}>🫧</span>
                <span>Gargara</span>
              </div>
              <span className={`goal-badge ${todayRecord.mouthwashCount >= targetMouthwashDaily ? 'success' : todayRecord.mouthwashCount > 0 ? 'pending' : 'neutral'}`}>
                {todayRecord.mouthwashCount >= targetMouthwashDaily ? 'Tamamlandı ✅' : todayRecord.mouthwashCount > 0 ? 'Devam Ediyor ⏳' : 'Yapılmadı'}
              </span>
            </div>
            
            <div className="progress-bar-bg">
              <div 
                className={`progress-bar-fill mouthwash ${todayRecord.mouthwashCount >= targetMouthwashDaily ? 'completed' : ''}`}
                style={{ width: `${dailyMouthwashPct}%` }}
              ></div>
            </div>

            <div className="goal-stat-footer">
              <span>Hedefe Kalan: <strong>{Math.max(0, targetMouthwashDaily - todayRecord.mouthwashCount)} kez</strong></span>
              <span className="goal-stat-count">{todayRecord.mouthwashCount} / {targetMouthwashDaily} kez (%{dailyMouthwashPct})</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. HAFTALIK HEDEFLERE YAKINLIK GÖRSEL İLERLEME */}
      <div className="card mb-4">
        <h2 className="mb-4">📈 Bu Haftaki Hedefler ve İlerleme</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Haftalık Fırçalama */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontWeight: '600' }}>
              <span>🪥 Haftalık Diş Fırçalama</span>
              <span style={{ color: weeklyBrushingPct >= 100 ? 'var(--success)' : 'var(--primary-color)' }}>
                {weekStats.brushing} / {targetBrushingWeekly} kez (%{weeklyBrushingPct})
              </span>
            </div>
            <div className="progress-bar-bg">
              <div 
                className={`progress-bar-fill brushing ${weeklyBrushingPct >= 100 ? 'completed' : ''}`}
                style={{ width: `${weeklyBrushingPct}%` }}
              ></div>
            </div>
            <small style={{ color: 'var(--text-secondary)' }}>
              {weeklyBrushingPct >= 100 
                ? '🏆 Haftalık fırçalama hedefinize ulaştınız! Tebrikler!' 
                : `Haftalık hedefe ulaşmak için ${Math.max(0, targetBrushingWeekly - weekStats.brushing)} fırçalama kaldı.`}
            </small>
          </div>

          {/* Haftalık Diş İpi */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontWeight: '600' }}>
              <span>🦷 Haftalık Diş İpi</span>
              <span style={{ color: weeklyFlossingPct >= 100 ? 'var(--success)' : 'var(--primary-color)' }}>
                {weekStats.flossing} / {targetFlossingWeekly} kez (%{weeklyFlossingPct})
              </span>
            </div>
            <div className="progress-bar-bg">
              <div 
                className={`progress-bar-fill flossing ${weeklyFlossingPct >= 100 ? 'completed' : ''}`}
                style={{ width: `${weeklyFlossingPct}%` }}
              ></div>
            </div>
            <small style={{ color: 'var(--text-secondary)' }}>
              {weeklyFlossingPct >= 100 
                ? '🏆 Haftalık diş ipi hedefinize ulaştınız! Tebrikler!' 
                : `Haftalık hedefe ulaşmak için ${Math.max(0, targetFlossingWeekly - weekStats.flossing)} kullanım kaldı.`}
            </small>
          </div>

          {/* Haftalık Gargara */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontWeight: '600' }}>
              <span>🫧 Haftalık Ağız Gargarası</span>
              <span style={{ color: weeklyMouthwashPct >= 100 ? 'var(--success)' : 'var(--primary-color)' }}>
                {weekStats.mouthwash} / {targetMouthwashWeekly} kez (%{weeklyMouthwashPct})
              </span>
            </div>
            <div className="progress-bar-bg">
              <div 
                className={`progress-bar-fill mouthwash ${weeklyMouthwashPct >= 100 ? 'completed' : ''}`}
                style={{ width: `${weeklyMouthwashPct}%` }}
              ></div>
            </div>
            <small style={{ color: 'var(--text-secondary)' }}>
              {weeklyMouthwashPct >= 100 
                ? '🏆 Haftalık gargara hedefinize ulaştınız! Tebrikler!' 
                : `Haftalık hedefe ulaşmak için ${Math.max(0, targetMouthwashWeekly - weekStats.mouthwash)} kullanım kaldı.`}
            </small>
          </div>
        </div>
      </div>

      {/* 6. Rastgele öneri alanı */}
      <div className="card text-center mb-4" style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', border: '1px solid var(--primary-color)' }}>
        <h3 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>💡 Günün Ağız ve Diş Sağlığı Önerisi</h3>
        <p style={{ fontSize: '1.1rem' }}>{dailyTip}</p>
      </div>

      {/* Hızlı Erişim Menüsü */}
      <div className="card mb-4" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2 className="text-center">Hızlı Erişim Menüsü</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/health" className="btn btn-primary" style={{ minWidth: '160px' }}>🦷 Ağız ve Diş Sağlığı</Link>
          <Link to="/profile" className="btn btn-secondary" style={{ minWidth: '160px' }}>👤 Profil & Madalyalar</Link>
          <button onClick={handleLogout} className="btn btn-danger" style={{ minWidth: '160px' }}>Güvenli Çıkış</button>
        </div>
      </div>

      {/* 5. Son 7 günün verileri özet şeklinde listelenmelidir */}
      <div className="card">
        <h2 className="mb-4">📊 Son 7 Günlük Veri Özeti</h2>
        {last7Days.length === 0 ? (
          <p className="text-center" style={{ color: 'var(--text-secondary)' }}>Henüz girilmiş bir veri bulunmuyor.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '0.75rem' }}>Tarih</th>
                  <th style={{ padding: '0.75rem' }}>🪥 Fırçalama</th>
                  <th style={{ padding: '0.75rem' }}>🦷 Diş İpi</th>
                  <th style={{ padding: '0.75rem' }}>🫧 Gargara</th>
                  <th style={{ padding: '0.75rem' }}>Durum</th>
                </tr>
              </thead>
              <tbody>
                {last7Days.map((record, index) => {
                  const dateObj = new Date(record.recordDate);
                  const formattedDate = dateObj.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
                  const isMet = record.brushingCount >= targetBrushingDaily && 
                                record.flossingCount >= targetFlossingDaily && 
                                record.mouthwashCount >= targetMouthwashDaily;
                  return (
                    <tr key={index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.75rem', fontWeight: '500' }}>{formattedDate}</td>
                      <td style={{ padding: '0.75rem' }}>{record.brushingCount} kez</td>
                      <td style={{ padding: '0.75rem' }}>{record.flossingCount > 0 ? `${record.flossingCount} kez` : 'Hayır'}</td>
                      <td style={{ padding: '0.75rem' }}>{record.mouthwashCount > 0 ? `${record.mouthwashCount} kez` : 'Hayır'}</td>
                      <td style={{ padding: '0.75rem' }}>
                        {isMet ? (
                          <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>⭐ Hedef Tamam</span>
                        ) : (record.brushingCount > 0 || record.flossingCount > 0 || record.mouthwashCount > 0) ? (
                          <span style={{ color: 'var(--warning)', fontWeight: '500' }}>⏳ Kısmi</span>
                        ) : (
                          <span style={{ color: 'var(--danger)', opacity: 0.7 }}>❌ Girilmedi</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

export default Home;
