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
  Target,
  CheckCircle,
  XCircle,
  Award,
  Hash
} from "lucide-react";

export default function Summary() {
  const { quizId, username } = useParams();
  
  // --- State ---
  const [userResult, setUserResult] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [rank, setRank] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem("access");
        if (!token) {
           window.location.href = `${window.location.origin}/auth`;
           return;
        }

        // 1. Fetch All Results to calculate Rank & get User Data
        const res1 = await axios.get(`http://localhost:5001/quiz-results/${quizId}`, {
            headers: { Authorization: "Bearer " + token },
        });

        // 2. Fetch Quiz Questions
        const res2 = await axios.get(`http://localhost:5001/quiz/${quizId}`,{
          headers:{Authorization:"Bearer "+token},
        });

        if (res1.data) {
          // Process Results
          const allResults = Object.keys(res1.data).map(user => ({
            username: user,
            ...res1.data[user]
          }));

          // Sort by score desc to find rank
          allResults.sort((a, b) => b.score - a.score);

          // Find current user's rank and data
          const userIndex = allResults.findIndex(r => r.username === username);
          if (userIndex !== -1) {
            setRank(userIndex + 1);
            setUserResult(allResults[userIndex]);
          }
        }

        if (res2.data && res2.data.questions) {
          setQuestions(res2.data.questions);
        }

        setLoading(false);

      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchResults();
  }, [quizId, username]);

  const logout = () => {
    localStorage.removeItem("access");
    window.location.href = `${window.location.origin}/auth`;
  };

  // --- Helpers ---
  const isCorrect = (questionId) => {
    if (!userResult || !userResult.userCorrectAnswers) return false;
    return userResult.userCorrectAnswers.includes(questionId);
  };

  const getCorrectAnswerText = (q) => {
    if (q.type === "integer") {
      return q.correctInteger;
    } else if (q.type === "mcq") {
      return `${String.fromCharCode(65 + q.correctIndex)}. ${q.options[q.correctIndex]}`;
    }
    return "N/A";
  };

  // --- Render ---
  
  if (loading) return (
    <div className="loading-state">
      <style>{css}</style>
      <div className="spinner"></div>
      <p>Loading Analysis...</p>
    </div>
  );

  if (!userResult) return (
    <div className="loading-state">
      <style>{css}</style>
      <p>Result not found for this user.</p>
      <button className="back-btn" onClick={() => window.history.back()}>Go Back</button>
    </div>
  );

  return (
    <div className="page">
      <style>{css}</style>

      {/* Mobile Toggle */}
      <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Navigation */}
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

      {mobileMenuOpen && <div className="overlay" onClick={() => setMobileMenuOpen(false)}></div>}

      {/* Main Content Area */}
      <div className="main">
        <div className="bg-circle-1"></div>
        <div className="bg-circle-2"></div>

        <div className="main-content-wrapper">
          
          <header className="page-header">
            <div className="header-left">
              <h1>Performance Summary</h1>
              <p>Detailed analysis for <strong>@{username}</strong></p>
            </div>
            <div className="header-right">
               <div className="quiz-id-badge">ID: {quizId}</div>
            </div>
          </header>

          {/* Top Stats Cards */}
          <div className="stats-overview">
            <div className="summary-card rank-card">
              <div className="icon-wrapper gold">
                <Trophy size={24} />
              </div>
              <div className="stat-info">
                <span className="label">Rank</span>
                <span className="value">#{rank}</span>
              </div>
            </div>

            <div className="summary-card score-card">
              <div className="icon-wrapper purple">
                <Target size={24} />
              </div>
              <div className="stat-info">
                <span className="label">Score</span>
                <span className="value">{userResult.score}</span>
              </div>
            </div>

            <div className="summary-card correct-card">
              <div className="icon-wrapper green">
                <CheckCircle size={24} />
              </div>
              <div className="stat-info">
                <span className="label">Correct Answers</span>
                <span className="value">{userResult.userCorrectAnswers.length} <span className="total-q">/ {questions.length}</span></span>
              </div>
            </div>
          </div>

          <div className="divider-line"></div>

          <h2 className="section-title">Question Analysis</h2>

          {/* Question Grid */}
          <div className="questions-grid">
            {questions.map((q, index) => {
              const correct = isCorrect(q._id);
              return (
                <div key={q._id} className={`analysis-card ${correct ? 'correct-border' : 'wrong-border'}`}>
                  <div className="ac-header">
                    <span className="q-num">Q{index + 1}</span>
                    <div className={`status-badge ${correct ? 'status-correct' : 'status-wrong'}`}>
                      {correct ? (
                        <><CheckCircle size={14} /> Correct</>
                      ) : (
                        <><XCircle size={14} /> Incorrect</>
                      )}
                    </div>
                  </div>

                  <div className="ac-body">
                    <p className="q-text">{q.text}</p>
                    
                    <div className="answer-block">
                      <span className="ans-label">Correct Answer:</span>
                      <span className="ans-value">{getCorrectAnswerText(q)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CSS STYLES (Quintz Theme)
// ---------------------------------------------------------------------------
const css = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

/* --- Global --- */
.page { display: flex; height: 100vh; overflow: hidden; background: linear-gradient(135deg, #f7f3ff, #efe8ff); font-family: 'Poppins', sans-serif; position: relative; color: #333; }
.mobile-menu-btn { display: none; position: fixed; top: 20px; left: 20px; z-index: 1001; width: 50px; height: 50px; border-radius: 12px; background: #fff; border: 2px solid #6a11cb; color: #6a11cb; font-size: 24px; cursor: pointer; box-shadow: 0 4px 15px rgba(106, 17, 203, 0.2); align-items: center; justify-content: center; }
.overlay { display: none; }

/* --- Sidebar --- */
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
.logout-btn { padding: 16px; margin: 20px 10px 40px 10px; background: linear-gradient(135deg, #ff416c, #ff4b2b); color: #fff; border-radius: 12px; border: none; font-size: 16px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: flex-start; gap: 12px; box-shadow: 0 6px 20px rgba(255, 65, 108, 0.3); transition: all 0.3s ease; font-family: 'Poppins', sans-serif; position: relative; width: calc(100% - 20px); }
.logout-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(255, 65, 108, 0.4); }
.logout-btn span:first-child { display: flex; align-items: center; justify-content: center; min-width: 24px; }
.tooltip-container:hover .tooltip { opacity: 1; visibility: visible; transform: translateX(0); }
.tooltip { position: absolute; left: 70px; top: 50%; transform: translateY(-50%) translateX(-10px); background: #333; color: white; padding: 6px 12px; border-radius: 6px; font-size: 12px; white-space: nowrap; opacity: 0; visibility: hidden; transition: all 0.2s ease; z-index: 1000; pointer-events: none; }
.tooltip::before { content: ''; position: absolute; left: -4px; top: 50%; transform: translateY(-50%); border-width: 4px; border-style: solid; border-color: transparent #333 transparent transparent; }

/* --- Main Content --- */
.main { flex: 1; overflow: hidden; position: relative; display: flex; flex-direction: column; }
.main-content-wrapper { flex: 1; padding: 30px; overflow-y: auto; display: flex; flex-direction: column; max-width: 1200px; margin: 0 auto; width: 100%; box-sizing: border-box; }
.bg-circle-1 { position: absolute; top: -100px; right: -100px; width: 400px; height: 400px; background: rgba(106, 17, 203, 0.08); filter: blur(60px); border-radius: 50%; pointer-events: none; }
.bg-circle-2 { position: absolute; bottom: -150px; left: -150px; width: 500px; height: 500px; background: rgba(37, 117, 252, 0.08); filter: blur(80px); border-radius: 50%; pointer-events: none; }

/* --- Header --- */
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; position: relative; z-index: 2; flex-shrink: 0; }
.page-header h1 { font-size: 28px; font-weight: 700; color: #1a1a1a; margin: 0 0 5px 0; }
.page-header p { color: #666; font-size: 14px; margin: 0; }
.quiz-id-badge { background: #e0d4fc; color: #6a11cb; padding: 6px 12px; border-radius: 8px; font-size: 13px; font-weight: 600; font-family: monospace; letter-spacing: 0.5px; }

/* --- Stats Cards --- */
.stats-overview { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; }
.summary-card { background: white; padding: 20px; border-radius: 16px; box-shadow: 0 8px 20px rgba(106, 17, 203, 0.08); display: flex; align-items: center; gap: 20px; border: 1px solid rgba(255,255,255,0.6); transition: transform 0.2s; }
.summary-card:hover { transform: translateY(-3px); }
.icon-wrapper { width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.icon-wrapper.gold { background: #fffbeb; color: #b45309; }
.icon-wrapper.purple { background: #f3e8ff; color: #8b5cf6; }
.icon-wrapper.green { background: #dcfce7; color: #16a34a; }

.stat-info { display: flex; flex-direction: column; }
.stat-info .label { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
.stat-info .value { font-size: 24px; font-weight: 800; color: #1e293b; }
.total-q { font-size: 14px; color: #94a3b8; font-weight: 500; }

.divider-line { height: 1px; background: #e2e8f0; margin-bottom: 30px; }
.section-title { font-size: 20px; font-weight: 700; color: #333; margin-bottom: 20px; }

/* --- Question Grid --- */
.questions-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; padding-bottom: 40px; }
.analysis-card { background: white; border-radius: 16px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); display: flex; flex-direction: column; border-left: 4px solid transparent; }
.correct-border { border-left-color: #22c55e; }
.wrong-border { border-left-color: #ef4444; }

.ac-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.q-num { background: #f1f5f9; color: #64748b; font-size: 12px; font-weight: 700; padding: 4px 8px; border-radius: 6px; }
.status-badge { font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 20px; }
.status-correct { background: #dcfce7; color: #16a34a; }
.status-wrong { background: #fee2e2; color: #ef4444; }

.ac-body { flex: 1; display: flex; flex-direction: column; }
.q-text { font-size: 14px; color: #333; margin-bottom: 15px; font-weight: 500; line-height: 1.5; }
.answer-block { margin-top: auto; background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0; }
.ans-label { display: block; font-size: 11px; color: #64748b; font-weight: 600; margin-bottom: 2px; }
.ans-value { font-size: 13px; color: #0f172a; font-weight: 600; }

.loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; color: #6a11cb; font-weight: 500; }
.spinner { width: 40px; height: 40px; border: 4px solid #e0d4fc; border-top: 4px solid #6a11cb; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px; }
@keyframes spin { to { transform: rotate(360deg); } }
.back-btn { margin-top: 15px; padding: 10px 20px; background: #6a11cb; color: white; border: none; border-radius: 8px; cursor: pointer; }

/* --- Responsive --- */
@media(max-width: 900px) {
  .stats-overview { grid-template-columns: 1fr; }
}

@media(max-width: 768px) {
  .mobile-menu-btn { display: flex; }
  .overlay { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 998; }
  .sidebar { position: fixed; top: 0; left: 0; bottom: 0; transform: translateX(-100%); width: 280px !important; padding: 30px 20px; }
  .sidebar.mobile-open { transform: translateX(0); }
  .nav-text { display: inline; }
  .tooltip { display: none !important; }
  .nav-btn { justify-content: flex-start; padding: 16px 20px; }
  .logout-btn { justify-content: flex-start; padding: 16px 20px; margin: 20px; width: auto; }
  .logo-desktop { display: none; }
  .logo-mobile { display: block; }
  .main-content-wrapper { padding: 80px 20px 20px; }
}
`;