import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const [user, setUser] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [quizID, setQuizID] = useState("");

  const fetchHomeData = async () => {
    try {
      const token = localStorage.getItem("access");

      const res = await axios.get("http://localhost:5001/profile", {
        headers: { Authorization: "Bearer " + token }
      });

      setUser(res.data.user);

      const quizzes = await axios.get("http://localhost:5001/get-public-quizzes", {
        headers: { Authorization: "Bearer " + token }
      })
      console.log(quizzes.data);
      setUpcoming(quizzes.data);

    } catch (err) {
      alert("Session expired! Login again.");
      window.location.href = "/auth";
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  const handleJoinQuiz = () => {
    if (!quizID.trim()) {
      alert("Please enter a valid Quiz ID.");
      return;
    }
    window.open(
      `/give-quiz/${quizID}`,
      "_blank",
      "toolbar=no,menubar=no,scrollbars=yes,resizable=no,fullscreen=yes"
    );
  };

  if (!user) return (
    <div className="loading">
      <style>{css}</style>
      <div className="spinner"></div>
      <p>Loading...</p>
    </div>
  );

  const avatarLetter = user.name ? user.name[0].toUpperCase() : "U";
  
  const isQuizLive = (quiz) => {
    const now = new Date();
    const start = new Date(quiz.startTime);
    const end = new Date(start.getTime() + quiz.duration * 60000);
    return now >= start && now <= end;
  };

  // Filter quizzes based on user type
  const displayedQuizzes = user.userType === "admin" 
    ? upcoming.filter(q => q.adminIds && q.adminIds.includes(user.username))
    : upcoming;

  return (
    <div className="home-page">
      <style>{css}</style>

      {/* Profile Button */}
      <button className="profile-btn" onClick={() => window.location.href = "/profile"}>
        <div className="profile-avatar">{avatarLetter}</div>
        <span className="profile-name">{user.name}</span>
      </button>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-bg-circles">
          <div className="circle c1"></div>
          <div className="circle c2"></div>
          <div className="circle c3"></div>
          <div className="circle c4"></div>
        </div>

        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-icon">✨</span>
            <span>Welcome Back, {user.name.split(' ')[0]}!</span>
          </div>

          <h1 className="hero-title">
            Ready to
            <br />
            <span className="gradient-text">Challenge Yourself?</span>
          </h1>

          <p className="hero-subtitle">
            Dive into interactive quizzes designed to sharpen your mind and boost your skills.
            <strong> Learn smarter. Practice better. Grow faster.</strong>
          </p>

          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-icon">📚</div>
              <div className="stat-info">
                <div className="stat-number">{upcoming.length}</div>
                <div className="stat-label">Available Quizzes</div>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">🎯</div>
              <div className="stat-info">
                <div className="stat-number">{upcoming.filter(q => isQuizLive(q)).length}</div>
                <div className="stat-label">Live Now</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quizzes Section */}
      <div className="quizzes-section">
        <div className="section-header">
          <div className="section-title-wrap">
            <h2 className="section-title">
              {user.userType === "admin" ? "My Open Quizzes" : "Open Quizzes"}
            </h2>
            <p className="section-subtitle">
              {user.userType === "admin" ? "Manage your created quizzes" : "Jump into a quiz and test your knowledge"}
            </p>
          </div>
        </div>

        <div className="quizzes-grid">
          {displayedQuizzes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No Quizzes Found</h3>
              <p>Check back later or create a new one!</p>
            </div>
          ) : (
            displayedQuizzes.map((q, idx) => {
              const live = isQuizLive(q);
              const hasStarted = new Date(q.startTime) <= new Date();

              return (
                <div key={idx} className={`quiz-card ${live ? 'live' : ''}`}>
                  {live && <div className="live-badge">
                    <span className="pulse-dot"></span>
                    LIVE NOW
                  </div>}

                  <div className="quiz-icon">
                    {live ? "🎯" : "📝"}
                  </div>

                  <h3 className="quiz-title">{q.title}</h3>

                  <div className="quiz-meta">
                    <div className="meta-item">
                      <span className="meta-icon">🕒</span>
                      <div className="meta-content">
                        <span className="meta-label">Start Time</span>
                        <span className="meta-value">
                          {new Date(q.startTime).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="meta-item">
                      <span className="meta-icon">⏱️</span>
                      <div className="meta-content">
                        <span className="meta-label">Duration</span>
                        <span className="meta-value">{q.duration} min</span>
                      </div>
                    </div>
                  </div>

                  <div className="quiz-id">ID: {q.id}</div>

                  {/* Logic for Buttons based on User Type */}
                  {user.userType === "admin" ? (
                    // Admin View: Edit Button (Only if not started)
                    !hasStarted && (
                      <button
                        className="quiz-join-btn"
                        onClick={() => window.location.href = `/edit-quiz/${q.id}`}
                      >
                        Edit Quiz
                        <span className="btn-arrow">✎</span>
                      </button>
                    )
                  ) : (
                    // Student View: Join Button (Only if Live)
                    live && (
                      <button
                        className="quiz-join-btn"
                        onClick={() => window.open(`/give-quiz/${q.id}`, "_blank", "fullscreen=yes")}
                      >
                        Join Now
                        <span className="btn-arrow">→</span>
                      </button>
                    )
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
      {/* Floating Action Buttons */}
      {user.userType === "student" && (
        <button className="fab primary" onClick={() => setShowJoinModal(true)}>
          <span className="fab-icon">🎯</span>
          <span className="fab-text">Give Quiz</span>
        </button>
      )}

      {user.userType === "admin" && (
        <button className="fab secondary" onClick={() => window.location.href = "/create-quiz"}>
          <span className="fab-icon">➕</span>
          <span className="fab-text">Create Quiz</span>
        </button>
      )}

      {/* Join Quiz Modal */}
      {showJoinModal && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <span className="modal-icon">🎯</span>
                Join Quiz
              </h2>
              <button className="modal-close" onClick={() => setShowJoinModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <label className="modal-label">Enter Quiz ID</label>
              <input
                className="modal-input"
                placeholder="e.g., tpq1"
                value={quizID}
                onChange={(e) => setQuizID(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleJoinQuiz()}
                autoFocus
              />
              <small className="modal-hint">Ask your instructor for the quiz ID</small>
            </div>

            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setShowJoinModal(false)}>
                Cancel
              </button>
              <button className="modal-btn join" onClick={handleJoinQuiz}>
                Join Quiz
                <span className="btn-arrow">→</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const css = `
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}
@keyframes pulse{0%,100%{transform:scale(1);opacity:.7}50%{transform:scale(1.05);opacity:1}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeIn{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideIn{from{opacity:0;transform:translateX(-30px)}to{opacity:1;transform:translateX(0)}}
@keyframes scaleIn{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}
@keyframes pulseDot{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.5);opacity:.5}}
@keyframes shine{to{background-position:200% center}}

.loading{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:linear-gradient(135deg,#f7f3ff,#efe8ff);color:#6a11cb;font-family:'Poppins',sans-serif;font-size:18px}
.spinner{width:50px;height:50px;border:4px solid #e8e0ff;border-top:4px solid #6a11cb;border-radius:50%;animation:spin 1s linear infinite;margin-bottom:15px}

.home-page{min-height:100vh;background:linear-gradient(135deg,#f7f3ff 0%,#efe8ff 100%);font-family:'Poppins',sans-serif;overflow-x:hidden;position:relative}

.profile-btn{position:fixed;top:20px;right:20px;display:flex;align-items:center;gap:12px;padding:10px 18px;background:#fff;border:none;border-radius:50px;box-shadow:0 4px 20px rgba(106,17,203,.2);cursor:pointer;transition:all .3s ease;z-index:100;animation:slideIn .6s ease}
.profile-btn:hover{transform:translateY(-2px);box-shadow:0 6px 25px rgba(106,17,203,.3)}
.profile-avatar{width:45px;height:45px;background:linear-gradient(135deg,#6a11cb,#2575fc);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;flex-shrink:0}
.profile-name{font-size:16px;font-weight:600;color:#333}

.hero-section{position:relative;padding:80px 60px 80px;overflow:hidden;animation:fadeIn .8s ease}

.hero-bg-circles{position:absolute;inset:0;overflow:hidden;pointer-events:none}
.circle{position:absolute;border-radius:50%;filter:blur(60px)}
.c1{top:-100px;left:-100px;width:400px;height:400px;background:rgba(106,17,203,.15);animation:float 15s ease-in-out infinite}
.c2{bottom:-150px;right:-150px;width:500px;height:500px;background:rgba(37,117,252,.12);animation:float 18s ease-in-out infinite reverse}
.c3{top:30%;left:40%;width:300px;height:300px;background:rgba(255,80,200,.1);animation:float 20s ease-in-out infinite}
.c4{bottom:20%;left:10%;width:350px;height:350px;background:rgba(106,17,203,.08);animation:float 22s ease-in-out infinite reverse}

.hero-content{max-width:700px;position:relative;z-index:2}

.hero-badge{display:inline-flex;align-items:center;gap:8px;padding:10px 20px;background:#fff;border-radius:50px;box-shadow:0 4px 20px rgba(106,17,203,.15);font-size:14px;font-weight:600;color:#6a11cb;margin-bottom:25px;animation:scaleIn .6s ease .2s backwards}
.badge-icon{font-size:18px}

.hero-title{font-size:64px;font-weight:900;line-height:1.1;color:#1a1a1a;margin-bottom:20px;animation:slideIn .8s ease .3s backwards}
.gradient-text{background:linear-gradient(135deg,#6a11cb,#2575fc,#ff1654);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shine 3s linear infinite}

.hero-subtitle{font-size:20px;line-height:1.7;color:#555;margin-bottom:40px;animation:slideIn .8s ease .4s backwards}
.hero-subtitle strong{color:#6a11cb;font-weight:700}

.hero-stats{display:flex;gap:30px;animation:fadeIn .8s ease .5s backwards}
.stat-item{display:flex;align-items:center;gap:15px;padding:20px 30px;background:#fff;border-radius:20px;box-shadow:0 8px 30px rgba(106,17,203,.12);transition:all .3s ease}
.stat-item:hover{transform:translateY(-5px);box-shadow:0 12px 40px rgba(106,17,203,.2)}
.stat-icon{font-size:40px;animation:pulse 2s ease-in-out infinite}
.stat-number{font-size:32px;font-weight:800;color:#6a11cb;line-height:1}
.stat-label{font-size:14px;color:#666;font-weight:500;margin-top:4px}

.quizzes-section{padding:40px 60px 100px;position:relative;z-index:2}

.section-header{margin-bottom:40px;animation:fadeIn .8s ease .6s backwards}
.section-title-wrap{display:inline-block}
.section-title{display:flex;align-items:center;gap:12px;font-size:36px;font-weight:800;color:#1a1a1a;margin-bottom:8px}
.title-icon{font-size:40px}
.section-subtitle{font-size:16px;color:#666;font-weight:500}

.quizzes-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:25px;animation:fadeIn .8s ease .7s backwards}

.empty-state{grid-column:1/-1;text-align:center;padding:80px 20px;background:#fff;border-radius:30px;box-shadow:0 8px 30px rgba(106,17,203,.1)}
.empty-icon{font-size:80px;margin-bottom:20px;opacity:.5}
.empty-state h3{font-size:24px;font-weight:700;color:#333;margin-bottom:10px}
.empty-state p{font-size:16px;color:#999}

.quiz-card{position:relative;background:#fff;border-radius:24px;padding:30px;box-shadow:0 8px 30px rgba(106,17,203,.1);transition:all .4s cubic-bezier(.175,.885,.32,1.275);cursor:pointer;overflow:hidden}
.quiz-card::before{content:'';position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,#6a11cb,#2575fc);transform:scaleX(0);transition:transform .4s ease}
.quiz-card:hover{transform:translateY(-8px);box-shadow:0 15px 50px rgba(106,17,203,.2)}
.quiz-card:hover::before{transform:scaleX(1)}

.quiz-card.live{border:2px solid #6a11cb;box-shadow:0 8px 30px rgba(106,17,203,.25)}
.quiz-card.live::before{transform:scaleX(1)}

.live-badge{position:absolute;top:20px;right:20px;display:flex;align-items:center;gap:6px;padding:6px 12px;background:linear-gradient(135deg,#6a11cb,#2575fc);color:#fff;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:.5px}
.pulse-dot{width:8px;height:8px;background:#fff;border-radius:50%;animation:pulseDot 1.5s ease-in-out infinite}

.quiz-icon{font-size:48px;margin-bottom:20px;display:inline-block;animation:pulse 3s ease-in-out infinite}

.quiz-title{font-size:22px;font-weight:700;color:#1a1a1a;margin-bottom:20px;line-height:1.3}

.quiz-meta{display:flex;flex-direction:column;gap:12px;margin-bottom:20px}
.meta-item{display:flex;align-items:center;gap:12px}
.meta-icon{font-size:20px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#f0e7ff,#e8deff);border-radius:10px}
.meta-content{flex:1}
.meta-label{display:block;font-size:12px;color:#999;font-weight:500}
.meta-value{display:block;font-size:15px;color:#333;font-weight:600;margin-top:2px}

.quiz-id{font-size:13px;color:#999;font-style:italic;margin-bottom:15px}

.quiz-join-btn{width:100%;padding:14px;background:linear-gradient(135deg,#6a11cb,#2575fc);color:#fff;border:none;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .3s ease;font-family:'Poppins',sans-serif}
.quiz-join-btn:hover{transform:translateX(5px);box-shadow:0 6px 20px rgba(106,17,203,.4)}
.btn-arrow{font-size:20px;transition:transform .3s ease}
.quiz-join-btn:hover .btn-arrow{transform:translateX(5px)}

.fab{position:fixed;bottom:30px;right:30px;display:flex;align-items:center;gap:12px;padding:18px 28px;border:none;border-radius:50px;font-size:16px;font-weight:700;cursor:pointer;box-shadow:0 8px 30px rgba(0,0,0,.2);transition:all .3s ease;z-index:90;font-family:'Poppins',sans-serif}
.fab:hover{transform:translateY(-3px);box-shadow:0 12px 40px rgba(0,0,0,.3)}
.fab.primary{background:linear-gradient(135deg,#6a11cb,#2575fc);color:#fff}
.fab.secondary{bottom:110px;background:#fff;color:#6a11cb;border:2px solid #6a11cb}
.fab-icon{font-size:22px}

.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px;animation:fadeIn .3s ease}

.modal{width:100%;max-width:500px;background:#fff;border-radius:28px;overflow:hidden;box-shadow:0 20px 60px rgba(106,17,203,.3);animation:scaleIn .3s ease}

.modal-header{background:linear-gradient(135deg,#6a11cb,#2575fc);padding:30px;display:flex;align-items:center;justify-content:space-between}
.modal-header h2{display:flex;align-items:center;gap:12px;font-size:26px;font-weight:800;color:#fff;margin:0}
.modal-icon{font-size:32px}
.modal-close{width:40px;height:40px;background:rgba(255,255,255,.2);border:none;color:#fff;border-radius:50%;font-size:24px;cursor:pointer;transition:all .3s ease;display:flex;align-items:center;justify-content:center}
.modal-close:hover{background:rgba(255,255,255,.3);transform:rotate(90deg)}

.modal-body{padding:35px}
.modal-label{display:block;font-size:15px;font-weight:600;color:#333;margin-bottom:10px}
.modal-input{width:100%;padding:16px 20px;border:2px solid #e8e0ff;border-radius:14px;font-size:16px;font-family:'Poppins',sans-serif;transition:all .3s ease;box-sizing:border-box}
.modal-input:focus{outline:none;border-color:#6a11cb;box-shadow:0 0 0 4px rgba(106,17,203,.1)}
.modal-hint{display:block;margin-top:10px;font-size:13px;color:#999;font-style:italic}

.modal-actions{padding:0 35px 35px;display:flex;gap:15px}
.modal-btn{flex:1;padding:16px;border:none;border-radius:14px;font-size:16px;font-weight:700;cursor:pointer;transition:all .3s ease;font-family:'Poppins',sans-serif;display:flex;align-items:center;justify-content:center;gap:8px}
.modal-btn.cancel{background:#f5f5f5;color:#666}
.modal-btn.cancel:hover{background:#e8e8e8}
.modal-btn.join{background:linear-gradient(135deg,#6a11cb,#2575fc);color:#fff;box-shadow:0 6px 20px rgba(106,17,203,.3)}
.modal-btn.join:hover{transform:translateY(-2px);box-shadow:0 8px 25px rgba(106,17,203,.4)}

@media(max-width:768px){
  .hero-section{padding:120px 25px 60px}
  .hero-title{font-size:40px}
  .hero-subtitle{font-size:17px}
  .hero-stats{flex-direction:column;gap:15px}
  .stat-item{width:100%;justify-content:flex-start}
  .quizzes-section{padding:30px 25px 100px}
  .section-title{font-size:28px}
  .quizzes-grid{grid-template-columns:1fr;gap:20px}
  .profile-btn{top:15px;right:15px;padding:8px 14px}
  .profile-avatar{width:38px;height:38px;font-size:18px}
  .profile-name{font-size:14px}
  .fab{bottom:20px;right:20px;padding:14px 20px;font-size:15px}
  .fab.secondary{bottom:90px}
  .fab-text{display:none}
  .modal-header{padding:25px}
  .modal-body{padding:25px}
  .modal-actions{padding:0 25px 25px;flex-direction:column}
}
`;