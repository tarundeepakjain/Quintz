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

      // upcoming quizzes (static for now)
        const mockData = [
        {
            title: "Science Quiz",
            startTime: "2025-12-04T13:00",
            duration: 40, 
            id: "ABC123"
        },
        {
            title: "Math Quiz",
            startTime: "2025-12-12T18:30",
            duration: 30,
            id: "XYZ789"
        }
        ];

      setUpcoming(mockData);

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

  if (!user) return <div>Loading...</div>;

  const avatarLetter = user.name ? user.name[0].toUpperCase() : "U";
  const isQuizLive = (quiz) => {
    const now = new Date();
    const start = new Date(quiz.startTime);
    const end = new Date(start.getTime() + quiz.duration * 60000);

    return now >= start && now <= end;
  };

  return (
    <div style={styles.page}>

      {/* ----------- TOP RIGHT PROFILE ----------- */}
    <button style={styles.profileButton} onClick={() => window.location.href="/profile"}>
    <div style={styles.profileBox}>
        <div style={styles.profileAvatar}>{avatarLetter}</div>
        <span style={styles.profileName}>{user.name}</span>
    </div>
    </button>

      {/* ----------- LEFT SECTION HERO TEXT ----------- */}
      <div style={styles.leftSection}>
        <h1 style={styles.heroTitle}>
          Welcome To <br></br><span style={styles.gradientText}>Quintz</span>
        </h1>

        <p style={styles.heroSubtitle}>
          Challenge yourself with interactive quizzes crafted to sharpen your mind and elevate your skills.
          Learn smarter. Practice better. Grow faster.
        </p>

        {/* Floating decorative shapes */}
        <div style={styles.circle1}></div>
        <div style={styles.circle2}></div>
        <div style={styles.circle3}></div>
      </div>

      {/* ----------- RIGHT SECTION: UPCOMING QUIZZES ----------- */}
      <div style={styles.rightSection}>
        <h2 style={styles.sectionTitle}>Quizzes</h2>

        <div style={styles.quizList}>
        {upcoming.map((q, index) => {
            const live = isQuizLive(q);

            return (
            <div key={index} style={styles.quizCard}>
                
                <div style={styles.quizHeader}>
                <h3 style={styles.quizCardTitle}>{q.title}</h3>

                {live && (
                    <button
                    style={styles.joinBtn}
                    onClick={() =>
                        window.open(
                        `/give-quiz/${q.id}`,
                        "_blank",
                        "width=900,height=700,fullscreen=yes,resizable=no"
                        )
                    }
                    >
                    Join Now
                    </button>
                )}
                </div>

                <div style={styles.quizMetaItem}>
                <strong>🕒 Start:</strong> {new Date(q.startTime).toLocaleString()}
                </div>

                <div style={styles.quizMetaItem}>
                <strong>⏳ Duration:</strong> {q.duration} min
                </div>

                <p style={styles.quizId}>Quiz ID: {q.id}</p>
            </div>
            );
        })}
        </div>

      </div>

      {/* ----------- FLOATING BUTTONS ----------- */}
      {user.userType === "student" && (
        <button 
          style={styles.floatingGiveBtn}
          onClick={() => setShowJoinModal(true)}
        >
          🎯 Give Quiz
        </button>
      )}

      {user.userType === "admin" && (
        <button 
          style={styles.floatingCreateBtn}
          onClick={() => window.location.href = "/create-quiz"}
        >
          ➕ Create Quiz
        </button>
      )}

      {/* ----------- JOIN QUIZ MODAL ----------- */}
      {showJoinModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Enter Quiz ID</h2>

            <input
              style={styles.modalInput}
              placeholder="Enter Unique Quiz ID"
              value={quizID}
              onChange={(e) => setQuizID(e.target.value)}
            />

            <div style={styles.modalActions}>
              <button style={styles.cancelBtn} onClick={() => setShowJoinModal(false)}>Cancel</button>
              <button style={styles.saveBtn} onClick={handleJoinQuiz}>Join Quiz</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


/* -------------------- STYLES -------------------- */

const styles = {
    quizCardHover: {
    transform: "translateY(-3px)",
    boxShadow: "0 8px 20px rgba(106,17,203,0.18)",
    },

    quizHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px"
    },

    joinBtn: {
    padding: "8px 16px",
    background: "linear-gradient(135deg, #6a11cb, #2575fc)",
    color: "white",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    boxShadow: "0 4px 12px rgba(106,17,203,0.3)",
    },

    quizMetaItem: {
    marginTop: "6px",
    fontSize: "15px",
    color: "#333",
    },

    quizId: {
    marginTop: "10px",
    fontSize: "12px",
    opacity: 0.6,
    },
  page: {
    display: "flex",
    height: "100vh",
    width: "100%",
    background: "linear-gradient(135deg, #f7f3ff 0%, #efe8ff 100%)",
    fontFamily: "'Poppins', sans-serif",
    position: "relative",
    overflow: "hidden"
  },

  profileButton:{
    cursor:"pointer",
  },
  /* PROFILE DISPLAY */
  profileBox: {
    position: "absolute",
    top: "20px",
    right: "30px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 14px",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  },

  profileAvatar: {
    width: "40px",
    height: "40px",
    background: "#6a11cb",
    color: "white",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "18px"
  },

  profileName: {
    fontSize: "16px",
    fontWeight: "600",
  },

  /* LEFT HERO SECTION */
  leftSection: {
    flex: 1.4,
    paddingLeft: "70px",
    paddingTop: "120px",
    position: "relative"
  },

  heroTitle: {
    fontSize: "52px",
    fontWeight: "800",
    width: "500px",
    lineHeight: "1.2",
  },

  gradientText: {
    background: "linear-gradient(135deg, #6a11cb, #2575fc)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },

  heroSubtitle: {
    marginTop: "20px",
    width: "450px",
    fontSize: "18px",
    opacity: 0.75,
  },

  /* Decorative Circles */
  circle1: {
    position: "absolute",
    top: "50px",
    left: "30px",
    width: "90px",
    height: "90px",
    borderRadius: "50%",
    background: "rgba(106,17,203,0.25)",
    filter: "blur(3px)",
    animation: "float 6s ease-in-out infinite"
  },

  circle2: {
    position: "absolute",
    bottom: "120px",
    left: "150px",
    width: "130px",
    height: "130px",
    borderRadius: "50%",
    background: "rgba(37,117,252,0.25)",
    filter: "blur(6px)",
    animation: "float 7s ease-in-out infinite"
  },

  circle3: {
    position: "absolute",
    top: "300px",
    left: "320px",
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "rgba(255, 80, 200, 0.25)",
    filter: "blur(4px)",
    animation: "float 5s ease-in-out infinite"
  },

  /* RIGHT UPCOMING QUIZZES */
  rightSection: {
    flex: 1,
    padding: "60px 40px",
    background: "white",
    borderLeft: "2px solid #eee",
    borderRadius: "0 0 0 50px",
    boxShadow: "-5px 0 20px rgba(0,0,0,0.05)",
  },

  sectionTitle: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#6a11cb",
    marginBottom: "20px"
  },

  quizList: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    maxHeight: "70vh",
    overflowY: "auto",
    paddingRight: "10px"
  },

  quizCard: {
    background: "linear-gradient(135deg, #ffffff, #f4ecff)",
    padding: "20px",
    borderRadius: "14px",
    border: "1px solid #e3d3ff",
    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
    transition: "0.2s",
  },

  quizCardTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#6a11cb"
  },

  quizId: {
    marginTop: "6px",
    opacity: 0.6
  },

  /* Floating Buttons */
  floatingGiveBtn: {
    position: "fixed",
    bottom: "30px",
    right: "30px",
    padding: "14px 22px",
    background: "linear-gradient(135deg, #6a11cb, #2575fc)",
    color: "white",
    borderRadius: "50px",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
  },

  floatingCreateBtn: {
    position: "fixed",
    bottom: "100px",
    right: "30px",
    padding: "14px 22px",
    background: "white",
    color: "#6a11cb",
    border: "2px solid #6a11cb",
    borderRadius: "50px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "700",
    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
  },

  /* Modal */
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
    width: "340px",
    background: "white",
    borderRadius: "15px",
    padding: "25px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
  },

  modalTitle: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#6a11cb",
  },

  modalInput: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "2px solid #e4d7ff",
    marginTop: "15px",
    fontSize: "14px",
  },

  modalActions: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "space-between",
  },

  cancelBtn: {
    padding: "10px 15px",
    background: "#eee",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
  },

  saveBtn: {
    padding: "10px 15px",
    background: "linear-gradient(135deg, #6a11cb, #2575fc)",
    color: "white",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
  }
};
