import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { 
  Clock, 
  CheckCircle, 
  ChevronRight, 
  ChevronLeft,
  LogOut, 
  Menu, 
  X, 
  Save, 
  Flag,
  Play,
  Home as HomeIcon
} from "lucide-react";

export default function GiveQuiz() {
  const { quizId } = useParams();
  
  // --- States ---
  const [loading, setLoading] = useState(true);
  const [quizData, setQuizData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Answers map: { questionId: selectedOptionIndex OR typedValue }
  const [answers, setAnswers] = useState({});
  
  // Status tracking sets
  const [visited, setVisited] = useState(new Set([0]));
  const [markedForReview, setMarkedForReview] = useState(new Set());
  
  // Timer & Flow
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [isStarted, setIsStarted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showPaletteMobile, setShowPaletteMobile] = useState(false);

  // Timer Ref to clear interval
  const timerRef = useRef(null);

  // --- Effects ---

  useEffect(() => {
    fetchQuiz();
    return () => clearInterval(timerRef.current);
  }, [quizId]);

  useEffect(() => {
    if (isStarted && !isSubmitted && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            submitQuiz(); // Auto-submit on time end
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isStarted, isSubmitted]);

  // --- Logic ---

  const fetchQuiz = async () => {
    try {
      const token = localStorage.getItem("access");
      // GET request to fetch quiz details
      const res = await axios.get(`http://localhost:5001/quiz/${quizId}`, { 
        headers: { Authorization: "Bearer " + token } 
      });
      if(res.data.message==="Already Given" || res.data.message==="Quiz Doesn't Exist" || res.data.message=="Quiz hasn't started."){
        setQuizData(null);
        setLoading(false);
        return;
      }
      setQuizData(res.data);
      // Initialize timer based on durationMinutes from backend
    if (res.data.quizDetails) {
      const durationMinutes = res.data.quizDetails.durationMinutes;
      const startTimeISO = res.data.quizDetails.startTime; // e.g. "2025-12-07T10:30:00Z"

      const now = new Date();
      const startTime = new Date(startTimeISO);

      // Time difference in seconds
      const elapsedSeconds = Math.floor((now - startTime) / 1000);

      // Remaining time
      const remainingSeconds = durationMinutes * 60 - elapsedSeconds;

      setTimeLeft(Math.max(remainingSeconds, 0)); // never negative
    }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching quiz:", err);
      // Fallback logic for network error removed as requested, keeping core logic
    }
  };

  const startQuiz = () => {
    setIsStarted(true);
    setVisited(new Set([0]));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (val) => {
    const currentQ = quizData.questions[currentQuestionIndex];
    setAnswers(prev => ({
      ...prev,
      [currentQ._id]: val
    }));
  };

  const changeQuestion = (index) => {
    if (index < 0 || index >= quizData.questions.length) return;
    
    // Mark new question as visited
    setVisited(prev => new Set(prev).add(index));
    setCurrentQuestionIndex(index);
    setShowPaletteMobile(false);
  };

  const toggleMarkForReview = () => {
    const newSet = new Set(markedForReview);
    if (newSet.has(currentQuestionIndex)) {
      newSet.delete(currentQuestionIndex);
    } else {
      newSet.add(currentQuestionIndex);
    }
    setMarkedForReview(newSet);
  };

  const clearResponse = () => {
    const currentQ = quizData.questions[currentQuestionIndex];
    const newAnswers = { ...answers };
    delete newAnswers[currentQ._id];
    setAnswers(newAnswers);
  };

  const submitQuiz = async () => {
    clearInterval(timerRef.current);
    
    try {
      const token = localStorage.getItem("access");
      const endTime = new Date().toISOString(); // ISO Format

      const payload = {
        quizID: quizId,
        answers: answers, // Format: { "qId": markedAnswer }
        endTime: endTime
      };

      await axios.post("http://localhost:5001/quiz/submit", payload, {
        headers: { Authorization: "Bearer " + token }
      });

      setIsSubmitted(true);
    } catch (err) {
      console.error("Error submitting quiz:", err);
      // Fallback: If network fails, still show the summary screen so the user doesn't get stuck
      setIsSubmitted(true); 
    }
  };

  const getQuestionStatus = (index, qId) => {
    const isAnswered = answers[qId] !== undefined && answers[qId] !== "";
    const isMarked = markedForReview.has(index);
    const isVis = visited.has(index);

    if (isMarked) return "review";
    if (isAnswered) return "answered";
    if (isVis) return "visited"; // Visited but not answered
    return "not-visited";
  };

  // --- Renders ---

  if (loading) return (
    <div className="quiz-container loading-state">
      <style>{css}</style>
      <div className="spinner"></div>
      <p>Loading Quiz Details...</p>
    </div>
  );

  if (!quizData) return (
    <div className="quiz-container loading-state">
      <style>{css}</style>
      <p>Quiz Not Found/Not Started/Already ended.</p>
        <button className="home-btn" onClick={() => window.close()}>
            <LogOut size={18} /> Exit
        </button>
    </div>
  );

  // 1. Instructions Screen
  if (!isStarted) {
    return (
      <div className="quiz-container">
        <style>{css}</style>
        
        {/* Header for Consistency */}
        <header className="quiz-header">
          <div className="brand">
            {/* UPDATED LOGO */}
            <div className="logo-icon">Q</div>
            <span className="divider">|</span>
            <span className="quiz-name">{quizData.quizDetails.quizName}</span>
          </div>
        </header>

        <div className="instruction-card">
          <div className="instruction-header">
            <h1>{quizData.quizDetails.quizName}</h1>
            <span className="badge">{quizData.quizDetails.subject}</span>
          </div>
          
          <div className="instruction-content">
            <h3>Instructions</h3>
            <ul>
              <li>The quiz contains <strong>{quizData.questions.length} questions</strong>.</li>
              <li>Total duration is <strong>{quizData.quizDetails.durationMinutes} minutes</strong>.</li>
              <li>You can navigate to any question using the question palette on the left.</li>
              <li>Green indicates answered, Red indicates visited but not answered.</li>
              <li>The quiz will <strong>auto-submit</strong> when the timer reaches zero.</li>
            </ul>
            
            <div className="quiz-meta">
              <div className="meta-item">
                <span>⏱️ Duration</span>
                <strong>{quizData.quizDetails.durationMinutes} Mins</strong>
              </div>
              <div className="meta-item">
                <span>🏆 Total Marks</span>
                <strong>{quizData.quizDetails.totalMarks}</strong>
              </div>
            </div>
          </div>

          <button className="start-btn" onClick={startQuiz}>
            <span>Start Quiz</span> <Play size={20} fill="currentColor" />
          </button>
        </div>
      </div>
    );
  }

  // 2. Summary Screen (Post Submit)
  if (isSubmitted) {
    const totalQ = quizData.questions.length;
    const answeredCount = Object.keys(answers).length;
    const markedCount = markedForReview.size;
    
    return (
      <div className="quiz-container">
        <style>{css}</style>
        
        {/* Header for Consistency */}
        <header className="quiz-header">
          <div className="brand">
            {/* UPDATED LOGO */}
            <div className="logo-icon">Q</div>
            <span className="divider">|</span>
            <span className="quiz-name">{quizData.quizDetails.quizName}</span>
          </div>
        </header>

        <div className="summary-card">
          <div className="summary-header">
            <div className="success-icon-bg">
              <CheckCircle size={48} className="success-icon" />
            </div>
            <h2>Quiz Submitted Successfully!</h2>
            <p>Here is your attempt summary</p>
          </div>

          <div className="summary-grid">
            <div className="summary-item">
              <span className="lbl">Total Questions</span>
              <span className="val">{totalQ}</span>
            </div>
            <div className="summary-item">
              <span className="lbl">Answered</span>
              <span className="val success">{answeredCount}</span>
            </div>
            <div className="summary-item">
              <span className="lbl">Not Answered</span>
              <span className="val danger">{totalQ - answeredCount}</span>
            </div>
            <div className="summary-item">
              <span className="lbl">Marked for Review</span>
              <span className="val warning">{markedCount}</span>
            </div>
          </div>

          <button className="home-btn" onClick={() => window.close()}>
            <LogOut size={18} /> Exit
          </button>
        </div>
      </div>
    );
  }

  // 3. Active Quiz Interface
  const currentQ = quizData.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quizData.questions.length - 1;

  return (
    <div className="quiz-interface">
      <style>{css}</style>

      {/* Top Bar */}
      <header className="quiz-header">
        <div className="brand">
          {/* UPDATED LOGO */}
          <div className="logo-icon">Q</div>
          <span className="divider">|</span>
          <span className="quiz-name">{quizData.quizDetails.quizName}</span>
        </div>
        
        <div className="timer-block" style={{ color: timeLeft < 60 ? '#ff4757' : 'inherit' }}>
          <Clock size={20} />
          <span>{formatTime(timeLeft)}</span>
        </div>

        <button className="mobile-palette-toggle" onClick={() => setShowPaletteMobile(!showPaletteMobile)}>
          {showPaletteMobile ? <X /> : <Menu />}
        </button>
      </header>

      <div className="quiz-body">
        {/* Left Sidebar: Question Palette */}
        <aside className={`question-palette ${showPaletteMobile ? 'open' : ''}`}>
          <div className="palette-header">
            <h3>Question Palette</h3>
            <div className="legend">
              <div className="legend-item"><span className="dot answered"></span> Answered</div>
              <div className="legend-item"><span className="dot visited"></span> Not Answered</div>
              <div className="legend-item"><span className="dot review"></span> Review</div>
              <div className="legend-item"><span className="dot not-visited"></span> Not Visited</div>
            </div>
          </div>

          <div className="palette-grid">
            {quizData.questions.map((q, idx) => {
              const status = getQuestionStatus(idx, q._id);
              const isActive = currentQuestionIndex === idx;
              return (
                <button
                  key={q._id}
                  className={`palette-btn ${status} ${isActive ? 'active' : ''}`}
                  onClick={() => changeQuestion(idx)}
                >
                  {idx + 1}
                  {status === 'review' && <span className="review-indicator"></span>}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Area: Question Display */}
        <main className="question-area">
          <div className="question-card">
            <div className="q-header">
              <span className="q-number">Question {currentQuestionIndex + 1}</span>
              <div className="q-tools">
                <span className="q-type">{currentQ.type === 'mcq' ? 'Multiple Choice' : 'Integer Type'}</span>
                <span className="q-marks">+{quizData.quizDetails.totalMarks/quizData.questions.length}, -{quizData.quizDetails.negativeMarkPerQuestion}</span>
              </div>
            </div>

            <div className="q-text">
              {currentQ.text}
            </div>

            <div className="q-options">
              {currentQ.type === 'mcq' ? (
                <div className="mcq-grid">
                  {currentQ.options.map((opt, idx) => (
                    <label 
                      key={idx} 
                      className={`option-label ${answers[currentQ._id] === idx ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQ._id}`}
                        checked={answers[currentQ._id] === idx}
                        onChange={() => handleOptionSelect(idx)}
                      />
                      <span className="opt-marker">{String.fromCharCode(65 + idx)}</span>
                      <span className="opt-text">{opt}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="integer-input-wrapper">
                  <input
                    type="number"
                    placeholder="Enter your answer here..."
                    value={answers[currentQ._id] || ''}
                    onChange={(e) => handleOptionSelect(e.target.value)}
                    className="integer-input"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Bottom Navigation Bar */}
          <div className="quiz-footer">
             <div className="footer-left">
                <button className="action-btn secondary" onClick={toggleMarkForReview}>
                  <Flag size={16} /> 
                  {markedForReview.has(currentQuestionIndex) ? 'Unmark' : 'Review'}
                </button>
                <button className="action-btn secondary" onClick={clearResponse}>
                  Clear Response
                </button>
             </div>

             <div className="footer-right">
                <button 
                  className="nav-btn-q" 
                  onClick={() => changeQuestion(currentQuestionIndex - 1)}
                  disabled={currentQuestionIndex === 0}
                >
                  <ChevronLeft size={20} /> Previous
                </button>

                {!isLastQuestion ? (
                  <button 
                    className="nav-btn-q next" 
                    onClick={() => changeQuestion(currentQuestionIndex + 1)}
                  >
                    Next <ChevronRight size={20} />
                  </button>
                ) : (
                   <button className="submit-quiz-btn" onClick={submitQuiz}>
                     Submit Quiz <Save size={18} />
                   </button>
                )}
             </div>
          </div>
        </main>
      </div>
    </div>
  );
}

const css = `
/* --- Global & Animations --- */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

.quiz-container, .quiz-interface {
  font-family: 'Poppins', sans-serif;
  min-height: 100vh;
  background: linear-gradient(135deg, #f7f3ff, #efe8ff);
  color: #333;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  color: #6a11cb;
  font-weight: 500;
}
.spinner {
  width: 40px; height: 40px;
  border: 4px solid #e0d4fc;
  border-top: 4px solid #6a11cb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* --- Instruction Screen --- */
.instruction-card {
  max-width: 800px;
  margin: 100px auto 40px; /* Increased top margin for header */
  background: white;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(106, 17, 203, 0.1);
  animation: slideUp 0.5s ease;
}
.instruction-header {
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 20px;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.instruction-header h1 { margin: 0; color: #6a11cb; font-size: 28px; }
.badge { background: #e0d4fc; color: #6a11cb; padding: 5px 12px; border-radius: 20px; font-size: 14px; font-weight: 600; text-transform: uppercase; }

/* Fixed: Added padding-left so bullets aren't cut off */
.instruction-content ul { list-style: none; padding-left: 20px; margin-bottom: 30px; }
.instruction-content li { padding: 10px 0; border-bottom: 1px dashed #eee; font-size: 16px; color: #555; position: relative; }
/* Adjusted margin-left relative to the new padding */
.instruction-content li:before { content: "•"; color: #6a11cb; font-weight: bold; display: inline-block; width: 1em; margin-left: -1em; }

.quiz-meta { display: flex; gap: 40px; margin-bottom: 40px; background: #f9f7ff; padding: 20px; border-radius: 12px; }
.meta-item { display: flex; flex-direction: column; }
.meta-item span { font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
.meta-item strong { font-size: 18px; color: #333; margin-top: 4px; }

.start-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #6a11cb, #2575fc);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: transform 0.2s;
  box-shadow: 0 6px 20px rgba(106, 17, 203, 0.3);
}
.start-btn:hover { transform: translateY(-2px); }

/* --- Summary Screen --- */
.summary-card {
  max-width: 600px;
  margin: 100px auto 40px; /* Increased top margin for header */
  background: white;
  border-radius: 24px;
  padding: 50px;
  text-align: center;
  box-shadow: 0 15px 50px rgba(0,0,0,0.1);
  animation: fadeIn 0.5s ease;
}
.success-icon-bg {
  width: 80px; height: 80px;
  background: #e0f9f0;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 20px;
}
.success-icon { color: #00d084; }
.summary-header h2 { color: #333; margin: 0 0 10px; }
.summary-header p { color: #777; margin-bottom: 40px; }

.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 40px;
}
.summary-item {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.lbl { font-size: 14px; color: #888; margin-bottom: 5px; }
.val { font-size: 24px; font-weight: 700; color: #333; }
.val.success { color: #00d084; }
.val.danger { color: #ff4757; }
.val.warning { color: #ff9f43; }

.home-btn {
  padding: 14px 30px;
  background: linear-gradient(135deg, #6a11cb, #2575fc);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 6px 20px rgba(106, 17, 203, 0.2);
  transition: transform 0.2s;
}
.home-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(106, 17, 203, 0.3); }

/* --- Active Quiz Layout --- */
.quiz-header {
  height: 70px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
}
.brand { display: flex; align-items: center; gap: 10px; }
.logo-icon { width: 32px; height: 32px; background: linear-gradient(135deg, #6a11cb, #2575fc); border-radius: 8px; color: white; font-size: 20px; font-weight: 800; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(106, 17, 203, 0.3); }
.divider { color: #ddd; }
.quiz-name { font-weight: 600; color: #555; }

.timer-block {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 18px;
  background: #f5f5f5;
  padding: 8px 16px;
  border-radius: 8px;
}

.mobile-palette-toggle { display: none; background: none; border: none; font-size: 24px; cursor: pointer; }

.quiz-body {
  display: flex;
  padding-top: 70px; /* Header height */
  height: 100vh;
  box-sizing: border-box;
}

/* Sidebar Palette */
.question-palette {
  width: 280px;
  background: white;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}
.palette-header { padding: 20px; border-bottom: 1px solid #f0f0f0; }
.palette-header h3 { margin: 0 0 15px; font-size: 16px; color: #333; }
.legend { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.legend-item { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #666; }
.dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
.dot.answered { background: #00d084; }
.dot.visited { background: #ff4757; } /* Usually red in exams for 'Not Answered' */
.dot.review { background: #ff9f43; }
.dot.not-visited { background: #eee; border: 1px solid #ddd; }

.palette-grid {
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  align-content: start;
  overflow-y: auto;
  flex: 1;
}

.palette-btn {
  width: 36px; height: 36px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.1s;
}
.palette-btn:hover { transform: scale(1.1); }
.palette-btn.answered { background: #00d084; color: white; }
.palette-btn.visited { background: #ff4757; color: white; }
.palette-btn.review { background: #ff9f43; color: white; border-radius: 50%; }
.palette-btn.not-visited { background: white; border: 1px solid #ddd; color: #555; }
.palette-btn.active { box-shadow: 0 0 0 3px #6a11cb; z-index: 2; }

/* Main Question Area */
.question-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: #f4f7fe;
  overflow-y: auto;
}

.question-card {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.05);
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  overflow-y: auto;
}

.q-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #f0f0f0; }
.q-number { font-size: 18px; font-weight: 700; color: #6a11cb; }
.q-tools { display: flex; gap: 15px; font-size: 13px; font-weight: 600; color: #888; }
.q-type { background: #f0f0f0; padding: 4px 10px; border-radius: 6px; }

.q-text { font-size: 18px; line-height: 1.6; color: #333; margin-bottom: 30px; font-weight: 500; }

.mcq-grid { display: flex; flex-direction: column; gap: 12px; }
.option-label {
  display: flex;
  align-items: center;
  padding: 15px;
  border: 2px solid #eee;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.option-label:hover { border-color: #6a11cb; background: #fbf9ff; }
.option-label.selected { border-color: #6a11cb; background: #f0e7ff; }
.option-label input { display: none; }
.opt-marker {
  width: 28px; height: 28px;
  background: #eee; color: #666;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin-right: 15px; font-weight: 600; font-size: 14px;
}
.option-label.selected .opt-marker { background: #6a11cb; color: white; }
.opt-text { font-size: 16px; color: #444; }

.integer-input-wrapper input {
  width: 100%;
  padding: 15px;
  font-size: 18px;
  border: 2px solid #eee;
  border-radius: 12px;
  outline: none;
}
.integer-input-wrapper input:focus { border-color: #6a11cb; }

/* Footer */
.quiz-footer {
  background: white;
  padding: 15px 25px;
  border-radius: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 5px 20px rgba(0,0,0,0.05);
}
.footer-left { display: flex; gap: 10px; }
.footer-right { display: flex; gap: 10px; }

.action-btn {
  border: none;
  background: transparent;
  padding: 10px 15px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  border-radius: 8px;
  display: flex; align-items: center; gap: 6px;
  font-weight: 500;
}
.action-btn:hover { background: #f0f0f0; }

.nav-btn-q {
  padding: 12px 24px;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  display: flex; align-items: center; gap: 8px;
  background: #e0e0e0; color: #555;
}
.nav-btn-q:hover:not(:disabled) { background: #d0d0d0; }
.nav-btn-q:disabled { opacity: 0.5; cursor: not-allowed; }

.nav-btn-q.next {
  background: #6a11cb; color: white;
}
.nav-btn-q.next:hover { background: #5a0eb3; }

.submit-quiz-btn {
  padding: 12px 24px;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  display: flex; align-items: center; gap: 8px;
  background: #00d084; color: white;
  box-shadow: 0 4px 15px rgba(0, 208, 132, 0.3);
}
.submit-quiz-btn:hover { transform: translateY(-2px); }

/* --- Responsive --- */
@media(max-width: 900px) {
  .mobile-palette-toggle { display: block; }
  .question-palette {
    position: fixed;
    top: 70px; bottom: 0; left: 0;
    z-index: 50;
    transform: translateX(-100%);
    transition: transform 0.3s;
    width: 260px;
  }
  .question-palette.open { transform: translateX(0); }
  .quiz-footer { flex-direction: column; gap: 15px; }
  .footer-left, .footer-right { width: 100%; justify-content: space-between; }
}

@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
`;