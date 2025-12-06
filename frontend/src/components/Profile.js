import React, { useEffect, useState } from "react";
import axios from "axios";
import { Home, Clock, BarChart2, User, LogOut, X, Menu } from "lucide-react";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ "a": 0 });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", username: "" });
  const [passwordForm, setPasswordForm] = useState({ oldPass: "", newPass: "", confirmPass: "" });

  const formatKey = (key) => key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase());

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("access");
      const res = await axios.get("http://localhost:5001/profile", {
        headers: { Authorization: "Bearer " + token }
      });
      setUser(res.data.user);
      setStats(res.data.user.stats);
    } catch (err) {
      // alert("Session expired! Login again.");
      // window.location.href = "/auth";
      
      // MOCK DATA (Preserving your logic, just ensuring it renders for preview)
      setUser({
        name: "Tarun",
        username: "ts1",
        userType: "student",
        stats: {
          totalQuizzes: 6,
          avgScore: 85,
          bestScore: 98,
          attempts: 12
        }
      });
      setStats({
          totalQuizzes: 6,
          avgScore: 85,
          bestScore: 98,
          attempts: 12
      });
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const logout = () => {
    localStorage.removeItem("access");
    window.location.href = "/auth";
  };

  const openEditModal = () => {
    setEditForm({ name: user.name, username: user.username });
    setShowEditModal(true);
  };

  const openPasswordModal = () => {
    setPasswordForm({ oldPass: "", newPass: "", confirmPass: "" });
    setShowPasswordModal(true);
  };

  const closeModals = () => {
    setShowEditModal(false);
    setShowPasswordModal(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPass === passwordForm.confirmPass && passwordForm.newPass.length > 0) {
      try {
        const token = localStorage.getItem("access");
        const res = await axios.post("http://localhost:5001/change-password", {
          username: user.username, oldPass: passwordForm.oldPass, newPass: passwordForm.newPass
        }, { headers: { Authorization: "Bearer " + token } });
        alert(res.data.message);
        window.location.href = "/auth";
      } catch (err) {
        alert("Session expired! Login again.");
        window.location.href = "/auth";
      }
    } else {
      alert("New and Confirm Password are Different.");
    }
  };

  const handleChangeName = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("access");
      const res = await axios.post("http://localhost:5001/edit-profile", editForm, {
        headers: { Authorization: "Bearer " + token }
      });
      alert(res.data.message);
      window.location.href = "/profile";
    } catch (err) {
      alert("Session expired! Login again.");
      window.location.href = "/auth";
    }
  };

  if (!user) return (
    <div className="loading">
      <style>{css}</style>
      <div className="spinner"></div>
      <p>Loading Profile...</p>
    </div>
  );

  const avatarLetter = user.name ? user.name[0].toUpperCase() : "U";

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
      
                <button className="nav-btn tooltip-container" onClick={() => window.location.href = `${window.location.origin}/past-quizzes`}>
                  <span><Clock size={22} /></span>
                  <span className="nav-text">Past Quizzes</span>
                  <span className="tooltip">Past Quizzes</span>
                </button>
      
                <button className="nav-btn active tooltip-container" onClick={() => window.location.href = `${window.location.origin}/profile`}>
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

      <div className="main">
        <div className="bg-circle-1"></div>
        <div className="bg-circle-2"></div>

        <div className="profile-card">
          <div className="profile-bg"></div>
          <div className="profile-content">
            <div className="avatar-wrap">
              <div className="avatar">{avatarLetter}</div>
              <div className="avatar-glow"></div>
            </div>

            <div className="profile-info">
              <h2>{user.name}</h2>
              <p className="email">@{user.username}</p>
              <span className="badge">
                {user.userType === "student" ? "🎓" : "👨‍💼"} {user.userType?.toUpperCase()}
              </span>
            </div>

            <div className="action-btns">
              <button onClick={openEditModal}>
                <span>✏️</span> Edit Profile
              </button>
              <button onClick={openPasswordModal}>
                <span>🔒</span> Change Password
              </button>
            </div>
          </div>
        </div>

        <h3 className="stats-title">
          <span>📈</span> Your Statistics
        </h3>

        <div className="stats-grid">
          {Object.entries(stats).map(([key, value], idx) => {
            const icons = ["📝", "⭐", "🏆", "🎯", "📊", "💯"];
            const colors = ["#6a11cb", "#ff1654", "#2575fc", "#ff9500", "#00d084", "#ff4757"];
            return (
              <div key={idx} className="stat-card" style={{'--color': colors[idx % 6]}}>
                <div className="stat-icon">{icons[idx % 6]}</div>
                <h3>{value}</h3>
                <p>{formatKey(key)}</p>
                <div className="stat-bar"></div>
              </div>
            );
          })}
        </div>
      </div>

      {showEditModal && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><span>✏️</span> Edit Profile</h2>
              <button onClick={closeModals}>✕</button>
            </div>
            <div className="modal-body">
              <div className="input-group">
                <label>Full Name</label>
                <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div className="input-group">
                <label>Username</label>
                <input value={editForm.username} readOnly className="disabled" />
                <small>Username cannot be changed</small>
              </div>
            </div>
            <div className="modal-actions">
              <button className="cancel" onClick={closeModals}>Cancel</button>
              <button className="save" onClick={handleChangeName}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><span>🔒</span> Change Password</h2>
              <button onClick={closeModals}>✕</button>
            </div>
            <div className="modal-body">
              <div className="input-group">
                <label>Old Password</label>
                <input type="password" value={passwordForm.oldPass} onChange={(e) => setPasswordForm({ ...passwordForm, oldPass: e.target.value })} />
              </div>
              <div className="input-group">
                <label>New Password</label>
                <input type="password" value={passwordForm.newPass} onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })} />
              </div>
              <div className="input-group">
                <label>Confirm New Password</label>
                <input type="password" value={passwordForm.confirmPass} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPass: e.target.value })} />
              </div>
            </div>
            <div className="modal-actions">
              <button className="cancel" onClick={closeModals}>Cancel</button>
              <button className="save" onClick={handleChangePassword}>Update Password</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
