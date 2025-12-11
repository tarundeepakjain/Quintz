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
  Bot,
  FileStack,
  Loader2,
  Search,
  Check,
  Filter
} from "lucide-react";

export default function CreateQuiz() {
  // ---------------------------------------------------------------------------
  // STATE
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
  
  // UI States
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Modal States
  const [showAIModal, setShowAIModal] = useState(false);
  const [showPYQModal, setShowPYQModal] = useState(false);

  // AI Modal State
  const [aiTag, setAiTag] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [generatedQuestion, setGeneratedQuestion] = useState(null);

  // PYQ Modal State
  const [pyqList, setPyqList] = useState([]);
  const [loadingPYQ, setLoadingPYQ] = useState(false);
  const [selectedPYQs, setSelectedPYQs] = useState(new Set());
  
  // PYQ Filters
  const [filterSubject, setFilterSubject] = useState("");
  const [filterTag, setFilterTag] = useState("");

  // ---------------------------------------------------------------------------
  // EFFECTS
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem("access");
        if (!token) {
          window.location.href = `${window.location.origin}/auth`;
          return;
        }

        const res = await axios.get("https://quintz.onrender.com/profile", {
          headers: { Authorization: "Bearer " + token },
        });

        if (!res.data.user || res.data.user.userType !== "admin") {
          alert("Only admins can access Create Quiz.");
          window.location.href = `${window.location.origin}/auth`;
          return;
        }

        setUser(res.data.user);

        // Fetch Tags
        try {
          const tagsRes = await axios.get("https://quintz.onrender.com/get-tags", {
            headers: { Authorization: "Bearer " + token },
          });
          const tagsData = tagsRes.data.tags || tagsRes.data;
          if (Array.isArray(tagsData)) setAvailableTags(tagsData);
        } catch (tagErr) {
          console.warn("Could not fetch tags", tagErr);
        }

        // Load draft
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

  // ---------------------------------------------------------------------------
  // HANDLERS
  // ---------------------------------------------------------------------------
  const handleDetailChange = (e) => {
    const { name, value } = e.target;
    setQuizDetails((prev) => ({ ...prev, [name]: value }));
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: Date.now(), // Unique ID for key
        type: "mcq",
        text: "",
        options: ["", "", "", ""],
        correctIndex: 0,
        correctInteger: "",
        tag: "", 
        subject: quizDetails.subject
      },
    ]);
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  const removeQuestion = (index) => {
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };

  // --- AI HANDLERS ---
  const handleGenerateAI = async () => {
    if (!aiTag) {
      alert("Please enter a topic or tag.");
      return;
    }
    setLoadingAI(true);
    setGeneratedQuestion(null);
    try {
      const token = localStorage.getItem("access");
      // Mocking the endpoint as per instructions logic
      const res = await axios.post("https://quintz.onrender.com/generate-ai-question", 
        { tag: aiTag, subject: quizDetails.subject },
        { headers: { Authorization: "Bearer " + token } }
      );
      setGeneratedQuestion(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to generate question. Try again.");
    } finally {
      setLoadingAI(false);
    }
  };

  const addAIQuestion = () => {
    if (!generatedQuestion) return;
    setQuestions(prev => [...prev, {
      ...generatedQuestion,
      id: Date.now(),
      subject: quizDetails.subject,
      tag: aiTag // Ensure tag persists
    }]);
    setShowAIModal(false);
    setGeneratedQuestion(null);
    setAiTag("");
  };

  // --- PYQ HANDLERS ---
  const openPYQModal = async () => {
    setShowPYQModal(true);
    setLoadingPYQ(true);
    // Reset filters
    setFilterSubject("");
    setFilterTag("");
    
    try {
      const token = localStorage.getItem("access");
      const res = await axios.get("https://quintz.onrender.com/get-all-questions", {
        headers: { Authorization: "Bearer " + token }
      });
      setPyqList(res.data);
    } catch (err) {
      console.error(err);
      alert("Could not fetch PYQs.");
    } finally {
      setLoadingPYQ(false);
    }
  };

  const togglePYQ = (pyqId) => {
    const newSet = new Set(selectedPYQs);
    if (newSet.has(pyqId)) newSet.delete(pyqId);
    else newSet.add(pyqId);
    setSelectedPYQs(newSet);
  };

  const addSelectedPYQs = () => {
    const selected = pyqList.filter(q => selectedPYQs.has(q._id));
    // Transform to match quiz question structure (remove _id to avoid conflicts)
    const newQuestions = selected.map(q => {
      const { _id, askedIn, ...rest } = q; 
      return { ...rest, id: Date.now() + Math.random() };
    });
    
    setQuestions(prev => [...prev, ...newQuestions]);
    setShowPYQModal(false);
    setSelectedPYQs(new Set());
  };

  // --- SUBMIT ---
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
      const qidRaw = await axios.post("https://quintz.onrender.com/add-questions", processedQuestions, {
          headers:{Authorization : "Bearer "+token},
      });
      const res = await axios.post("https://quintz.onrender.com/create-quiz", {
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

  // --- DERIVED STATE FOR PYQ FILTERING ---
  const uniqueSubjects = [...new Set(pyqList.map(q => q.subject).filter(Boolean))];
  const uniqueTags = [...new Set(pyqList.map(q => q.tag).filter(Boolean))];

  const filteredPYQs = pyqList.filter(q => {
    const sMatch = filterSubject === "" || (q.subject && q.subject === filterSubject);
    const tMatch = filterTag === "" || (q.tag && q.tag.toLowerCase().includes(filterTag.toLowerCase()));
    return sMatch && tMatch;
  });

  if (loadingUser) return <div className="loading-state"><div className="spinner"></div></div>;

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
  return (
    <div className="page">
      <style>{css}</style>

      {/* Sidebar & Mobile Menu (Same as before) */}
      <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-desktop">Q</div>
          <span className="logo-mobile">QUINTZ</span>
        </div>
        <nav className="sidebar-nav">
          <button className="nav-btn tooltip-container" onClick={() => window.location.href = `${window.location.origin}/`}>
            <span><Home size={22} /></span><span className="nav-text">Home</span><span className="tooltip">Home</span>
          </button>
          <button className="nav-btn tooltip-container" onClick={() => window.location.href = `${window.location.origin}/past-quizzes`}>
            <span><Clock size={22} /></span><span className="nav-text">Past Quizzes</span><span className="tooltip">Past Quizzes</span>
          </button>
          <button className="nav-btn tooltip-container" onClick={() => window.location.href = `${window.location.origin}/profile`}>
            <span><User size={22} /></span><span className="nav-text">Profile</span><span className="tooltip">Profile</span>
          </button>
        </nav>
        <button className="logout-btn tooltip-container" onClick={logout}>
          <span><LogOut size={20} /></span><span className="nav-text">Logout</span><span className="tooltip">Logout</span>
        </button>
      </div>

      {mobileMenuOpen && <div className="overlay" onClick={() => setMobileMenuOpen(false)}></div>}

      <div className="main">
        <div className="bg-circle-1"></div>
        <div className="bg-circle-2"></div>

        <div className="main-content-wrapper">
          <header className="page-header">
            <div className="header-left">
              <h1>Create New Quiz</h1>
              <p>Configure quiz settings and add questions.</p>
            </div>
            <div className="header-right">
              <button className="header-btn ai-btn" onClick={() => setShowAIModal(true)} type="button">
                <Bot size={16} /> Generate from AI
              </button>
              <button className="header-btn pyq-btn" onClick={openPYQModal} type="button">
                <FileStack size={16} /> Add PYQs
              </button>
              <div className="admin-badge">
                <User size={14} /> Admin Mode
              </div>
            </div>
          </header>

          <form onSubmit={handleSubmit} className="create-form">
            <div className="create-layout">
              {/* LEFT: Config */}
              <div className="panel left-panel">
                <div className="panel-header">
                  <Settings className="icon-purple" size={20} /><h2>Configuration</h2>
                </div>
                <div className="form-scroll-area">
                  <div className="form-grid">
                    <div className="form-group full">
                        <label>Quiz Name</label>
                        <input name="quizName" value={quizDetails.quizName} onChange={handleDetailChange} placeholder="e.g. Test 1" />
                    </div>
                    {/* ... other config fields same as before ... */}
                    <div className="form-group"><label>Quiz ID</label><input name="quizId" value={quizDetails.quizId} onChange={handleDetailChange} placeholder="e.g. PY101"/></div>
                    <div className="form-group"><label>Subject</label><input name="subject" value={quizDetails.subject} onChange={handleDetailChange} placeholder="e.g. Physics"/></div>
                    <div className="form-group full"><label>Description</label><textarea name="description" value={quizDetails.description} onChange={handleDetailChange} rows={2} placeholder="Add description here"/></div>
                    <div className="form-group full"><label>Admins</label><input name="adminIds" value={quizDetails.adminIds} onChange={handleDetailChange} placeholder="admin1, admin2, etc."/></div>
                    
                    <div className="divider-label">Scheduling</div>
                    <div className="form-group"><label>Start Date</label><input type="date" name="startDate" value={quizDetails.startDate} onChange={handleDetailChange} /></div>
                    <div className="form-group"><label>Start Time</label><input type="time" name="startTime" value={quizDetails.startTime} onChange={handleDetailChange} /></div>
                    <div className="form-group"><label>Result Date</label><input type="date" name="resultDate" value={quizDetails.resultDate} onChange={handleDetailChange} /></div>
                    <div className="form-group"><label>Result Time</label><input type="time" name="resultTime" value={quizDetails.resultTime} onChange={handleDetailChange} /></div>

                    <div className="divider-label">Scoring</div>
                    <div className="form-group"><label>Duration (min)</label><input type="number" name="durationMinutes" value={quizDetails.durationMinutes} onChange={handleDetailChange} /></div>
                    <div className="form-group"><label>Total Marks</label><input type="number" name="totalMarks" value={quizDetails.totalMarks} onChange={handleDetailChange} /></div>
                    <div className="form-group"><label>Neg. Mark</label><input type="number" min="0" name="negativeMarkPerQuestion" value={quizDetails.negativeMarkPerQuestion} onChange={handleDetailChange} /></div>
                    <div className="form-group"><label>Max Attempts</label><input type="number" name="maxAttempts" value={quizDetails.maxAttempts} readOnly className="read-only" /></div>
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

              {/* RIGHT: Questions */}
              <div className="panel right-panel">
                <div className="panel-header space-between">
                  <div className="flex-center"><Layers className="icon-blue" size={20} /><h2>Questions ({questions.length})</h2></div>
                  <button type="button" className="add-btn" onClick={addQuestion}><Plus size={18} /> Add</button>
                </div>
                <div className="questions-list">
                  {questions.length === 0 ? (
                    <div className="empty-questions"><FileText size={48} /><p>No questions yet.</p></div>
                  ) : (
                    questions.map((q, idx) => (
                      <div key={idx} className="question-card">
                        <div className="q-card-header">
                          <span className="q-number">Q{idx + 1}</span>
                          <select className="q-type-select" value={q.type} onChange={(e) => handleQuestionChange(idx, "type", e.target.value)}>
                            <option value="mcq">MCQ</option>
                            <option value="integer">Integer</option>
                          </select>
                          <div className="tag-wrapper">
                            <Tag size={16} className="tag-icon" />
                            <input className="tag-input" list={`tags-list-${idx}`} placeholder="Tag" value={q.tag} onChange={(e) => handleQuestionChange(idx, "tag", e.target.value)} />
                            <datalist id={`tags-list-${idx}`}>{availableTags.map((t, i) => <option key={i} value={t} />)}</datalist>
                          </div>
                          <button type="button" className="delete-icon" onClick={() => removeQuestion(idx)}><Trash2 size={16} /></button>
                        </div>
                        <textarea className="q-text-input" placeholder="Question text..." value={q.text} onChange={(e) => handleQuestionChange(idx, "text", e.target.value)} rows={2} />
                        {q.type === "mcq" && (
                          <div className="options-container">
                            {q.options.map((opt, oIdx) => (
                              <div key={oIdx} className="option-row">
                                <div className="opt-letter">{String.fromCharCode(65 + oIdx)}</div>
                                <input className="opt-input" placeholder={`Option ${oIdx + 1}`} value={opt} onChange={(e) => handleOptionChange(idx, oIdx, e.target.value)} />
                                <label className={`correct-toggle ${q.correctIndex === oIdx ? 'active' : ''}`}>
                                  <input type="radio" name={`correct-${idx}`} checked={q.correctIndex === oIdx} onChange={() => handleQuestionChange(idx, "correctIndex", oIdx)} />
                                  {q.correctIndex === oIdx ? <CheckSquare size={16} /> : <div className="unchecked-box"></div>}
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                        {q.type === "integer" && (
                          <div className="integer-row"><label>Correct Answer:</label><input type="number" className="int-input" value={q.correctInteger} onChange={(e) => handleQuestionChange(idx, "correctInteger", e.target.value)} placeholder="e.g. 25" required/></div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="create-action-bar">
               <button type="submit" className="submit-btn-large"><Save size={20} /> Create Quiz</button>
            </div>
          </form>
        </div>
      </div>

      {/* --- MODAL: GENERATE FROM AI --- */}
      {showAIModal && (
        <div className="modal-overlay">
          <div className="modal-box ai-modal">
            <div className="modal-header">
              <h3><Bot className="icon-purple" size={24}/> Generate Question from AI</h3>
              <button className="close-btn" onClick={() => setShowAIModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="ai-input-group">
                <input 
                  placeholder="Enter topic (e.g. Newton's Laws, Organic Chemistry)" 
                  value={aiTag}
                  onChange={(e) => setAiTag(e.target.value)}
                  disabled={loadingAI}
                />
                <button className="generate-btn" onClick={handleGenerateAI} disabled={loadingAI}>
                  {loadingAI ? <Loader2 size={18} className="spin" /> : "Generate"}
                </button>
              </div>

              {generatedQuestion && (
                <div className="ai-preview">
                  <span className="badge-preview">{generatedQuestion.type}</span>
                  <p className="q-preview">{generatedQuestion.text}</p>
                  {generatedQuestion.type === 'mcq' && (
                    <ul className="opts-preview">
                      {generatedQuestion.options.map((o, i) => (
                        <li key={i} className={i === generatedQuestion.correctIndex ? 'correct' : ''}>
                          {o} {i === generatedQuestion.correctIndex && <Check size={14} />}
                        </li>
                      ))}
                    </ul>
                  )}
                  {generatedQuestion.type === 'integer' && <div className="int-preview">Answer: {generatedQuestion.correctInteger}</div>}
                  
                  <button className="add-ai-btn" onClick={addAIQuestion}>
                    <Plus size={16} /> Add to Quiz
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: ADD PYQS --- */}
      {showPYQModal && (
        <div className="modal-overlay">
          <div className="modal-box pyq-modal">
            <div className="modal-header">
              <h3><FileStack className="icon-blue" size={24}/> Add Previous Year Questions</h3>
              <button className="close-btn" onClick={() => setShowPYQModal(false)}><X size={20} /></button>
            </div>
            
            <div className="modal-body pyq-body">
              {/* FILTERS */}
              <div className="pyq-filters">
                <div className="filter-group">
                  <Filter size={16} className="filter-icon" />
                  <select 
                    className="filter-select"
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                  >
                    <option value="">All Subjects</option>
                    {uniqueSubjects.map((sub, i) => (
                      <option key={i} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
                <div className="filter-group flex-grow">
                  <Tag size={16} className="filter-icon" />
                  <input 
                    className="filter-input"
                    placeholder="Filter by tag..."
                    value={filterTag}
                    onChange={(e) => setFilterTag(e.target.value)}
                    list="pyq-tags-list"
                  />
                  <datalist id="pyq-tags-list">
                    {uniqueTags.map((t, i) => <option key={i} value={t} />)}
                  </datalist>
                </div>
              </div>

              {loadingPYQ ? (
                <div className="loading-state-mini"><div className="spinner"></div></div>
              ) : filteredPYQs.length === 0 ? (
                <div className="empty-state-mini">
                  {pyqList.length === 0 ? "No PYQs available." : "No matching questions."}
                </div>
              ) : (
                <div className="pyq-list">
                  {filteredPYQs.map((q) => (
                    <div 
                      key={q._id} 
                      className={`pyq-item ${selectedPYQs.has(q._id) ? 'selected' : ''}`}
                      onClick={() => togglePYQ(q._id)}
                    >
                      <div className="pyq-check">
                        {selectedPYQs.has(q._id) ? <CheckSquare size={20} className="checked"/> : <div className="unchecked"></div>}
                      </div>
                      <div className="pyq-content">
                        <div className="pyq-tags">
                          <span className="tag-badge">{q.type}</span>
                          <span className="tag-badge">{q.subject}</span>
                          <span className="tag-badge">#{q.tag}</span>
                        </div>
                        <p className="pyq-text">{q.text}</p>
                        {q.type === 'mcq' && <div className="pyq-ans">Correct: {q.options[q.correctIndex]}</div>}
                        {q.type === 'integer' && <div className="pyq-ans">Answer: {q.correctInteger}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <span className="selection-count">{selectedPYQs.size} selected</span>
              <button className="add-selected-btn" onClick={addSelectedPYQs} disabled={selectedPYQs.size === 0}>
                Add Selected
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ---------------------------------------------------------------------------
// CSS STYLES
// ---------------------------------------------------------------------------
const css = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

/* --- Shared & Previous Styles (Condensed) --- */
.page { display: flex; height: 100vh; overflow: hidden; background: linear-gradient(135deg, #f7f3ff, #efe8ff); font-family: 'Poppins', sans-serif; position: relative; color: #333; }
.mobile-menu-btn { display: none; position: fixed; top: 20px; left: 20px; z-index: 1001; width: 50px; height: 50px; border-radius: 12px; background: #fff; border: 2px solid #6a11cb; color: #6a11cb; font-size: 24px; cursor: pointer; box-shadow: 0 4px 15px rgba(106, 17, 203, 0.2); align-items: center; justify-content: center; }
.overlay { display: none; }
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
.tooltip-container:hover .tooltip { opacity: 1; visibility: visible; transform: translateX(0); }
.tooltip { position: absolute; left: 70px; top: 50%; transform: translateY(-50%) translateX(-10px); background: #333; color: white; padding: 6px 12px; border-radius: 6px; font-size: 12px; white-space: nowrap; opacity: 0; visibility: hidden; transition: all 0.2s ease; z-index: 1000; pointer-events: none; }
.tooltip::before { content: ''; position: absolute; left: -4px; top: 50%; transform: translateY(-50%); border-width: 4px; border-style: solid; border-color: transparent #333 transparent transparent; }
.main { flex: 1; overflow: hidden; position: relative; display: flex; flex-direction: column; }
.main-content-wrapper { flex: 1; padding: 30px; overflow-y: auto; display: flex; flex-direction: column; max-width: 1600px; margin: 0 auto; width: 100%; box-sizing: border-box; }
.bg-circle-1 { position: absolute; top: -100px; right: -100px; width: 400px; height: 400px; background: rgba(106, 17, 203, 0.08); filter: blur(60px); border-radius: 50%; pointer-events: none; }
.bg-circle-2 { position: absolute; bottom: -150px; left: -150px; width: 500px; height: 500px; background: rgba(37, 117, 252, 0.08); filter: blur(80px); border-radius: 50%; pointer-events: none; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; position: relative; z-index: 2; flex-shrink: 0; }
.page-header h1 { font-size: 28px; font-weight: 700; color: #1a1a1a; margin: 0 0 5px 0; }
.page-header p { color: #666; font-size: 14px; margin: 0; }
.header-right { display: flex; align-items: center; gap: 12px; }
.header-btn { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; border: none; cursor: pointer; transition: transform 0.2s; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
.header-btn:hover { transform: translateY(-2px); }
.ai-btn { background: linear-gradient(135deg, #a855f7, #6366f1); color: white; }
.pyq-btn { background: #fff; color: #4b5563; border: 1px solid #e5e7eb; }
.admin-badge { background: #e0f2fe; color: #0ea5e9; padding: 8px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 6px; }
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

/* --- Modals --- */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 2000; animation: fadeIn 0.2s ease; }
.modal-box { background: white; border-radius: 20px; width: 90%; max-width: 600px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.2); animation: slideUp 0.3s ease; max-height: 85vh; }
.modal-header { padding: 20px; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center; background: #fbf9ff; }
.modal-header h3 { margin: 0; font-size: 18px; font-weight: 700; color: #333; display: flex; align-items: center; gap: 10px; }
.close-btn { background: none; border: none; color: #9ca3af; cursor: pointer; }
.close-btn:hover { color: #ef4444; }
.modal-body { padding: 25px; overflow-y: auto; flex: 1; }

/* AI Modal Styles */
.ai-input-group { display: flex; gap: 10px; margin-bottom: 20px; }
.ai-input-group input { flex: 1; border: 2px solid #e0d4fc; }
.generate-btn { background: linear-gradient(135deg, #a855f7, #6366f1); color: white; border: none; padding: 0 20px; border-radius: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; }
.generate-btn:disabled { opacity: 0.7; cursor: not-allowed; }
.spin { animation: spin 1s linear infinite; }
.ai-preview { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; position: relative; }
.badge-preview { background: #e0f2fe; color: #0ea5e9; font-size: 11px; padding: 4px 8px; border-radius: 6px; font-weight: 700; text-transform: uppercase; margin-bottom: 8px; display: inline-block; }
.q-preview { font-weight: 500; color: #333; margin-bottom: 15px; }
.opts-preview { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
.opts-preview li { background: white; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 14px; }
.opts-preview li.correct { border-color: #22c55e; background: #f0fdf4; color: #166534; }
.add-ai-btn { width: 100%; background: #22c55e; color: white; border: none; padding: 12px; border-radius: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }

/* PYQ Modal Styles & Filters */
.pyq-filters { display: flex; gap: 12px; margin-bottom: 15px; flex-wrap: wrap; }
.filter-group { display: flex; align-items: center; gap: 8px; background: #f3f4f6; padding: 6px 12px; border-radius: 10px; border: 1px solid #e5e7eb; }
.filter-group.flex-grow { flex: 1; }
.filter-icon { color: #6b7280; flex-shrink: 0; }
.filter-select, .filter-input { border: none; background: transparent; padding: 0; font-size: 13px; color: #333; outline: none; width: 100%; }
.filter-select { cursor: pointer; min-width: 120px; }
.filter-input::placeholder { color: #9ca3af; }

.pyq-list { display: flex; flex-direction: column; gap: 10px; }
.pyq-item { display: flex; gap: 15px; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; cursor: pointer; transition: all 0.2s; background: white; }
.pyq-item:hover { border-color: #a855f7; background: #faf5ff; }
.pyq-item.selected { border-color: #8b5cf6; background: #f3e8ff; }
.pyq-check { display: flex; align-items: center; padding-top: 2px; }
.checked { color: #8b5cf6; }
.unchecked { width: 20px; height: 20px; border: 2px solid #cbd5e1; border-radius: 4px; }
.pyq-content { flex: 1; }
.pyq-tags { display: flex; gap: 6px; margin-bottom: 6px; }
.tag-badge { background: #f1f5f9; color: #64748b; font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: 600; text-transform: uppercase; }
.pyq-text { font-size: 14px; font-weight: 500; color: #333; margin-bottom: 6px; }
.pyq-ans { font-size: 12px; color: #16a34a; font-weight: 500; }
.modal-footer { padding: 20px; border-top: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center; background: #fbf9ff; }
.selection-count { font-size: 14px; font-weight: 600; color: #6a11cb; }
.add-selected-btn { background: #6a11cb; color: white; border: none; padding: 10px 24px; border-radius: 10px; font-weight: 600; cursor: pointer; }
.add-selected-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.loading-state-mini, .empty-state-mini { padding: 40px; text-align: center; color: #999; }

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
  .header-right { width: 100%; flex-wrap: wrap; margin-top: 10px; }
  .header-btn { flex: 1; justify-content: center; }
  .pyq-filters { flex-direction: column; }
  .filter-group { width: 100%; box-sizing: border-box; }
}

@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
.loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; color: #6a11cb; font-weight: 500; font-family: 'Poppins', sans-serif; background: #f7f3ff; }
.spinner { width: 40px; height: 40px; border: 4px solid #e0d4fc; border-top: 4px solid #6a11cb; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px; }
@keyframes spin { to { transform: rotate(360deg); } }
`;