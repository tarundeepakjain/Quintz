import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Home, 
  Clock, 
  BarChart2, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Calendar, 
  Timer, 
  CheckCircle, 
  Lock,
  ChevronRight
} from "lucide-react";

export default function PastQuizzes() {
  // ---------------------------------------------------------------------------
  // EXISTING LOGIC & STATE (Preserved)
  // ---------------------------------------------------------------------------
  const [pastQuizzes, setPastQuizzes] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // UI State for sidebar

  useEffect(() => {
    const fetchPastQuizzes = async () => {
      try {
        const token = localStorage.getItem("access");
        const res = await axios.get("http://localhost:5001/past-quizzes", {
          headers: { Authorization: "Bearer " + token },
        });
        setPastQuizzes(res.data);
      } catch (err) {
        console.log(err);
        // Fallback for preview if backend is down (Optional, keeps UI visible)
        setPastQuizzes([
           { id: "tq1", title: "Public Quiz 1", startTime: "2025-12-06T23:00", duration: 60, resultTime: "2025-12-07T00:00" },
           { id: "tq3", title: "Quiz3", startTime: "2025-12-06T23:00", duration: 30, resultTime: "2025-12-07T14:28" },
        ]);
      }
    };

    fetchPastQuizzes();
  }, []);

  const isResultAvailable = (resultTimeString) => {
    const now = new Date();
    const resultTime = new Date(resultTimeString);
    return now >= resultTime;
  };

  const logout = () => {
    localStorage.removeItem("access");
    window.location.href = `${window.location.origin}/auth`;
  };

  // ---------------------------------------------------------------------------
  // NEW UI RENDERING (MATCHING CreateQuiz.js & Profile.js)
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
          {/* Logo switches based on CSS (Desktop vs Mobile) */}
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

          <button className="nav-btn tooltip-container">
            <span><BarChart2 size={22} /></span>
            <span className="nav-text">Performance</span>
            <span className="tooltip">Performance</span>
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
             <h1>Past Quizzes</h1>
             <p>Track your history and review your performance</p>
          </header>

          {pastQuizzes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><Clock size={48} /></div>
              <h3>No Past Quizzes Found</h3>
              <p>You haven't participated in any quizzes yet.</p>
            </div>
          ) : (
            <div className="quiz-grid">
              {pastQuizzes.map((quiz, index) => {
                const resultsReady = isResultAvailable(quiz.resultTime);
                return (
                  <div key={index} className="quiz-card animate-fadeIn">
                    <div className="card-top">
                        <div className="card-title-group">
                          <h2>{quiz.title}</h2>
                          <span className="quiz-id">ID: {quiz.id}</span>
                        </div>
                    </div>
                    
                    <div className="card-divider"></div>

                    <div className="card-info">
                      <div className="info-row">
                        <div className="icon-box purple"><Calendar size={16} /></div>
                        <div className="info-text">
                          <label>Started On</label>
                          <span>{new Date(quiz.startTime).toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="info-row">
                        <div className="icon-box blue"><Timer size={16} /></div>
                        <div className="info-text">
                          <label>Duration</label>
                          <span>{quiz.duration} Minutes</span>
                        </div>
                      </div>

                      <div className="info-row">
                        <div className="icon-box green"><CheckCircle size={16} /></div>
                        <div className="info-text">
                          <label>Result Time</label>
                          <span>{new Date(quiz.resultTime).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="card-actions">
                      {resultsReady ? (
                        <button 
                          className="view-btn"
                          onClick={() => window.location.href = `/view-results/${quiz.id}`}
                        >
                          View Results <ChevronRight size={16} />
                        </button>
                      ) : (
                        <div className="disabled-btn">
                          <Lock size={14} /> Results Not Available
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CSS STYLES (MATCHING CreateQuiz.js & Profile.js)
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
.nav-btn span:first-child { display: flex; align-items: center; justify-content: center; min-width: 24px; } /* Icon wrapper */
.nav-text { display: none; white-space: nowrap; }

/* Tooltips (Only for Desktop) */
.tooltip-container:hover .tooltip { opacity: 1; visibility: visible; transform: translateX(0); }
.tooltip { position: absolute; left: 70px; top: 50%; transform: translateY(-50%) translateX(-10px); background: #333; color: white; padding: 6px 12px; border-radius: 6px; font-size: 12px; white-space: nowrap; opacity: 0; visibility: hidden; transition: all 0.2s ease; z-index: 1000; pointer-events: none; }
.tooltip::before { content: ''; position: absolute; left: -4px; top: 50%; transform: translateY(-50%); border-width: 4px; border-style: solid; border-color: transparent #333 transparent transparent; }

.logout-btn { padding: 16px; margin: 20px 10px 40px 10px; background: linear-gradient(135deg, #ff416c, #ff4b2b); color: #fff; border-radius: 12px; border: none; font-size: 16px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: flex-start; gap: 12px; box-shadow: 0 6px 20px rgba(255, 65, 108, 0.3); transition: all 0.3s ease; font-family: 'Poppins', sans-serif; position: relative; width: calc(100% - 20px); }
.logout-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(255, 65, 108, 0.4); }
.logout-btn span:first-child { display: flex; align-items: center; justify-content: center; min-width: 24px; }

/* --- Main Content --- */
.main { flex: 1; overflow: hidden; position: relative; display: flex; flex-direction: column; }
.main-content-wrapper { flex: 1; padding: 30px; overflow-y: auto; display: flex; flex-direction: column; max-width: 1600px; margin: 0 auto; width: 100%; box-sizing: border-box; }

.bg-circle-1 { position: absolute; top: -100px; right: -100px; width: 400px; height: 400px; background: rgba(106, 17, 203, 0.08); filter: blur(60px); border-radius: 50%; pointer-events: none; }
.bg-circle-2 { position: absolute; bottom: -150px; left: -150px; width: 500px; height: 500px; background: rgba(37, 117, 252, 0.08); filter: blur(80px); border-radius: 50%; pointer-events: none; }

.page-header { margin-bottom: 40px; position: relative; z-index: 2; flex-shrink: 0; }
.page-header h1 { font-size: 36px; font-weight: 700; color: #1a1a1a; margin: 0 0 10px 0; }
.page-header p { font-size: 16px; color: #666; margin: 0; }

/* --- Quiz Grid & Cards --- */
.quiz-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 30px; position: relative; z-index: 2; padding-bottom: 40px; }

.quiz-card { background: white; border-radius: 20px; padding: 25px; box-shadow: 0 10px 30px rgba(106, 17, 203, 0.05); transition: all 0.3s ease; border: 1px solid rgba(255,255,255,0.5); display: flex; flex-direction: column; }
.quiz-card:hover { transform: translateY(-5px); box-shadow: 0 15px 40px rgba(106, 17, 203, 0.12); border-color: #e0d4fc; }

.card-top { margin-bottom: 15px; }
.card-title-group h2 { font-size: 20px; font-weight: 700; color: #6a11cb; margin: 0 0 5px 0; line-height: 1.4; }
.quiz-id { font-size: 12px; color: #999; background: #f5f5f5; padding: 2px 8px; border-radius: 4px; font-family: monospace; }

.card-divider { height: 1px; background: #f0f0f0; margin-bottom: 20px; }

.card-info { display: flex; flex-direction: column; gap: 15px; margin-bottom: 25px; flex: 1; }
.info-row { display: flex; align-items: center; gap: 12px; }
.icon-box { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.icon-box.purple { background: #f3e8ff; color: #8b5cf6; }
.icon-box.blue { background: #e0f2fe; color: #0ea5e9; }
.icon-box.green { background: #dcfce7; color: #22c55e; }

.info-text { display: flex; flex-direction: column; }
.info-text label { font-size: 11px; text-transform: uppercase; color: #888; font-weight: 600; letter-spacing: 0.5px; }
.info-text span { font-size: 14px; font-weight: 500; color: #333; }

.card-actions { margin-top: auto; }
.view-btn { width: 100%; padding: 12px; background: linear-gradient(135deg, #6a11cb, #2575fc); color: white; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; font-family: 'Poppins', sans-serif; display: flex; align-items: center; justify-content: center; gap: 8px; transition: opacity 0.2s; }
.view-btn:hover { opacity: 0.9; box-shadow: 0 4px 15px rgba(106, 17, 203, 0.2); }

.disabled-btn { width: 100%; padding: 12px; background: #f3f4f6; color: #9ca3af; border-radius: 12px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: not-allowed; font-size: 14px; }

.empty-state { text-align: center; padding: 60px 20px; color: #888; grid-column: 1 / -1; }
.empty-icon { color: #ddd; margin-bottom: 15px; }

/* Animations */
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }

/* --- Responsive --- */
@media(max-width: 768px) {
  .mobile-menu-btn { display: flex; }
  .overlay { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 998; }
  
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
  .quiz-grid { grid-template-columns: 1fr; }
}
`;