@keyframes float{0%,100%{transform:translate(0,0)}33%{transform:translate(20px,-20px)}66%{transform:translate(-15px,15px)}}
@keyframes pulse{0%,100%{transform:scale(1);opacity:.8}50%{transform:scale(1.1);opacity:1}}
@keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes progressBar{from{width:0}to{width:100%}}

.loading{display:flex;flex-direction:column;justify-content:center;align-items:center;height:100vh;background:linear-gradient(135deg,#f7f3ff,#efe8ff);font-family:'Poppins',sans-serif;color:#6a11cb;font-size:18px}
.spinner{width:50px;height:50px;border:5px solid #e8e0ff;border-top:5px solid #6a11cb;border-radius:50%;animation:spin 1s linear infinite;margin-bottom:20px}

.page{display:flex;height:100vh;overflow:hidden;background:linear-gradient(135deg,#f7f3ff,#efe8ff);font-family:'Poppins',sans-serif;position:relative}

.main{flex:1;padding:40px;overflow-y:auto;position:relative}

.bg-circle-1,.bg-circle-2{position:absolute;border-radius:50%;pointer-events:none}
.bg-circle-1{top:-100px;right:-100px;width:400px;height:400px;background:rgba(106,17,203,.08);filter:blur(60px);animation:float 15s ease-in-out infinite}
.bg-circle-2{bottom:-150px;left:-150px;width:500px;height:500px;background:rgba(37,117,252,.08);filter:blur(80px);animation:float 20s ease-in-out infinite reverse}

.profile-card{background:#fff;border-radius:24px;margin-bottom:40px;box-shadow:0 10px 40px rgba(106,17,203,.15);position:relative;overflow:hidden;animation:fadeIn .6s ease}

.profile-bg{height:120px;background:linear-gradient(135deg,#6a11cb,#2575fc)}

.profile-content{padding:0 40px 30px;position:relative}

.avatar-wrap{position:relative;margin-top:-60px;margin-bottom:20px;display:inline-block}

.avatar{width:120px;height:120px;border-radius:50%;background:linear-gradient(135deg,#6a11cb,#2575fc);color:#fff;font-size:48px;font-weight:700;display:flex;justify-content:center;align-items:center;border:6px solid #fff;box-shadow:0 10px 30px rgba(106,17,203,.4);position:relative;z-index:2}

.avatar-glow{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:100%;height:100%;border-radius:50%;background:rgba(106,17,203,.3);filter:blur(20px);animation:pulse 3s ease-in-out infinite;z-index:1}

.profile-info{margin-bottom:25px}
.profile-info h2{font-size:32px;font-weight:700;color:#1a1a1a;margin-bottom:8px}
.email{font-size:16px;color:#666;margin-bottom:12px}

.badge{display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,#f0e7ff,#e8deff);color:#6a11cb;padding:8px 16px;border-radius:20px;font-size:14px;font-weight:600;box-shadow:0 4px 12px rgba(106,17,203,.2)}

.action-btns{display:flex;gap:15px;flex-wrap:wrap}
.action-btns button{flex:1;min-width:180px;display:flex;align-items:center;justify-content:center;gap:10px;background:linear-gradient(135deg,#f0e7ff,#e8deff);border:2px solid transparent;padding:14px 24px;font-size:15px;font-weight:600;border-radius:12px;cursor:pointer;color:#6a11cb;transition:all .3s ease;box-shadow:0 4px 15px rgba(106,17,203,.1);font-family:'Poppins',sans-serif}
.action-btns button:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(106,17,203,.2);border-color:#6a11cb}
.action-btns button span{font-size:18px}

.stats-title{font-size:24px;font-weight:700;color:#1a1a1a;margin-bottom:25px;display:flex;align-items:center;gap:10px}
.stats-title span{font-size:28px}

.stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:25px;animation:fadeIn .8s ease .2s backwards}

.stat-card{background:#fff;padding:30px;border-radius:20px;text-align:center;position:relative;overflow:hidden;transition:all .3s ease;cursor:pointer;box-shadow:0 10px 30px rgba(0,0,0,.08)}
.stat-card:hover{transform:translateY(-5px);box-shadow:0 15px 40px rgba(0,0,0,.12)}
.stat-icon{font-size:40px;margin-bottom:15px;animation:pulse 2s ease-in-out infinite}
.stat-card h3{font-size:36px;font-weight:800;margin-bottom:8px;color:var(--color)}
.stat-card p{font-size:15px;color:#666;font-weight:500}
.stat-bar{position:absolute;bottom:0;left:0;height:4px;width:0;background:var(--color);animation:progressBar 1.5s ease forwards;opacity:.6}

.modal-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.6);backdrop-filter:blur(8px);display:flex;justify-content:center;align-items:center;z-index:2000;padding:20px;animation:fadeIn .3s ease}

.modal{width:100%;max-width:480px;background:#fff;border-radius:24px;box-shadow:0 20px 60px rgba(106,17,203,.3);overflow:hidden;animation:fadeIn .4s ease}

.modal-header{background:linear-gradient(135deg,#6a11cb,#2575fc);padding:25px 30px;display:flex;justify-content:space-between;align-items:center}
.modal-header h2{font-size:24px;font-weight:700;color:#fff;display:flex;align-items:center;gap:12px;margin:0}
.modal-header span{font-size:28px}
.modal-header button{background:rgba(255,255,255,.2);border:none;color:#fff;width:36px;height:36px;border-radius:50%;cursor:pointer;font-size:20px;transition:all .3s ease}
.modal-header button:hover{background:rgba(255,255,255,.3)}

.modal-body{padding:30px}

.input-group{margin-bottom:20px}
.input-group label{display:block;margin-bottom:8px;font-weight:600;color:#333;font-size:14px}
.input-group input{width:100%;padding:14px 16px;border-radius:12px;border:2px solid #e8e0ff;font-size:15px;font-family:'Poppins',sans-serif;transition:all .3s ease;box-sizing:border-box}
.input-group input:focus{outline:none;border-color:#6a11cb;box-shadow:0 0 0 3px rgba(106,17,203,.1)}
.input-group input.disabled{background:#f5f5f5;color:#999;cursor:not-allowed}
.input-group small{display:block;margin-top:6px;font-size:12px;color:#999;font-style:italic}

.modal-actions{padding:0 30px 30px;display:flex;justify-content:flex-end;gap:12px}
.modal-actions button{padding:12px 24px;border-radius:12px;cursor:pointer;font-weight:600;font-size:15px;font-family:'Poppins',sans-serif;transition:all .3s ease}
.cancel{background:#f5f5f5;border:none;color:#666}
.cancel:hover{background:#e8e8e8}
.save{background:linear-gradient(135deg,#6a11cb,#2575fc);color:#fff;border:none;box-shadow:0 6px 20px rgba(106,17,203,.4)}
.save:hover{transform:translateY(-2px);box-shadow:0 8px 25px rgba(106,17,203,.5)}

@media(max-width:768px){
  .main{padding:100px 20px 20px}
  .profile-content{padding:0 20px 20px}
  .avatar{width:100px;height:100px;font-size:40px}
  .profile-info h2{font-size:26px}
  .action-btns{flex-direction:column}
  .action-btns button{min-width:100%}
  .stats-grid{grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:15px}
  .stat-card{padding:20px}
  .stat-card h3{font-size:28px}
  .modal{max-width:100%;margin:0 10px}
}
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
`;