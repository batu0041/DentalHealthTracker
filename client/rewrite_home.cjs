const fs = require('fs');
const content = `import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { jwtDecode } from 'jwt-decode';

function Home() {
  const [userName, setUserName] = useState('');
  const [stats, setStats] = useState({ totalBrushed: 0, totalFlossed: 0 });
  const [todayRecord, setTodayRecord] = useState(null);
  
  // New State for Monthly Status
  const [monthlyStats, setMonthlyStats] = useState({ brushing: 0, flossing: 0, mouthwash: 0 });

  // New State for Tips, Streak and Rewards
  const [dailyTip, setDailyTip] = useState('');
  const [streak, setStreak] = useState(0);
  const [goalAchievedToday, setGoalAchievedToday] = useState(false);
  const [userGoal, setUserGoal] = useState({ targetBrushingPerDay: 2 });
  const [points, setPoints] = useState(0);

  const tips = [
    "Dişlerinizi günde en az iki kez, ikişer dakika fırçalamayı unutmayın.",
    "Diş ipi kullanımı, fırçanın ulaşamadığı yerlerdeki plakları temizler.",
    "Asitli ve şekerli yiyecekler diş minenize zarar verebilir, tükettikten sonra su için.",
    "Diş fırçanızı her 3 ayda bir değiştirmeye özen gösterin.",
    "Florürlü diş macunu kullanmak diş çürüklerini önlemede etkilidir.",
    "Dilinizi de fırçalamak ağız kokusunu önler ve bakterileri uzaklaştırır.",
    "Düzenli diş hekimi kontrolü, sorunları büyümeden çözmenizi sağlar."
  ];

  useEffect(() => {
    setDailyTip(tips[Math.floor(Math.random() * tips.length)]);

    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      setUserName(decoded.unique_name || 'Kullanıcı');
    }

    const fetchStats = async () => {
      try {
        // Fetch goal
        let targetBrushing = 2;
        try {
          const goalResponse = await api.get('/habits/goal');
          if (goalResponse.data && goalResponse.data.targetBrushingPerDay) {
            targetBrushing = goalResponse.data.targetBrushingPerDay;
            setUserGoal(goalResponse.data);
          }
        } catch (e) {
          console.error('Error fetching goal', e);
        }

        const response = await api.get('/habits/records');
        const records = response.data;
        
        // Count all-time days where brushing/flossing occurred at least once
        const brushedCount = records.filter(r => r.brushingCount > 0).length;
        const flossedCount = records.filter(r => r.flossingCount > 0).length;
        setStats({ totalBrushed: brushedCount, totalFlossed: flossedCount });

        // Streak calculation
        const sortedRecords = [...records].sort((a, b) => new Date(b.recordDate) - new Date(a.recordDate));
        let currentStreak = 0;
        let metToday = false;

        for (let i = 0; i < sortedRecords.length; i++) {
          const r = sortedRecords[i];
          if (i === 0) { // Today
            if (r.brushingCount >= targetBrushing) {
              currentStreak++;
              metToday = true;
            }
          } else {
            if (r.brushingCount >= targetBrushing) {
              currentStreak++;
            } else {
              break; // Streak broken
            }
          }
        }
        setStreak(currentStreak);
        setGoalAchievedToday(metToday);
        setPoints(currentStreak * 50); // Give 50 points per streak day

        // Find today's record
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const todayData = records.find(r => r.recordDate.startsWith(todayStr));
        if (todayData) {
          setTodayRecord(todayData);
        }

        // Calculate Monthly stats for current month
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        const thisMonthRecords = records.filter(r => {
          const d = new Date(r.recordDate);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        // Calculate Monthly Total Counts
        const mStats = thisMonthRecords.reduce((acc, curr) => {
          return {
            brushing: acc.brushing + (curr.brushingCount || 0),
            flossing: acc.flossing + (curr.flossingCount || 0),
            mouthwash: acc.mouthwash + (curr.mouthwashCount || 0)
          };
        }, { brushing: 0, flossing: 0, mouthwash: 0 });

        // Calculate Daily Scores (Max 100 per day)
        const totalScore = thisMonthRecords.reduce((acc, curr) => {
          const bScore = Math.min((curr.brushingCount || 0) * 20, 60);
          const fScore = Math.min((curr.flossingCount || 0) * 20, 20);
          const mScore = Math.min((curr.mouthwashCount || 0) * 10, 20);
          return acc + bScore + fScore + mScore;
        }, 0);

        // Average score based on the actual recorded days in the month (including auto-filled 0s)
        const daysInMonth = thisMonthRecords.length > 0 ? thisMonthRecords.length : 1;
        const averageScore = Math.round(totalScore / daysInMonth);

        setMonthlyStats({
          ...mStats,
          averageScore: isNaN(averageScore) ? 0 : averageScore
        });

      } catch (err) {
        console.error('Error fetching records', err);
      }
    };
    fetchStats();
  }, []);

  const getToothStatus = (record) => {
    if (!record) return { label: 'Kayıt Yok', emoji: '🦷', desc: 'Bugün için kayıt girmediniz.', className: '' };
    
    // Daily Logic (Max 100 score logic for today as well)
    const bScore = Math.min((record.brushingCount || 0) * 20, 60);
    const fScore = Math.min((record.flossingCount || 0) * 20, 20);
    const mScore = Math.min((record.mouthwashCount || 0) * 10, 20);
    const score = bScore + fScore + mScore;

    if (score >= 80) return { label: 'Parıl Parıl', emoji: '✨🦷✨', desc: \`Mükemmel! (Puan: \${score}/100)\`, className: 'tooth-perfect' };
    if (score >= 50) return { label: 'Temiz', emoji: '🦷', desc: \`Çok iyi! (Puan: \${score}/100)\`, className: 'tooth-clean' };
    if (score >= 25) return { label: 'Sarı', emoji: '🟨🦷', desc: \`Biraz daha çabalamalısın. (Puan: \${score}/100)\`, className: 'tooth-yellow' };
    return { label: 'Kirli', emoji: '🦠🦷', desc: \`Dişlerin tehlikede! (Puan: \${score}/100)\`, className: 'tooth-dirty' };
  };

  const getMonthlyToothStatus = (mStats) => {
    const score = mStats.averageScore || 0;

    if (score >= 75) {
      return { label: 'Parıl Parıl', emoji: '✨🦷✨', desc: \`Harika bir ay geçiriyorsunuz! (Aylık Ort: \${score}/100)\`, className: 'tooth-perfect', barColor: 'var(--success)' };
    }
    if (score >= 50) {
      return { label: 'Temiz', emoji: '🦷', desc: \`İyi gidiyorsunuz, düzeninizi koruyun. (Aylık Ort: \${score}/100)\`, className: 'tooth-clean', barColor: '#38bdf8' };
    }
    if (score >= 25) {
      return { label: 'Sarı', emoji: '🟨🦷', desc: \`Bu ay biraz ihmalkar davrandınız. (Aylık Ort: \${score}/100)\`, className: 'tooth-yellow', barColor: '#fbbf24' };
    }
    return { label: 'Kirli', emoji: '🦠🦷', desc: \`Bu ay sağlığınıza hiç dikkat etmediniz! (Aylık Ort: \${score}/100)\`, className: 'tooth-dirty', barColor: 'var(--danger)' };
  };

  const todayStatus = getToothStatus(todayRecord);
  const monthlyStatus = getMonthlyToothStatus(monthlyStats);

  return (
    <div className="container animate-fade-in">
      <div className="mb-4 text-center">
        <h1 className="text-gradient">Hoş Geldiniz, {userName}! 👋</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Ağız ve diş sağlığı takibini buradan kolayca yapabilirsiniz.</p>
      </div>

      {/* Daily Tip Section */}
      <div className="card text-center" style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', border: '1px solid var(--primary)', marginBottom: '2rem' }}>
        <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>💡 Günün Tüyosu</h3>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{dailyTip}</p>
      </div>

      {/* Streak and Reward Section */}
      <div className="grid grid-cols-2 mt-4 mb-4" style={{ gap: '2rem' }}>
        <div className="card text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2 className="mb-2">Seri</h2>
          <div style={{ fontSize: '4rem', margin: '1rem 0', animation: streak > 0 ? 'pulse 2s infinite' : 'none' }}>
            {streak > 0 ? '🔥' : '🧊'}
          </div>
          <h3 style={{ color: 'var(--text-primary)' }}>{streak} Günlük Seri</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Hedef: Günde {userGoal.targetBrushingPerDay} kez fırçalama
          </p>
          {goalAchievedToday ? (
            <div style={{ marginTop: '1rem', color: 'var(--success)', fontWeight: 'bold' }}>
              Bugünkü hedefinizi tamamladınız! Harika! 🥳
            </div>
          ) : (
            <div style={{ marginTop: '1rem', color: 'var(--warning)', fontWeight: 'bold' }}>
              Bugünkü hedefinizi tamamlamak için fırçalamayı unutmayın!
            </div>
          )}
        </div>

        <div className="card text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2 className="mb-2">Ödül Puanı</h2>
          <div style={{ fontSize: '4rem', margin: '1rem 0' }}>
            🏆
          </div>
          <h3 style={{ color: 'var(--primary)', fontSize: '2rem' }}>{points} XP</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Serinizi koruyarak daha fazla puan kazanın!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 mt-4 mb-4" style={{ gap: '2rem' }}>
        
        {/* Daily Tooth Status */}
        <div className="card text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 className="mb-4">Günün Diş Durumu</h2>
          <div className={\`tooth-container \${todayStatus.className || ''}\`} style={{ fontSize: '5rem', margin: '2rem 0' }}>
            {todayStatus.emoji}
          </div>
          <h3 style={{ color: 'var(--text-primary)' }}>{todayStatus.label}</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', minHeight: '3rem' }}>{todayStatus.desc}</p>
          
          {!todayRecord && (
            <Link to="/health" className="btn btn-primary mt-4">Bugünün Kaydını Gir</Link>
          )}
        </div>

        {/* Monthly Tooth Status */}
        <div className="card text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 className="mb-4">Ayın Diş Durumu</h2>
          <div className={\`tooth-container \${monthlyStatus.className || ''}\`} style={{ fontSize: '5rem', margin: '2rem 0' }}>
            {monthlyStatus.emoji}
          </div>
          <h3 style={{ color: 'var(--text-primary)' }}>{monthlyStatus.label}</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{monthlyStatus.desc}</p>
          
          {/* Progress Bar for Monthly Score */}
          <div style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.1)', height: '10px', borderRadius: '5px', margin: '1.5rem 0 0.5rem 0', overflow: 'hidden' }}>
            <div style={{ width: \`\${Math.min(monthlyStats.averageScore || 0, 100)}%\`, backgroundColor: monthlyStatus.barColor, height: '100%', transition: 'width 1s ease-in-out' }}></div>
          </div>
          
          <div style={{ marginTop: '0.5rem', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '1rem', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <div>Fırçalama: <strong style={{ color: 'var(--text-primary)'}}>{monthlyStats.brushing}</strong></div>
              <div>Diş İpi: <strong style={{ color: 'var(--text-primary)'}}>{monthlyStats.flossing}</strong></div>
              <div>Gargara: <strong style={{ color: 'var(--text-primary)'}}>{monthlyStats.mouthwash}</strong></div>
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-2 mt-4 mb-4">
        <div className="stat-card">
          <div className="stat-label">Toplam Diş Fırçalama (Gün)</div>
          <div className="stat-value">{stats.totalBrushed}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Toplam Diş İpi Kullanımı (Gün)</div>
          <div className="stat-value">{stats.totalFlossed}</div>
        </div>
      </div>
    </div>
  );
}

export default Home;
`
fs.writeFileSync('src/pages/Home.jsx', content);
