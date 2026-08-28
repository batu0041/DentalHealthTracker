import { useState, useEffect } from 'react';
import api from '../utils/api';

const TIPS = [
  "Dişlerinizi günde en az 2 kez, 2'şer dakika fırçalamayı unutmayın.",
  "Diş fırçanızı her 3 ayda bir değiştirmek diş sağlığınız için çok önemlidir.",
  "Şekerli gıdalar tükettikten sonra ağzınızı suyla çalkalamak çürük riskini azaltır.",
  "Sadece fırçalamak yetmez, günde 1 kez diş ipi kullanarak arayüz çürüklerini önleyin.",
  "Asitli içecekleri pipetle içmek, diş minenize zarar gelmesini engeller."
];

function Health() {
  const [goal, setGoal] = useState({ targetBrushingPerDay: 2, targetFlossingPerWeek: 7, targetMouthwashPerWeek: 7 });
  const [brushingCount, setBrushingCount] = useState(0);
  const [flossingCount, setFlossingCount] = useState(0);
  const [mouthwashCount, setMouthwashCount] = useState(0);
  const [last7Days, setLast7Days] = useState([]);
  const [dailyTip, setDailyTip] = useState('');
  const [saving, setSaving] = useState(false);
  const [dailyGoalMet, setDailyGoalMet] = useState(false);
  const [newMedals, setNewMedals] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    setDailyTip(TIPS[Math.floor(Math.random() * TIPS.length)]);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [goalRes, recordsRes] = await Promise.all([
        api.get('/habits/goal'),
        api.get('/habits/records')
      ]);

      if (goalRes.data) setGoal(goalRes.data);

      const records = recordsRes.data;
      const sorted = records.sort((a, b) => new Date(b.recordDate) - new Date(a.recordDate));
      setLast7Days(sorted.slice(0, 7));

      // Load today's existing record if any
      const today = new Date().toISOString().split('T')[0];
      const todayRecord = records.find(r => new Date(r.recordDate).toISOString().split('T')[0] === today);
      if (todayRecord) {
        setBrushingCount(todayRecord.brushingCount || 0);
        setFlossingCount(todayRecord.flossingCount || 0);
        setMouthwashCount(todayRecord.mouthwashCount || 0);
        checkDailyGoal(todayRecord.brushingCount, todayRecord.flossingCount, todayRecord.mouthwashCount, goalRes.data);
      }
    } catch (err) {
      console.error('Veri yüklenirken hata:', err);
    }
  };

  const checkDailyGoal = (bc, fc, mc, g) => {
    const currentGoal = g || goal;
    const dailyFlossingTarget = Math.max(1, Math.floor(currentGoal.targetFlossingPerWeek / 7));
    const dailyMouthwashTarget = Math.max(1, Math.floor(currentGoal.targetMouthwashPerWeek / 7));
    const met = bc >= currentGoal.targetBrushingPerDay && fc >= dailyFlossingTarget && mc >= dailyMouthwashTarget;
    setDailyGoalMet(met);
    return met;
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage('');
    try {
      await api.post('/habits/record', {
        recordDate: new Date().toISOString(),
        brushingCount,
        flossingCount,
        mouthwashCount,
        notes: ''
      });

      // Check for new achievements
      const achieveRes = await api.post('/achievement/check');
      if (achieveRes.data && achieveRes.data.length > 0) {
        setNewMedals(achieveRes.data);
        setShowCelebration(true);
      }

      checkDailyGoal(brushingCount, flossingCount, mouthwashCount, goal);
      setSaveMessage('Başarıyla kaydedildi!');
      fetchData();
    } catch (err) {
      setSaveMessage('Kaydedilirken hata oluştu.');
    }
    setSaving(false);
  };

  const renderIcons = (emoji, count, maxCount, setCount) => {
    const icons = [];
    for (let i = 1; i <= maxCount; i++) {
      icons.push(
        <button
          key={i}
          className={`habit-icon ${i <= count ? 'selected' : ''}`}
          onClick={() => setCount(i === count ? 0 : i)}
          type="button"
          title={`${i} kez`}
        >
          <span className="habit-icon-emoji">{emoji}</span>
          <span className="habit-icon-number">{i}</span>
        </button>
      );
    }
    return icons;
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 className="text-center mb-4">Ağız ve Diş Sağlığı</h1>

      {/* Daily Goal Success Banner */}
      {dailyGoalMet && (
        <div className="card mb-4" style={{ 
          background: 'linear-gradient(135deg, #00A859, #00C96A)', 
          color: 'white', 
          textAlign: 'center',
          border: 'none'
        }}>
          <h3 style={{ color: 'white', margin: 0 }}>🎉 Tebrikler! Günlük hedefinize ulaştınız!</h3>
        </div>
      )}

      {/* Today's Tracking Card */}
      <div className="card mb-4">
        <h2 className="text-center" style={{ marginBottom: '2rem' }}>📅 Bugünün Ağız Bakımı</h2>

        {/* Brushing */}
        <div className="habit-row">
          <div className="habit-label">
            <span className="habit-label-icon">🪥</span>
            <span>Diş Fırçalama</span>
          </div>
          <div className="habit-icons">
            {renderIcons('🪥', brushingCount, Math.max(goal.targetBrushingPerDay, 3), setBrushingCount)}
          </div>
        </div>

        {/* Flossing */}
        <div className="habit-row">
          <div className="habit-label">
            <span className="habit-label-icon">🦷</span>
            <span>Diş İpi</span>
          </div>
          <div className="habit-icons">
            {renderIcons('🦷', flossingCount, 3, setFlossingCount)}
          </div>
        </div>

        {/* Mouthwash */}
        <div className="habit-row">
          <div className="habit-label">
            <span className="habit-label-icon">🫧</span>
            <span>Gargara</span>
          </div>
          <div className="habit-icons">
            {renderIcons('🫧', mouthwashCount, 3, setMouthwashCount)}
          </div>
        </div>

        {saveMessage && (
          <div style={{ 
            textAlign: 'center', 
            marginTop: '1rem',
            padding: '0.5rem',
            borderRadius: '0.5rem',
            backgroundColor: saveMessage.includes('hata') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0, 168, 89, 0.1)',
            color: saveMessage.includes('hata') ? 'var(--danger)' : 'var(--success)'
          }}>
            {saveMessage}
          </div>
        )}

        <button 
          className="btn btn-primary btn-block" 
          onClick={handleSave} 
          disabled={saving}
          style={{ marginTop: '1.5rem', fontSize: '1.2rem', padding: '1rem' }}
        >
          {saving ? '⏳ Kaydediliyor...' : '💾 Kaydet'}
        </button>
      </div>

      {/* Daily Tip */}
      <div className="card text-center mb-4" style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)' }}>
        <h3 style={{ color: 'var(--primary-color)' }}>💡 Günün Önerisi</h3>
        <p>{dailyTip}</p>
      </div>

      {/* Last 7 Days */}
      <div className="card">
        <h2 className="mb-4">📊 Son 7 Günlük Özet</h2>
        {last7Days.length === 0 ? (
          <p className="text-center" style={{ color: 'var(--text-secondary)' }}>Henüz veri bulunmuyor.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '0.75rem' }}>Tarih</th>
                  <th style={{ padding: '0.75rem' }}>🪥</th>
                  <th style={{ padding: '0.75rem' }}>🦷</th>
                  <th style={{ padding: '0.75rem' }}>🫧</th>
                  <th style={{ padding: '0.75rem' }}>Durum</th>
                </tr>
              </thead>
              <tbody>
                {last7Days.map((record, index) => {
                  const date = new Date(record.recordDate);
                  const dailyFT = Math.max(1, Math.floor(goal.targetFlossingPerWeek / 7));
                  const dailyMT = Math.max(1, Math.floor(goal.targetMouthwashPerWeek / 7));
                  const allMet = record.brushingCount >= goal.targetBrushingPerDay 
                    && record.flossingCount >= dailyFT 
                    && record.mouthwashCount >= dailyMT;
                  const anyDone = record.brushingCount > 0 || record.flossingCount > 0 || record.mouthwashCount > 0;
                  
                  return (
                    <tr key={index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.75rem', fontWeight: '500' }}>
                        {date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '1.1rem' }}>{record.brushingCount}</td>
                      <td style={{ padding: '0.75rem', fontSize: '1.1rem' }}>{record.flossingCount}</td>
                      <td style={{ padding: '0.75rem', fontSize: '1.1rem' }}>{record.mouthwashCount}</td>
                      <td style={{ padding: '0.75rem', fontSize: '1.3rem' }}>
                        {allMet ? '⭐' : anyDone ? '⚠️' : '❌'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Celebration Popup */}
      {showCelebration && (
        <div className="celebration-overlay" onClick={() => setShowCelebration(false)}>
          <div className="celebration-popup" onClick={(e) => e.stopPropagation()}>
            <div className="celebration-confetti">🎊</div>
            <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>Yeni Madalya Kazandın!</h2>
            {newMedals.map((medal, i) => (
              <div key={i} className="celebration-medal">
                <span style={{ fontSize: '3rem' }}>{medal.icon}</span>
                <div>
                  <h3 style={{ margin: '0 0 0.25rem 0', color: 'var(--primary-color)' }}>{medal.title}</h3>
                  <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{medal.description}</p>
                </div>
              </div>
            ))}
            <button className="btn btn-primary" onClick={() => setShowCelebration(false)} style={{ marginTop: '1.5rem' }}>
              Harika! 🎉
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Health;
