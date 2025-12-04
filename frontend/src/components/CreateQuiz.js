import React, { useEffect, useState } from "react";
import axios from "axios";

export default function CreateQuiz() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [quizDetails, setQuizDetails] = useState({
    quizName: "",
    quizId: "",
    subject: "",
    description: "",
    adminIds: "",
    startDate: "",
    startTime: "",
    durationMinutes: 30,
    totalMarks: 100,
    negativeMarkPerQuestion: 0,
    maxAttempts: 1,
    visibility: "private",
  });

  const [questions, setQuestions] = useState([]);

  // ---------- Load user & draft from localStorage ----------
  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem("access");
        if (!token) {
          window.location.href = "/auth";
          return;
        }

        const res = await axios.get("http://localhost:5001/profile", {
          headers: { Authorization: "Bearer " + token },
        });

        if (!res.data.user || res.data.user.userType !== "admin") {
          alert("Only admins can access Create Quiz.");
          window.location.href = "/auth";
          return;
        }

        setUser(res.data.user);

        // Load draft if exists
        const draft = localStorage.getItem("createQuizDraft");
        if (draft) {
          const parsed = JSON.parse(draft);
          if (parsed.quizDetails) setQuizDetails(parsed.quizDetails);
          if (parsed.questions) setQuestions(parsed.questions);
        }
      } catch (err) {
        console.log(err);
        window.location.href = "/auth";
      } finally {
        setLoadingUser(false);
      }
    };

    init();
  }, []);

  // ---------- Save draft to localStorage whenever things change ----------
  useEffect(() => {
    const draft = {
      quizDetails,
      questions,
    };
    localStorage.setItem("createQuizDraft", JSON.stringify(draft));
  }, [quizDetails, questions]);

  const handleDetailChange = (e) => {
    const { name, value } = e.target;
    setQuizDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        type: "mcq",
        text: "",
        options: ["", "", "", ""],
        correctIndex: 0,
        correctInteger: "",
      },
    ]);
  };

  const handleQuestionTextChange = (index, value) => {
    const updated = [...questions];
    updated[index].text = value;
    setQuestions(updated);
  };

  const handleQuestionTypeChange = (index, value) => {
    const updated = [...questions];
    updated[index].type = value;

    if (value === "mcq") {
      updated[index].options = updated[index].options || ["", "", "", ""];
      updated[index].correctIndex = 0;
    } else if (value === "integer") {
      updated[index].correctInteger = "";
    }

    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  const handleCorrectIndexChange = (qIndex, value) => {
    const updated = [...questions];
    updated[qIndex].correctIndex = Number(value);
    setQuestions(updated);
  };

  const handleIntegerAnswerChange = (qIndex, value) => {
    const updated = [...questions];
    updated[qIndex].correctInteger = value;
    setQuestions(updated);
  };

  const removeQuestion = (index) => {
    const updated = [...questions];
    updated.splice(index, 1);
    // re-number ids
    updated.forEach((q, i) => (q.id = i + 1));
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!quizDetails.quizName || !quizDetails.quizId) {
      alert("Quiz Name and Quiz ID are required.");
      return;
    }

    if (!quizDetails.startDate || !quizDetails.startTime) {
      alert("Please select Start Date and Time.");
      return;
    }

    if (questions.length === 0) {
      alert("Add at least one question.");
      return;
    }

    const startTimeISO = `${quizDetails.startDate}T${quizDetails.startTime}`;

    const payload = {
      quizName: quizDetails.quizName,
      quizId: quizDetails.quizId,
      subject: quizDetails.subject,
      description: quizDetails.description,
      adminIds: quizDetails.adminIds
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean),
      startTime: startTimeISO, // ex: 2025-12-04T21:03
      durationMinutes: Number(quizDetails.durationMinutes),
      totalMarks: Number(quizDetails.totalMarks),
      negativeMarkPerQuestion: Number(quizDetails.negativeMarkPerQuestion),
      maxAttempts: Number(quizDetails.maxAttempts),
      visibility: quizDetails.visibility,
    };

    try {
      const token = localStorage.getItem("access");

      const qidRaw = await axios.post("http://localhost:5001/add-questions",
        questions,
        {
            headers:{Authorization : "Bearer "+token},
        }
      );

      const res = await axios.post(
        "http://localhost:5001/create-quiz",
        {
            quizDetails:payload,
            questions:qidRaw.data.questions,
        },
        {
          headers: { Authorization: "Bearer " + token },
        }
      );

      alert(res.data.message);
      localStorage.removeItem("createQuizDraft");
      window.location.href = "/home";
    } catch (err) {
      console.log(err);
      alert("Error creating quiz.");
    }
  };

  if (loadingUser) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.logo}>QUINTZ</div>
        <div style={styles.headerRight}>
          <span style={styles.headerText}>Create Quiz</span>
          <div style={styles.profileBox}>
            <div style={styles.profileAvatar}>
              {user.name ? user.name[0].toUpperCase() : "U"}
            </div>
            <span style={styles.profileName}>{user.name}</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={styles.content}>
        {/* LEFT: QUIZ META FORM */}
        <div style={styles.leftPanel}>
          <h2 style={styles.sectionTitle}>Quiz Details</h2>

          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Quiz Name</label>
              <input
                style={styles.input}
                name="quizName"
                value={quizDetails.quizName}
                onChange={handleDetailChange}
                placeholder="e.g. Physics Chapter 1 Test"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Quiz ID</label>
              <input
                style={styles.input}
                name="quizId"
                value={quizDetails.quizId}
                onChange={handleDetailChange}
                placeholder="Unique quiz code"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Subject</label>
              <input
                style={styles.input}
                name="subject"
                value={quizDetails.subject}
                onChange={handleDetailChange}
                placeholder="e.g. Physics"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <textarea
                style={{ ...styles.input, height: "70px", resize: "none" }}
                name="description"
                value={quizDetails.description}
                onChange={handleDetailChange}
                placeholder="Short description of the quiz"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Admin Usernames (comma separated)</label>
              <input
                style={styles.input}
                name="adminIds"
                value={quizDetails.adminIds}
                onChange={handleDetailChange}
                placeholder="admin1, admin2"
              />
            </div>

            <div style={styles.inlineRow}>
              <div style={styles.inlineGroup}>
                <label style={styles.label}>Start Date</label>
                <input
                  type="date"
                  style={styles.input}
                  name="startDate"
                  value={quizDetails.startDate}
                  onChange={handleDetailChange}
                />
              </div>

              <div style={styles.inlineGroup}>
                <label style={styles.label}>Start Time</label>
                <input
                  type="time"
                  style={styles.input}
                  name="startTime"
                  value={quizDetails.startTime}
                  onChange={handleDetailChange}
                />
              </div>
            </div>

            <div style={styles.inlineRow}>
              <div style={styles.inlineGroup}>
                <label style={styles.label}>Duration (min)</label>
                <input
                  type="number"
                  style={styles.input}
                  name="durationMinutes"
                  value={quizDetails.durationMinutes}
                  onChange={handleDetailChange}
                />
              </div>

              <div style={styles.inlineGroup}>
                <label style={styles.label}>Total Marks</label>
                <input
                  type="number"
                  style={styles.input}
                  name="totalMarks"
                  value={quizDetails.totalMarks}
                  onChange={handleDetailChange}
                />
              </div>
            </div>

            <div style={styles.inlineRow}>
              <div style={styles.inlineGroup}>
                <label style={styles.label}>Negative Mark / Q</label>
                <input
                  type="number"
                  style={styles.input}
                  name="negativeMarkPerQuestion"
                  value={quizDetails.negativeMarkPerQuestion}
                  onChange={handleDetailChange}
                />
              </div>

              <div style={styles.inlineGroup}>
                <label style={styles.label}>Max Attempts</label>
                <input
                  type="number"
                  style={styles.input}
                  name="maxAttempts"
                  value={quizDetails.maxAttempts}
                  onChange={handleDetailChange}
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Visibility</label>
              <select
                style={styles.input}
                name="visibility"
                value={quizDetails.visibility}
                onChange={handleDetailChange}
              >
                <option value="private">Private</option>
                <option value="public">Public</option>
              </select>
            </div>

            <button type="submit" style={styles.submitBtn}>
              Create Quiz
            </button>
          </form>
        </div>

        {/* RIGHT: QUESTIONS PANEL */}
        <div style={styles.rightPanel}>
          <div style={styles.questionsHeader}>
            <h2 style={styles.sectionTitle}>Questions</h2>
            <button style={styles.addQuestionBtn} onClick={addQuestion}>
              ➕ Add Question
            </button>
          </div>

          <div style={styles.questionList}>
            {questions.map((q, index) => (
              <div key={q.id} style={styles.questionCard}>
                <div style={styles.questionHeader}>
                  <span style={styles.questionTitle}>Question {index + 1}</span>
                  <select
                    style={styles.typeSelect}
                    value={q.type}
                    onChange={(e) =>
                      handleQuestionTypeChange(index, e.target.value)
                    }
                  >
                    <option value="mcq">MCQ</option>
                    <option value="integer">Integer</option>
                  </select>
                </div>

                <textarea
                  style={styles.questionInput}
                  placeholder="Enter question text..."
                  value={q.text}
                  onChange={(e) =>
                    handleQuestionTextChange(index, e.target.value)
                  }
                />

                {q.type === "mcq" && (
                  <div style={styles.optionsWrapper}>
                    {q.options.map((opt, optIndex) => (
                      <div key={optIndex} style={styles.optionRow}>
                        <input
                          style={styles.optionInput}
                          placeholder={`Option ${optIndex + 1}`}
                          value={opt}
                          onChange={(e) =>
                            handleOptionChange(index, optIndex, e.target.value)
                          }
                        />
                        <label style={styles.optionCorrectLabel}>
                          <input
                            type="radio"
                            name={`correct-${q.id}`}
                            checked={q.correctIndex === optIndex}
                            onChange={() =>
                              handleCorrectIndexChange(index, optIndex)
                            }
                          />
                          Correct
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                {q.type === "integer" && (
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Correct Answer (Integer)</label>
                    <input
                      type="number"
                      style={styles.input}
                      value={q.correctInteger}
                      onChange={(e) =>
                        handleIntegerAnswerChange(index, e.target.value)
                      }
                    />
                  </div>
                )}

                <div style={styles.questionFooter}>
                  <button
                    style={styles.removeQuestionBtn}
                    onClick={() => removeQuestion(index)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            {questions.length === 0 && (
              <div style={{ marginTop: "20px", opacity: 0.7 }}>
                No questions added yet. Click <b>“Add Question”</b> to begin.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------- STYLES -------------------- */

const styles = {
  page: {
    height: "100vh",
    width: "100%",
    background: "linear-gradient(135deg, #f7f3ff 0%, #efe8ff 100%)",
    fontFamily: "'Poppins', sans-serif",
    display: "flex",
    flexDirection: "column",
  },

  header: {
    padding: "15px 30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  logo: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#6a11cb",
    letterSpacing: "2px",
  },

  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },

  headerText: {
    fontSize: "18px",
    fontWeight: "600",
  },

  profileBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "6px 12px",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.10)",
  },

  profileAvatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "#6a11cb",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
  },

  profileName: {
    fontSize: "15px",
    fontWeight: "600",
  },

  content: {
    flex: 1,
    display: "flex",
    padding: "10px 20px 20px",
    gap: "20px",
  },

  leftPanel: {
    flex: 1,
    background: "white",
    borderRadius: "20px",
    padding: "20px 24px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    overflowY: "auto",
  },

  rightPanel: {
    flex: 1.4,
    background: "white",
    borderRadius: "20px",
    padding: "20px 24px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
  },

  sectionTitle: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#6a11cb",
    marginBottom: "15px",
  },

  formGroup: {
    marginBottom: "12px",
  },

  label: {
    display: "block",
    marginBottom: "4px",
    fontWeight: "600",
    fontSize: "13px",
  },

  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "10px",
    border: "2px solid #e3d3ff",
    fontSize: "14px",
    outline: "none",
  },

  inlineRow: {
    display: "flex",
    gap: "10px",
  },

  inlineGroup: {
    flex: 1,
  },

  submitBtn: {
    width: "100%",
    marginTop: "10px",
    padding: "12px",
    background: "linear-gradient(135deg, #6a11cb, #2575fc)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(106,17,203,0.4)",
  },

  questionsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },

  addQuestionBtn: {
    padding: "8px 14px",
    borderRadius: "10px",
    border: "none",
    background: "#f0e5ff",
    color: "#6a11cb",
    fontWeight: "600",
    cursor: "pointer",
  },

  questionList: {
    marginTop: "5px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  questionCard: {
    background: "#faf7ff",
    borderRadius: "14px",
    padding: "14px",
    border: "1px solid #e3d3ff",
  },

  questionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },

  questionTitle: {
    fontWeight: "700",
  },

  typeSelect: {
    padding: "6px 10px",
    borderRadius: "8px",
    border: "1px solid #d4c4ff",
    fontSize: "13px",
  },

  questionInput: {
    width: "100%",
    borderRadius: "10px",
    border: "2px solid #e3d3ff",
    padding: "8px",
    fontSize: "14px",
    resize: "none",
    minHeight: "50px",
    marginBottom: "8px",
  },

  optionsWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "6px",
  },

  optionRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  optionInput: {
    flex: 1,
    padding: "8px",
    borderRadius: "8px",
    border: "2px solid #e3d3ff",
    fontSize: "14px",
  },

  optionCorrectLabel: {
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },

  questionFooter: {
    display: "flex",
    justifyContent: "flex-end",
  },

  removeQuestionBtn: {
    padding: "6px 10px",
    borderRadius: "8px",
    border: "none",
    background: "#ffe5e5",
    color: "#b10c0c",
    fontSize: "13px",
    cursor: "pointer",
  },
};
