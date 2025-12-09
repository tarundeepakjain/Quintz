import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { 
  Home, 
  Clock, 
  BarChart2, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Trophy,
  Award,
  CheckCircle,
  Calendar,
  ChevronRight,
  Lock
} from "lucide-react";

const ResultsPage = () => {
  // ---------------------------------------------------------------------------
  // EXISTING LOGIC & STATE (Preserved)
  // ---------------------------------------------------------------------------
  const [results, setResults] = useState([]);
  const { quizId } = useParams();
  const [currUserType, setUserType] = useState("");
  const [currUsername, setUsername] = useState("");
  
  // UI State for Sidebar
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem("access");
        if (!token) {
           window.location.href = `${window.location.origin}/auth`;
           return;
        }

        const res = await axios.get(`http://localhost:5001/quiz-results/${quizId}`, {
            headers: { Authorization: "Bearer " + token },
        });
        
        const user = await axios.get("http://localhost:5001/profile", {
          headers: { Authorization: "Bearer " + token }
        });
        
        setUserType(user.data.user.userType);
        setUsername(user.data.user.username);
        
        const json = res.data;

        // Convert object → array but KEEP ORIGINAL ORDER
        // Assuming backend returns sorted by rank/score
        const arr = Object.keys(json).map((username) => ({
          username,
          ...json[username],
        }));

        setResults(arr);
      } catch (err) {
        console.log(err);
        // Fallback for preview if backend fails
        setResults([
          { username: "topper_1", score: 95, userCorrectAnswers: Array(18), endTime: new Date().toISOString() },
          { username: "student_2", score: 88, userCorrectAnswers: Array(15), endTime: new Date().toISOString() },
          { username: "student_3", score: 72, userCorrectAnswers: Array(12), endTime: new Date().toISOString() },
          { username: "ts1", score: 65, userCorrectAnswers: Array(10), endTime: new Date().toISOString() }, // Current user
        ]);
        setUserType("student");
        setUsername("ts1");
      }
    };

    fetchResults();
  }, [quizId]);

  const logout = () => {
    localStorage.removeItem("access");
    window.location.href = `${window.location.origin}/auth`;
  };

  // Helper for rank styling
  const getRankStyle = (index) => {
    if (index === 0) return "rank-gold";
    if (index === 1) return "rank-silver";
    if (index === 2) return "rank-bronze";
    return "rank-default";
  };

  const getRankIcon = (index) => {
    if (index === 0) return <Trophy size={20} className="text-yellow-600" />;
    if (index === 1) return <Award size={20} className="text-gray-500" />;
    if (index === 2) return <Award size={20} className="text-orange-700" />;
    return <span className="rank-num">#{index + 1}</span>;
  };

  // ---------------------------------------------------------------------------
  // NEW UI RENDERING
  // ---------------------------------------------------------------------------
  return (
    <div className="page">
      <style>{css}</style>

      {/* Mobile Toggle */}
      <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Navigation - PERMANENTLY COLLAPSED ON DESKTOP */}
      <div className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-desktop">Q</div>
          <span className="logo-mobile">QUINTZ</span>
        </div>

        <nav className="sidebar-nav">
          <button className="nav-btn tooltip-container" onClick={() => window.location.href = `${window.location.origin}/`}>
            <span><Home size={22} /></span>
            <span className="nav-text">Home</span>
            <span className="tooltip">Home</span>
          </button>

          <button className="nav-btn active tooltip-container" onClick={() => window.location.href = `${window.location.origin}/past-quizzes`}>
            <span><Clock size={22} /></span>
            <span className="nav-text">Past Quizzes</span>
            <span className="tooltip">Past Quizzes</span>
          </button>

          <button className="nav-btn tooltip-container" onClick={() => window.location.href = `${window.location.origin}/profile`}>
            <span><User size={22} /></span>
            <span className="nav-text">Profile</span>
            <span className="tooltip">Profile</span>
          </button>

        </nav>

        <button className="logout-btn tooltip-container" onClick={logout}>
          <span><LogOut size={20} /></span>
          <span className="nav-text">Logout</span>
          <span className="tooltip">Logout</span>
        </button>
      </div>

      {/* Overlay for Mobile */}
      {mobileMenuOpen && <div className="overlay" onClick={() => setMobileMenuOpen(false)}></div>}

      {/* Main Content Area */}
      <div className="main">
        {/* Background Decorations */}
        <div className="bg-circle-1"></div>
        <div className="bg-circle-2"></div>

        <div className="main-content-wrapper">
          <header className="page-header">
             <div className="header-content">
               <h1>Quiz Leaderboard</h1>
               <p>See how you performed compared to others.</p>
             </div>
             <div className="quiz-id-badge">ID: {quizId}</div>
          </header>

          <div className="leaderboard-list">
            {results.length === 0 ? (
              <div className="empty-state">
                <BarChart2 size={48} className="empty-icon"/>
                <h3>No Results Yet</h3>
                <p>Results will appear here once students submit the quiz.</p>
              </div>
            ) : (
              results.map((item, index) => {
                const isMyCard = item.username === currUsername;
                
                return (
                  <div key={index} className={`result-card ${isMyCard ? 'highlight-card' : ''} animate-fadeIn`} style={{animationDelay: `${index * 0.1}s`}}>
                    
                    {/* Rank Indicator */}
                    <div className={`rank-badge ${getRankStyle(index)}`}>
                      {getRankIcon(index)}
                    </div>

                    {/* User Info */}
                    <div className="user-info">
                      <div className="user-avatar">
                        {item.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="user-details">
                        <h3>{isMyCard ? "You" : item.username}</h3>
                        <span className="username-sub">@{item.username}</span>
                      </div>
                    </div>

                    {/* Stats Grid (Desktop) */}
                    <div className="stats-row">
                      <div className="stat-item">
                        <span className="stat-label">Score</span>
                        <span className="stat-value primary">{item.score}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Correct</span>
                        <span className="stat-value success">{item.userCorrectAnswers.length}</span>
                      </div>
                      <div className="stat-item date-hide-mobile">
                        <span className="stat-label">Submitted</span>
                        <span className="stat-value sm">{new Date(item.endTime).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="card-action">
                      {currUserType === "admin" && (
                        <button
                          className="action-btn"
                          onClick={() => (window.location.href = `/summary/${quizId}/${item.username}`)}
                        >
                          <span>Analysis</span> <ChevronRight size={16} />
                        </button>
                      )}

                      {currUserType === "student" && (
                        isMyCard ? (
                          <button
                            className="action-btn primary"
                            onClick={() => (window.location.href = `/summary/${quizId}/${item.username}`)}
                          >
                            <span>View Analysis</span> <ChevronRight size={16} />
                          </button>
                        ) : (
                          <div className="locked-badge">
                            <Lock size={14} /> Locked
                          </div>
                        )
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;

// ---------------------------------------------------------------------------
// CSS STYLES (MATCHING THEME)
// ---------------------------------------------------------------------------
const css = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

/* --- Global --- */
.page { display: flex; height: 100vh; overflow: hidden; background: linear-gradient(135deg, #f7f3ff, #efe8ff); font-family: 'Poppins', sans-serif; position: relative; color: #333; }
.mobile-menu-btn { display: none; position: fixed; top: 20px; left: 20px; z-index: 1001; width: 50px; height: 50px; border-radius: 12px; background: #fff; border: 2px solid #6a11cb; color: #6a11cb; font-size: 24px; cursor: pointer; box-shadow: 0 4px 15px rgba(106, 17, 203, 0.2); align-items: center; justify-content: center; }
.overlay { display: none; }

/* --- Sidebar (Default: Desktop Compact) --- */
.sidebar { width: 80px; background: #fff; box-shadow: 4px 0 30px rgba(106, 17, 203, 0.1); display: flex; flex-direction: column; padding: 30px 0; position: relative; z-index: 999; transition: all 0.3s ease; height: 100%; flex-shrink: 0; }

.sidebar-header { min-height: 50px; display: flex; align-items: center; justify-content: center; margin-bottom: 40px; padding: 0; }
.logo-desktop { width: 40px; height: 40px; background: linear-gradient(135deg, #6a11cb, #2575fc); border-radius: 12px; color: white; font-size: 24px; font-weight: 800; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(106, 17, 203, 0.3); }
.logo-mobile { display: none; font-size: 32px; font-weight: 800; background: linear-gradient(135deg, #6a11cb, #2575fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

.sidebar-nav { display: flex; flex-direction: column; gap: 8px; padding: 0 10px; flex: 1; overflow-y: auto; }
.nav-btn { padding: 16px; background: transparent; border-radius: 12px; border: none; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: flex-start; gap: 12px; transition: all 0.3s ease; color: #555; font-weight: 500; font-family: 'Poppins', sans-serif; position: relative; width: 100%; }
.nav-btn:hover { background: linear-gradient(135deg, #f5f1ff, #ede5ff); color: #6a11cb; }
.nav-btn.active { background: linear-gradient(135deg, #f0e7ff, #e8deff); color: #6a11cb; font-weight: 600; box-shadow: 0 4px 15px rgba(106, 17, 203, 0.15); }
.nav-btn span:first-child { display: flex; align-items: center; justify-content: center; min-width: 24px; } 
.nav-text { display: none; white-space: nowrap; }

/* Tooltips */
.tooltip-container:hover .tooltip { opacity: 1; visibility: visible; transform: translateX(0); }
.tooltip { position: absolute; left: 70px; top: 50%; transform: translateY(-50%) translateX(-10px); background: #333; color: white; padding: 6px 12px; border-radius: 6px; font-size: 12px; white-space: nowrap; opacity: 0; visibility: hidden; transition: all 0.2s ease; z-index: 1000; pointer-events: none; }
.tooltip::before { content: ''; position: absolute; left: -4px; top: 50%; transform: translateY(-50%); border-width: 4px; border-style: solid; border-color: transparent #333 transparent transparent; }

.logout-btn { padding: 16px; margin: 20px 10px 40px 10px; background: linear-gradient(135deg, #ff416c, #ff4b2b); color: #fff; border-radius: 12px; border: none; font-size: 16px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: flex-start; gap: 12px; box-shadow: 0 6px 20px rgba(255, 65, 108, 0.3); transition: all 0.3s ease; font-family: 'Poppins', sans-serif; position: relative; width: calc(100% - 20px); }
.logout-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(255, 65, 108, 0.4); }
.logout-btn span:first-child { display: flex; align-items: center; justify-content: center; min-width: 24px; }

/* --- Main Content --- */
.main { flex: 1; overflow: hidden; position: relative; display: flex; flex-direction: column; }
.main-content-wrapper { flex: 1; padding: 30px; overflow-y: auto; display: flex; flex-direction: column; max-width: 1000px; margin: 0 auto; width: 100%; box-sizing: border-box; }

.bg-circle-1 { position: absolute; top: -100px; right: -100px; width: 400px; height: 400px; background: rgba(106, 17, 203, 0.08); filter: blur(60px); border-radius: 50%; pointer-events: none; }
.bg-circle-2 { position: absolute; bottom: -150px; left: -150px; width: 500px; height: 500px; background: rgba(37, 117, 252, 0.08); filter: blur(80px); border-radius: 50%; pointer-events: none; }

.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; position: relative; z-index: 2; flex-shrink: 0; }
.page-header h1 { font-size: 28px; font-weight: 700; color: #1a1a1a; margin: 0 0 5px 0; }
.page-header p { color: #666; font-size: 14px; margin: 0; }
.quiz-id-badge { background: #e0d4fc; color: #6a11cb; padding: 6px 12px; border-radius: 8px; font-size: 13px; font-weight: 600; font-family: monospace; letter-spacing: 0.5px; }

/* --- Leaderboard List --- */
.leaderboard-list { display: flex; flex-direction: column; gap: 15px; padding-bottom: 40px; }

.result-card { background: white; border-radius: 16px; padding: 15px 25px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid rgba(255,255,255,0.8); transition: transform 0.2s, box-shadow 0.2s; position: relative; overflow: hidden; }
.result-card:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(106, 17, 203, 0.08); border-color: #e0d4fc; }

.highlight-card { border: 2px solid #6a11cb; background: #fbf9ff; }

/* Rank Badge */
.rank-badge { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 50%; margin-right: 20px; font-weight: 700; flex-shrink: 0; }
.rank-gold { background: #fffbeb; color: #b45309; border: 2px solid #fcd34d; }
.rank-silver { background: #f8fafc; color: #475569; border: 2px solid #cbd5e1; }
.rank-bronze { background: #fff7ed; color: #c2410c; border: 2px solid #fdba74; }
.rank-default { background: #f3f4f6; color: #64748b; font-size: 14px; }
.rank-num { font-size: 16px; }

/* User Info */
.user-info { display: flex; align-items: center; gap: 15px; flex: 2; }
.user-avatar { width: 45px; height: 45px; border-radius: 50%; background: linear-gradient(135deg, #6a11cb, #2575fc); color: white; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; box-shadow: 0 4px 10px rgba(106, 17, 203, 0.2); }
.user-details h3 { margin: 0; font-size: 16px; font-weight: 600; color: #333; }
.username-sub { font-size: 12px; color: #888; }

/* Stats Row */
.stats-row { display: flex; gap: 30px; flex: 2; justify-content: center; }
.stat-item { display: flex; flex-direction: column; align-items: center; }
.stat-label { font-size: 11px; text-transform: uppercase; color: #999; font-weight: 600; letter-spacing: 0.5px; }
.stat-value { font-size: 16px; font-weight: 700; color: #333; }
.stat-value.primary { color: #6a11cb; }
.stat-value.success { color: #10b981; }
.stat-value.sm { font-size: 13px; font-weight: 500; color: #555; }

/* Actions */
.card-action { flex: 1; display: flex; justify-content: flex-end; }
.action-btn { padding: 8px 16px; border-radius: 10px; border: none; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s; background: #f3f4f6; color: #555; }
.action-btn:hover { background: #e5e7eb; }
.action-btn.primary { background: linear-gradient(135deg, #6a11cb, #2575fc); color: white; box-shadow: 0 4px 12px rgba(106, 17, 203, 0.2); }
.action-btn.primary:hover { box-shadow: 0 6px 16px rgba(106, 17, 203, 0.3); transform: translateY(-1px); }

.locked-badge { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: #9ca3af; background: #f3f4f6; padding: 6px 12px; border-radius: 20px; }

.empty-state { text-align: center; padding: 60px 20px; color: #888; background: white; border-radius: 20px; border: 1px dashed #ddd; margin-top: 20px; }
.empty-icon { color: #ddd; margin-bottom: 15px; }

/* Animations */
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; opacity: 0; }

/* --- Responsive --- */
@media(max-width: 900px) {
  .date-hide-mobile { display: none; }
  .result-card { flex-direction: column; align-items: flex-start; gap: 15px; padding: 20px; }
  .rank-badge { position: absolute; top: 20px; right: 0; margin: 0; }
  .stats-row { width: 100%; justify-content: space-between; border-top: 1px solid #f0f0f0; border-bottom: 1px solid #f0f0f0; padding: 12px 0; margin-top: 5px; }
  .card-action { width: 100%; }
  .action-btn { width: 100%; justify-content: center; padding: 12px; }
}

@media(max-width: 768px) {
  .mobile-menu-btn { display: flex; }
  .overlay { display: block; position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); z-index: 998; }
  
  /* Sidebar mobile overrides */
  .sidebar { position: fixed; top: 0; left: 0; bottom: 0; transform: translateX(-100%); width: 280px !important; padding: 30px 20px; }
  .sidebar.mobile-open { transform: translateX(0); }
  
  /* Mobile: Show Text & Full Logo */
  .nav-text { display: inline; }
  .tooltip { display: none !important; }
  .nav-btn { justify-content: flex-start; padding: 16px 20px; }
  .logout-btn { justify-content: flex-start; padding: 16px 20px; margin: 20px; width: auto; }
  
  .logo-desktop { display: none; }
  .logo-mobile { display: block; }

  .main-content-wrapper { padding: 80px 20px 20px; }
}
`;