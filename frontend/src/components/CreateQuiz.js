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
  Plus, 
  Trash2, 
  Save, 
  Settings, 
  FileText,
  Calendar,
  Layers,
  CheckSquare,
  Tag,
  Bot,       // Robot icon for AI
  FileStack  // Icon for PYQs
} from "lucide-react";

export default function CreateQuiz() {
  // ---------------------------------------------------------------------------
  // EXISTING STATE & LOGIC (Preserved)
  // ---------------------------------------------------------------------------
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
    resultDate:"",
    resultTime:"",
    durationMinutes: 30,
    totalMarks: 100,
    negativeMarkPerQuestion: 0,
    maxAttempts: 1,
    visibility: "private",
  });

  const [questions, setQuestions] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ---------- Load user, tags & draft from localStorage ----------
    useEffect(() => {
    if (!quizDetails.subject) return; // Prevent empty subject calls

    const fetchTags = async () => {
      try {
        const token = localStorage.getItem("access");

        const res = await axios.get(
          `http://localhost:5001/get-tags/${quizDetails.subject}`,
          {
            headers: { Authorization: "Bearer " + token },
          }
        );

        if (Array.isArray(res.data)) {
          setAvailableTags(res.data);
        }
      } catch (err) {
        console.log("Tag fetch error", err);
      }
    };

    fetchTags();
  }, [quizDetails.subject]);

  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem("access");
        if (!token) {
          window.location.href = `${window.location.origin}/auth`;
          return;
        }

        // 1. Verify User
        const res = await axios.get("http://localhost:5001/profile", {
          headers: { Authorization: "Bearer " + token },
        });

        if (!res.data.user || res.data.user.userType !== "admin") {
          alert("Only admins can access Create Quiz.");
          window.location.href = `${window.location.origin}/auth`;
          return;
        }

        setUser(res.data.user);

        // 3. Load draft if exists
        const draft = localStorage.getItem("createQuizDraft");
        if (draft) {
          const parsed = JSON.parse(draft);
          if (parsed.quizDetails) setQuizDetails(parsed.quizDetails);
          if (parsed.questions) setQuestions(parsed.questions);
        }
      } catch (err) {
        console.log(err);
        window.location.href = `${window.location.origin}/auth`;
      } finally {
        setLoadingUser(false);
      }
    };

    init();
  }, []);

  useEffect(() => {
    const draft = { quizDetails, questions };
    localStorage.setItem("createQuizDraft", JSON.stringify(draft));
  }, [quizDetails, questions]);

  const handleDetailChange = (e) => {
    const { name, value } = e.target;
    setQuizDetails((prev) => ({ ...prev, [name]: value }));
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
        subject:quizDetails.subject,
        correctInteger: "",
        tag: "", 
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

  const handleTagChange = (index, value) => {
    const updated = [...questions];
    updated[index].tag = value;
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
    if(quizDetails.durationMinutes<=0){
      alert("Invalid Quiz Duration.");
      return;
    }

    const startTimeISO = `${quizDetails.startDate}T${quizDetails.startTime}`;
    const startTime = new Date(startTimeISO);
    const resultTimeISO = `${quizDetails.resultDate}T${quizDetails.resultTime}`;
    const resultTime = new Date(resultTimeISO);
    const endTime = new Date(startTime.getTime() + quizDetails.durationMinutes * 60000);
    const now = new Date();

    if (isNaN(startTime.getTime())) { alert("Invalid date or time."); return; }
    if (startTime <= now) { alert("Start date and time must be in the future."); return; }
    if (isNaN(resultTime.getTime())) { alert("Invalid result date or time."); return; }
    if (resultTime < endTime) { alert("Result time must be AFTER quiz start time."); return; }

    const payload = {
      quizName: quizDetails.quizName,
      quizId: quizDetails.quizId,
      subject: quizDetails.subject,
      description: quizDetails.description,
      adminIds: quizDetails.adminIds.split(",").map((id) => id.trim()).filter(Boolean),
      startTime: startTimeISO, 
      resultTime: resultTimeISO,
      durationMinutes: Number(quizDetails.durationMinutes),
      totalMarks: Number(quizDetails.totalMarks),
      negativeMarkPerQuestion: Number(quizDetails.negativeMarkPerQuestion),
      maxAttempts: Number(quizDetails.maxAttempts),
      visibility: quizDetails.visibility,
    };

    const processedQuestions = questions.map(q => ({
      ...q,
      tag: q.tag && q.tag.trim() !== "" ? q.tag : "miscellaneous",
      subject: quizDetails.subject 
    }));

    try {
      const token = localStorage.getItem("access");
      
      const qidRaw = await axios.post("http://localhost:5001/add-questions", processedQuestions, {
          headers:{Authorization : "Bearer "+token},
      });

      const res = await axios.post("http://localhost:5001/create-quiz", {
          quizDetails:payload,
          questions:qidRaw.data.questions,
      }, {
        headers: { Authorization: "Bearer " + token },
      });

      alert(res.data.message);
      localStorage.removeItem("createQuizDraft");
      window.location.href = `${window.location.origin}/`;
    } catch (err) {
      console.log(err);
      alert("Error creating quiz.");
    }
  };

  const logout = () => {
    localStorage.removeItem("access");
    window.location.href = `${window.location.origin}/auth`;
  };

  if (loadingUser) return (
    <div className="loading-state">
      <style>{css}</style>
      <div className="spinner"></div>
      <p>Verifying Admin Access...</p>
    </div>
  );

  // ---------------------------------------------------------------------------
  // UI STRUCTURE
  // ---------------------------------------------------------------------------
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
          <button className="nav-btn tooltip-container" onClick={() => window.location.href = `${window.location.origin}/past-quizzes`}>
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

      {mobileMenuOpen && <div className="overlay" onClick={() => setMobileMenuOpen(false)}></div>}

      {/* Main Content Area */}
      <div className="main">
        <div className="bg-circle-1"></div>
        <div className="bg-circle-2"></div>

        <div className="main-content-wrapper">
          <header className="page-header">
            <div className="header-left">
              <h1>Create New Quiz</h1>
              <p>Configure quiz settings and add questions below.</p>
            </div>
            
            {/* UPDATED HEADER RIGHT SECTION */}
            <div className="header-right">
              <button className="header-btn ai-btn">
                <Bot size={16} /> Generate from AI
              </button>
              <button className="header-btn pyq-btn">
                <FileStack size={16} /> Add PYQs
              </button>
              <div className="admin-badge">
                <User size={14} /> Admin Mode
              </div>
            </div>
          </header>

          <form onSubmit={handleSubmit} className="create-form">
            <div className="create-layout">
              
              {/* LEFT COLUMN: CONFIGURATION */}
              <div className="panel left-panel">
                <div className="panel-header">
                  <Settings className="icon-purple" size={20} />
                  <h2>Configuration</h2>
                </div>
                
                <div className="form-scroll-area">
                  <div className="form-grid">
                    <div className="form-group full">
                      <label>Quiz Name</label>
                      <input name="quizName" value={quizDetails.quizName} onChange={handleDetailChange} placeholder="e.g. Physics Chapter 1 Test" />
                    </div>

                    <div className="form-group">
                      <label>Quiz ID (Unique)</label>
                      <input name="quizId" value={quizDetails.quizId} onChange={handleDetailChange} placeholder="e.g. PHY101" />
                    </div>

                    <div className="form-group">
                      <label>Subject</label>
                      <input name="subject" value={quizDetails.subject} onChange={handleDetailChange} placeholder="e.g. Physics" />
                    </div>

                    <div className="form-group full">
                      <label>Description</label>
                      <textarea name="description" value={quizDetails.description} onChange={handleDetailChange} placeholder="Short description..." rows={2} />
                    </div>

                    <div className="form-group full">
                      <label>Admin Usernames</label>
                      <input name="adminIds" value={quizDetails.adminIds} onChange={handleDetailChange} placeholder="admin1, admin2" />
                    </div>

                    <div className="divider-label">Scheduling</div>

                    <div className="form-group">
                      <label>Start Date</label>
                      <input type="date" name="startDate" value={quizDetails.startDate} onChange={handleDetailChange} />
                    </div>
                    <div className="form-group">
                      <label>Start Time</label>
                      <input type="time" name="startTime" value={quizDetails.startTime} onChange={handleDetailChange} />
                    </div>

                    <div className="form-group">
                      <label>Result Date</label>
                      <input type="date" name="resultDate" value={quizDetails.resultDate} onChange={handleDetailChange} />
                    </div>
                    <div className="form-group">
                      <label>Result Time</label>
                      <input type="time" name="resultTime" value={quizDetails.resultTime} onChange={handleDetailChange} />
                    </div>

                    <div className="divider-label">Scoring</div>

                    <div className="form-group">
                      <label>Duration (min)</label>
                      <input type="number" name="durationMinutes" value={quizDetails.durationMinutes} onChange={handleDetailChange} />
                    </div>
                    <div className="form-group">
                      <label>Total Marks</label>
                      <input type="number" name="totalMarks" value={quizDetails.totalMarks} onChange={handleDetailChange} />
                    </div>
                    <div className="form-group">
                      <label>Neg. Mark/Q</label>
                      <input type="number" name="negativeMarkPerQuestion" value={quizDetails.negativeMarkPerQuestion} onChange={handleDetailChange} />
                    </div>
                    <div className="form-group">
                      <label>Max Attempts</label>
                      <input type="number" name="maxAttempts" value={quizDetails.maxAttempts} readOnly className="read-only" />
                    </div>

                    <div className="form-group full">
                      <label>Visibility</label>
                      <select name="visibility" value={quizDetails.visibility} onChange={handleDetailChange}>
                        <option value="private">Private</option>
                        <option value="public">Public</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: QUESTIONS */}
              <div className="panel right-panel">
                <div className="panel-header space-between">
                  <div className="flex-center">
                    <Layers className="icon-blue" size={20} />
                    <h2>Questions ({questions.length})</h2>
                  </div>
                  <button type="button" className="add-btn" onClick={addQuestion}>
                    <Plus size={18} /> Add
                  </button>
                </div>

                <div className="questions-list">
                  {questions.length === 0 ? (
                    <div className="empty-questions">
                      <FileText size={48} />
                      <p>No questions added yet.<br/>Click <b>"Add"</b> to begin.</p>
                    </div>
                  ) : (
                    questions.map((q, index) => (
                      <div key={q.id} className="question-card">
                        <div className="q-card-header">
                          <span className="q-number">Q{index + 1}</span>
                          <select 
                            className="q-type-select"
                            value={q.type} 
                            onChange={(e) => handleQuestionTypeChange(index, e.target.value)}
                          >
                            <option value="mcq">MCQ</option>
                            <option value="integer">Integer</option>
                          </select>
                          
                          <div className="tag-wrapper">
                            <Tag size={16} className="tag-icon" />
                            <input 
                              className="tag-input" 
                              list={`tags-list-${q.id}`} 
                              placeholder="Tag (e.g. Mechanics)"
                              value={q.tag}
                              onChange={(e) => handleTagChange(index, e.target.value)}
                            />
                            <datalist id={`tags-list-${q.id}`}>
                                {availableTags.map((tag, i) => (
                                    <option key={i} value={tag} />
                                ))}
                            </datalist>
                          </div>

                          <button type="button" className="delete-icon" onClick={() => removeQuestion(index)}>
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <textarea
                          className="q-text-input"
                          placeholder="Type your question here..."
                          value={q.text}
                          onChange={(e) => handleQuestionTextChange(index, e.target.value)}
                          rows={2}
                        />

                        {q.type === "mcq" && (
                          <div className="options-container">
                            {q.options.map((opt, optIndex) => (
                              <div key={optIndex} className="option-row">
                                <div className="opt-letter">{String.fromCharCode(65 + optIndex)}</div>
                                <input 
                                  className="opt-input"
                                  placeholder={`Option ${optIndex + 1}`}
                                  value={opt}
                                  onChange={(e) => handleOptionChange(index, optIndex, e.target.value)}
                                />
                                <label className={`correct-toggle ${q.correctIndex === optIndex ? 'active' : ''}`}>
                                  <input
                                    type="radio"
                                    name={`correct-${q.id}`}
                                    checked={q.correctIndex === optIndex}
                                    onChange={() => handleCorrectIndexChange(index, optIndex)}
                                  />
                                  {q.correctIndex === optIndex ? <CheckSquare size={16} /> : <div className="unchecked-box"></div>}
                                </label>
                              </div>
                            ))}
                          </div>
                        )}

                        {q.type === "integer" && (
                          <div className="integer-row">
                            <label>Correct Integer Answer:</label>
                            <input
                              type="number"
                              className="int-input"
                              value={q.correctInteger}
                              onChange={(e) => handleIntegerAnswerChange(index, e.target.value)}
                              placeholder="e.g. 25"
                            />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="create-action-bar">
               <button type="submit" className="submit-btn-large">
                 <Save size={20} /> Create Quiz
               </button>
            </div>
          </form>
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
.main-content-wrapper { flex: 1; padding: 30px; overflow-y: auto; display: flex; flex-direction: column; max-width: 1600px; margin: 0 auto; width: 100%; box-sizing: border-box; }
.bg-circle-1 { position: absolute; top: -100px; right: -100px; width: 400px; height: 400px; background: rgba(106, 17, 203, 0.08); filter: blur(60px); border-radius: 50%; pointer-events: none; }
.bg-circle-2 { position: absolute; bottom: -150px; left: -150px; width: 500px; height: 500px; background: rgba(37, 117, 252, 0.08); filter: blur(80px); border-radius: 50%; pointer-events: none; }

/* --- Header Section with Buttons --- */
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; position: relative; z-index: 2; flex-shrink: 0; }
.page-header h1 { font-size: 28px; font-weight: 700; color: #1a1a1a; margin: 0 0 5px 0; }
.page-header p { color: #666; font-size: 14px; margin: 0; }

.header-right { display: flex; align-items: center; gap: 12px; }
.header-btn { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; border: none; cursor: pointer; transition: transform 0.2s; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
.header-btn:hover { transform: translateY(-2px); }

.ai-btn { background: linear-gradient(135deg, #a855f7, #6366f1); color: white; }
.pyq-btn { background: #fff; color: #4b5563; border: 1px solid #e5e7eb; }

.admin-badge { background: #e0f2fe; color: #0ea5e9; padding: 8px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 6px; }

/* --- Forms & Panels --- */
.create-form { display: flex; flex-direction: column; flex: 1; height: 100%; min-height: 0; }
.create-layout { display: flex; gap: 20px; flex: 1; min-height: 0; position: relative; z-index: 2; align-items: stretch; }
.panel { background: white; border-radius: 20px; box-shadow: 0 10px 30px rgba(106, 17, 203, 0.05); border: 1px solid rgba(255,255,255,0.6); display: flex; flex-direction: column; overflow: hidden; }
.left-panel { width: 350px; flex-shrink: 0; max-height: 100%; }
.right-panel { flex: 1; background: #fdfcff; max-height: 100%; }
.panel-header { padding: 15px 20px; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center; gap: 10px; background: white; flex-shrink: 0; }
.panel-header h2 { font-size: 16px; font-weight: 700; color: #333; margin: 0; }
.space-between { justify-content: space-between; }
.flex-center { display: flex; align-items: center; gap: 10px; }
.icon-purple { color: #8b5cf6; }
.icon-blue { color: #3b82f6; }
.form-scroll-area, .questions-list { overflow-y: auto; flex: 1; padding: 20px; }
.questions-list { padding-bottom: 100px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-group { display: flex; flex-direction: column; gap: 4px; }
.form-group.full { grid-column: 1 / -1; }
.divider-label { grid-column: 1 / -1; margin-top: 10px; margin-bottom: 5px; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #9ca3af; letter-spacing: 0.5px; border-bottom: 1px solid #f0f0f0; padding-bottom: 5px; }
label { font-size: 12px; font-weight: 600; color: #555; display: flex; align-items: center; gap: 6px; }
input, textarea, select { width: 100%; padding: 8px 10px; border-radius: 8px; border: 2px solid #f0f0f0; font-family: 'Poppins', sans-serif; font-size: 13px; transition: all 0.2s; background: #f9fafb; color: #333; box-sizing: border-box; }
input:focus, textarea:focus, select:focus { border-color: #8b5cf6; background: white; outline: none; box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1); }
textarea { resize: vertical; }
.read-only { background: #f3f4f6; color: #9ca3af; cursor: not-allowed; }
.add-btn { background: #eff6ff; color: #3b82f6; border: none; padding: 6px 12px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s; font-size: 13px; }
.add-btn:hover { background: #dbeafe; }
.empty-questions { text-align: center; color: #cbd5e1; margin-top: 60px; display: flex; flex-direction: column; align-items: center; gap: 10px; }
.empty-questions p { color: #94a3b8; font-size: 14px; line-height: 1.5; }
.question-card { background: white; padding: 15px; border-radius: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid #f0f0f0; position: relative; animation: fadeIn 0.3s ease; margin-bottom: 15px; }
.q-card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.q-number { background: #8b5cf6; color: white; font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 6px; }
.q-type-select { width: auto; padding: 4px 8px; font-size: 12px; background: white; border-color: #e5e7eb; }
.delete-icon { margin-left: auto; background: none; border: none; color: #ef4444; cursor: pointer; opacity: 0.6; padding: 5px; border-radius: 6px; }
.delete-icon:hover { opacity: 1; background: #fee2e2; }
.tag-wrapper { display: flex; align-items: center; gap: 6px; flex: 1; max-width: 200px; margin-left: 10px; position: relative; }
.tag-icon { color: #8b5cf6; }
.tag-input { width: 100%; border: 1px solid #e5e7eb; border-radius: 6px; padding: 4px 8px; font-size: 12px; color: #555; }
.tag-input::placeholder { color: #aaa; }
.q-text-input { font-size: 14px; margin-bottom: 10px; border-color: #e5e7eb; background: white; }
.options-container { display: flex; flex-direction: column; gap: 8px; }
.option-row { display: flex; align-items: center; gap: 10px; }
.opt-letter { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; background: #f3f4f6; color: #6b7280; font-weight: 600; border-radius: 8px; font-size: 12px; }
.opt-input { background: white; border-color: #e5e7eb; padding: 6px 10px; }
.correct-toggle { display: flex; align-items: center; cursor: pointer; position: relative; }
.correct-toggle input { display: none; }
.unchecked-box { width: 16px; height: 16px; border: 2px solid #d1d5db; border-radius: 4px; }
.correct-toggle.active { color: #22c55e; }
.integer-row { display: flex; align-items: center; gap: 10px; background: #f8fafc; padding: 10px; border-radius: 10px; }
.int-input { width: 100px; text-align: center; font-weight: 700; color: #3b82f6; }
.create-action-bar { margin-top: 20px; display: flex; justify-content: center; }
.submit-btn-large { padding: 12px 40px; background: linear-gradient(135deg, #6a11cb, #2575fc); color: white; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 10px; font-size: 16px; box-shadow: 0 10px 30px rgba(106, 17, 203, 0.3); transition: transform 0.2s; }
.submit-btn-large:hover { transform: translateY(-2px); box-shadow: 0 15px 40px rgba(106, 17, 203, 0.4); }

/* --- Responsive --- */
@media(max-width: 1024px) {
  .create-layout { flex-direction: column; overflow-y: auto; display: block; }
  .left-panel { width: 100%; max-height: none; margin-bottom: 20px; }
  .right-panel { max-height: none; overflow: visible; }
  .form-scroll-area, .questions-list { overflow: visible; }
  .page-header { flex-direction: column; align-items: flex-start; gap: 15px; }
  .header-right { width: 100%; flex-wrap: wrap; justify-content: flex-start; }
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
  .form-grid { grid-template-columns: 1fr; }
  .submit-btn-large { width: 100%; justify-content: center; }
  .q-card-header { flex-wrap: wrap; }
  .tag-wrapper { order: 4; width: 100%; margin: 10px 0 0 0; max-width: none; }
}

@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; color: #6a11cb; font-weight: 500; font-family: 'Poppins', sans-serif; background: #f7f3ff; }
.spinner { width: 40px; height: 40px; border: 4px solid #e0d4fc; border-top: 4px solid #6a11cb; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px; }
@keyframes spin { to { transform: rotate(360deg); } }
`;