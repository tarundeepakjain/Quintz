import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    "a":0
  });
    const formatKey = (key) => {
        return key
        .replace(/([A-Z])/g, " $1")         // convert camelCase to words
        .replace(/^./, str => str.toUpperCase());  // capitalize first letter
    };
  // Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [editForm, setEditForm] = useState({
    name: "",
    username: ""
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPass: "",
    newPass: "",
    confirmPass: ""
  });

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("access");

      const res = await axios.get("http://localhost:5001/profile", {
        headers: { Authorization: "Bearer " + token }
      });

      setUser(res.data.user);
      setStats(res.data.user.stats);
    } catch (err) {
      alert("Session expired! Login again.");
      window.location.href = "/auth";
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const logout = () => {
    localStorage.removeItem("access");
    window.location.href = "/auth";
  };

  const openEditModal = () => {
    setEditForm({
      name: user.name,
      username: user.username
    });
    setShowEditModal(true);
  };

  const openPasswordModal = () => {
    setPasswordForm({
      oldPass: "",
      newPass: "",
      confirmPass: ""
    });
    setShowPasswordModal(true);
  };

  const closeModals = () => {
    setShowEditModal(false);
    setShowPasswordModal(false);
  };

  const handleChangePassword = async(e) => {
    e.preventDefault();
    if(passwordForm.newPass===passwordForm.confirmPass && passwordForm.newPass.length>0){
        try{
            const token = localStorage.getItem("access");
            const res = await axios.post("http://localhost:5001/change-password",{
                "username":user.username,
                "oldPass":passwordForm.oldPass,
                "newPass":passwordForm.newPass},
                {headers: { Authorization: "Bearer " + token }
            });
            alert(res.data.message);
            window.location.href="/auth"; 
        }catch(err){
            console.log(err);
            alert("Session expired! Login again.");
            window.location.href="/auth";
        }
    }else{
        alert("New and Confirm Password are Different.");
    }
  };

  const handleChangeName = async (e) => {
    e.preventDefault();
    try{
        const token = localStorage.getItem("access");
        const res = await axios.post("http://localhost:5001/edit-profile",editForm,{
            headers: { Authorization: "Bearer " + token }
        });
        alert(res.data.message);
        window.location.href="/profile"; 
    }catch(err){
        console.log(err);
        alert("Session expired! Login again.");
        window.location.href = "/auth";
    }
  };

  if (!user) return <div style={{ color: "white" }}>Loading...</div>;

  const avatarLetter = user.name ? user.name[0].toUpperCase() : "U";

  return (
    <div style={styles.page}>
      
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>QUINTZ</div>

        <button style={styles.sidebarBtn} onClick={()=>{window.location.href="/"}}>Home</button>
        <button style={styles.sidebarBtn}>Past Quizzes</button>
        <button style={styles.sidebarBtn}>Performance</button>

        <button style={styles.logoutSidebarBtn} onClick={logout}>
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        
        {/* Profile Card */}
        <div style={styles.profileCard}>
          <div style={styles.avatar}>{avatarLetter}</div>

          <div style={styles.profileInfo}>
            <h2 style={styles.name}>{user.name}</h2>
            <p style={styles.email}>{user.username}</p>
            <span style={styles.roleBadge}>{user.userType?.toUpperCase()}</span>
          </div>

          <div style={styles.actionButtons}>
            <button style={styles.actionBtn} onClick={openEditModal}>✏️ Edit Profile</button>
            <button style={styles.actionBtn} onClick={openPasswordModal}>🔑 Change Password</button>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsContainer}>
        {Object.entries(stats).map(([key, value], idx) => (
            <div key={idx} style={styles.statCard}>
                <h3 style={styles.statNumber}>{value}</h3>
                <p style={styles.statLabel}>{formatKey(key)}</p>
            </div>
        ))}
        </div>
        </div>

      {/* ---------------------- Edit Profile Modal ---------------------- */}
      {showEditModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Edit Profile</h2>

            <label style={styles.modalLabel}>Full Name</label>
            <input
              style={styles.modalInput}
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            />

            <label style={styles.modalLabel}>Username</label>
            <input
              style={styles.modalInput}
              value={editForm.username}
              readOnly
            />

            <div style={styles.modalActions}>
              <button style={styles.cancelBtn} onClick={closeModals}>Cancel</button>
              <button style={styles.saveBtn} onClick={handleChangeName}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------- Change Password Modal ---------------------- */}
      {showPasswordModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Change Password</h2>

            <label style={styles.modalLabel}>Old Password</label>
            <input
              type="password"
              style={styles.modalInput}
              value={passwordForm.oldPass}
              onChange={(e) => setPasswordForm({ ...passwordForm, oldPass: e.target.value })}
            />

            <label style={styles.modalLabel}>New Password</label>
            <input
              type="password"
              style={styles.modalInput}
              value={passwordForm.newPass}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
            />

            <label style={styles.modalLabel}>Confirm New Password</label>
            <input
              type="password"
              style={styles.modalInput}
              value={passwordForm.confirmPass}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPass: e.target.value })}
            />

            <div style={styles.modalActions}>
              <button style={styles.cancelBtn} onClick={closeModals}>Cancel</button>
              <button style={styles.saveBtn} onClick={handleChangePassword}>Update Password</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    height: "100vh",
    background: "#f4f0ff",
    fontFamily: "'Poppins', sans-serif",
  },

  sidebar: {
    width: "230px",
    background: "white",
    boxShadow: "2px 0 15px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    padding: "20px 0",
  },

  sidebarHeader: {
    fontSize: "26px",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: "30px",
    color: "#6a11cb"
  },

  sidebarBtn: {
    padding: "14px 20px",
    margin: "6px 20px",
    background: "#f5f1ff",
    borderRadius: "10px",
    border: "none",
    fontSize: "15px",
    cursor: "pointer",
    textAlign: "left",
  },

  logoutSidebarBtn: {
    padding: "14px 20px",
    marginTop: "auto",
    margin: "20px",
    background: "linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)",
    color: "white",
    borderRadius: "10px",
    border: "none",
    fontSize: "15px",
    cursor: "pointer",
  },

  main: {
    flex: 1,
    padding: "30px",
    overflowY: "auto",
  },

  profileCard: {
    background: "white",
    borderRadius: "20px",
    padding: "30px",
    display: "flex",
    alignItems: "center",
    gap: "25px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
    marginBottom: "30px",
  },

  avatar: {
    width: "90px",
    height: "90px",
    borderRadius: "50%",
    background: "#6a11cb",
    color: "white",
    fontSize: "40px",
    fontWeight: "700",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0 6px 15px rgba(106,17,203,0.4)",
  },

  profileInfo: { flex: 1 },

  name: {
    fontSize: "24px",
    fontWeight: "700",
  },

  email: {
    opacity: 0.7,
    fontSize: "14px",
    marginBottom: "5px",
  },

  roleBadge: {
    background: "#efe5ff",
    color: "#6a11cb",
    padding: "6px 12px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "600",
  },

  actionButtons: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  actionBtn: {
    background: "#f0e7ff",
    border: "none",
    padding: "10px 14px",
    fontSize: "14px",
    borderRadius: "8px",
    cursor: "pointer",
  },

  statsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "20px",
  },

  statCard: {
    background: "white",
    padding: "25px",
    borderRadius: "16px",
    textAlign: "center",
    boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
  },

  statNumber: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#6a11cb",
  },

  statLabel: {
    fontSize: "14px",
    opacity: 0.7,
    marginTop: "5px",
  },

  /* -------- MODAL STYLES -------- */

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.4)",
    backdropFilter: "blur(4px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  },

  modal: {
    width: "380px",
    background: "white",
    borderRadius: "15px",
    padding: "25px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
  },

  modalTitle: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#6a11cb",
    marginBottom: "15px"
  },

  modalLabel: {
    display: "block",
    marginTop: "10px",
    fontWeight: "600",
    color: "#555"
  },

  modalInput: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "2px solid #e4d7ff",
    marginTop: "5px",
    fontSize: "14px"
  },

  modalActions: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px"
  },

  cancelBtn: {
    padding: "10px 15px",
    borderRadius: "8px",
    background: "#eee",
    border: "none",
    cursor: "pointer",
    fontWeight: "600"
  },

  saveBtn: {
    padding: "10px 15px",
    borderRadius: "8px",
    background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
    color: "white",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    boxShadow: "0 4px 12px rgba(106,17,203,0.4)"
  }
};
