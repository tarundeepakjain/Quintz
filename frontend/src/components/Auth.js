import React, { useState } from 'react';
import axios from 'axios';
import { 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  CheckCircle,
  Shield,
  GraduationCap
} from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';

export default function QuintzAuth() {
  const [currentUserType, setCurrentUserType] = useState('student');
  const [currentForm, setCurrentForm] = useState('login');
  const [formData, setFormData] = useState({
    loginEmail: '',
    loginPassword: '',
    signupName: '',
    signupEmail: '',
    signupPassword: '',
    signupConfirmPassword: ''
  });

  const switchUserType = (type) => {
    setCurrentUserType(type);
  };

  const switchForm = (form) => {
    setCurrentForm(form);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("https://quintz.onrender.com/login", {
        userType: currentUserType,
        username: formData.loginEmail,
        password: formData.loginPassword
      });

      console.log(res.data);
      localStorage.setItem("access", res.data.access_token);
      // Use absolute path for reliability
      window.location.href = `${window.location.origin}/`; 
    } catch (err) {
      console.error(err);
      alert("Login failed. Please check your credentials.");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (formData.signupPassword !== formData.signupConfirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    try {
      const res = await axios.post("https://quintz.onrender.com/signup", {
        userType: currentUserType,
        name: formData.signupName,
        username: formData.signupEmail,
        password: formData.signupPassword
      });
      console.log(res);
      alert(res.data.message);
      window.location.href = `${window.location.origin}/auth`;
    } catch (err) {
      console.error(err);
      alert("Signup failed. Please try again.");
    }
  };

  const handleGoogleSignUp = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                // 2. Use the Access Token to get user info from Google
                const userInfo = await axios.get(
                    'https://www.googleapis.com/oauth2/v3/userinfo',
                    { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
                );

                // 3. Extract the data you want
                const { email, sub, name } = userInfo.data;
                const username = email.split('@')[0];
                // 4. Send this JSON to your Backend to save in MongoDB
                const res = await axios.post("https://quintz.onrender.com/signup", {
                  userType: currentUserType,
                  name:name,
                  username: username,
                  password: sub
                });
                console.log(res.data);
                alert(res.data.message);
                // Use absolute path for reliability
                window.location.href = `${window.location.origin}/auth`; 

            } catch (error) {
                console.error("Error fetching Google user info:", error);
            }
        },
        onError: error => console.log('Login Failed:', error)
    });

  const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                // 2. Use the Access Token to get user info from Google
                const userInfo = await axios.get(
                    'https://www.googleapis.com/oauth2/v3/userinfo',
                    { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
                );

                // 3. Extract the data you want
                const { email, sub } = userInfo.data;
                const username = email.split('@')[0];
                // 4. Send this JSON to your Backend to save in MongoDB
                const res = await axios.post("https://quintz.onrender.com/login", {
                  userType: currentUserType,
                  username: username,
                  password: sub
                });

                console.log(res.data);
                localStorage.setItem("access", res.data.access_token);
                alert(res.data.message);
                // Use absolute path for reliability
                window.location.href = `${window.location.origin}/`; 

            } catch (error) {
                console.error("Error fetching Google user info:", error);
            }
        },
        onError: error => console.log('Login Failed:', error)
    });
  const GoogleIcon = () => (
    <svg className="google-icon" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );

  return (
    <div className="auth-page">
      <style>{css}</style>
      
      {/* Decorative Background Elements */}
      <div className="bg-circle-1"></div>
      <div className="bg-circle-2"></div>

      <div className="auth-card animate-fadeIn">
        
        {/* Header Section */}
        <div className="auth-header">
          <div className="logo-section">
            <div className="logo-icon">Q</div>
            <h1 className="logo-text">QUINTZ</h1>
          </div>
          <p className="auth-subtitle">Your Own Quiz Platform</p>
          
          {/* User Type Toggle */}
          <div className="toggle-wrapper">
            <div 
              className="toggle-slider" 
              style={{ transform: currentUserType === 'admin' ? 'translateX(100%)' : 'translateX(0)' }}
            />
            <button 
              className={`toggle-btn ${currentUserType === 'student' ? 'active' : ''}`}
              onClick={() => switchUserType('student')}
            >
              <GraduationCap size={16} /> Student
            </button>
            <button 
              className={`toggle-btn ${currentUserType === 'admin' ? 'active' : ''}`}
              onClick={() => switchUserType('admin')}
            >
              <Shield size={16} /> Admin
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div className="auth-body">
          <h2 className="form-title">
            {currentForm === 'login' ? 'Welcome Back!' : 'Create Account'}
          </h2>
          
          {/* Login Form */}
          {currentForm === 'login' && (
            <div className="form-content animate-slideUp">
              <div className="input-group">
                <div className="input-icon"><User size={18} /></div>
                <input 
                  id="loginEmail"
                  name="loginEmail"
                  placeholder="Username"
                  value={formData.loginEmail}
                  onChange={handleInputChange}
                  required 
                />
              </div>

              <div className="input-group">
                <div className="input-icon"><Lock size={18} /></div>
                <input 
                  type="password" 
                  id="loginPassword"
                  name="loginPassword"
                  placeholder="Password"
                  value={formData.loginPassword}
                  onChange={handleInputChange}
                  required 
                />
              </div>

              <button className="submit-btn" onClick={handleLogin}>
                Sign In <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* Signup Form */}
          {currentForm === 'signup' && (
            <div className="form-content animate-slideUp">
              <div className="input-group">
                <div className="input-icon"><User size={18} /></div>
                <input 
                  type="text" 
                  id="signupName"
                  name="signupName"
                  placeholder="Full Name"
                  value={formData.signupName}
                  onChange={handleInputChange}
                  required 
                />
              </div>

              <div className="input-group">
                <div className="input-icon"><Mail size={18} /></div>
                <input 
                  id="signupEmail"
                  name="signupEmail"
                  placeholder="Username"
                  value={formData.signupEmail}
                  onChange={handleInputChange}
                  required 
                />
              </div>

              <div className="input-group">
                <div className="input-icon"><Lock size={18} /></div>
                <input 
                  type="password" 
                  id="signupPassword"
                  name="signupPassword"
                  placeholder="Create Password"
                  value={formData.signupPassword}
                  onChange={handleInputChange}
                  required 
                />
              </div>

              <div className="input-group">
                <div className="input-icon"><CheckCircle size={18} /></div>
                <input 
                  type="password" 
                  id="signupConfirmPassword"
                  name="signupConfirmPassword"
                  placeholder="Confirm Password"
                  value={formData.signupConfirmPassword}
                  onChange={handleInputChange}
                  required 
                />
              </div>

              <button className="submit-btn" onClick={handleSignup}>
                Create Account <ArrowRight size={18} />
              </button>
            </div>
          )}

          <div className="divider">
            <span>OR</span>
          </div>

          <button className="google-btn" onClick={currentForm==='signup'?handleGoogleSignUp:handleGoogleLogin}>
            <GoogleIcon />
            <span>Continue with Google</span>
          </button>

          <div className="switch-text">
            {currentForm === 'login' ? "Don't have an account?" : "Already have an account?"}
            <button className="link-btn" onClick={() => switchForm(currentForm === 'login' ? 'signup' : 'login')}>
              {currentForm === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f7f3ff, #efe8ff);
  font-family: 'Poppins', sans-serif;
  position: relative;
  overflow: hidden;
  padding: 20px;
}

.bg-circle-1 {
  position: absolute;
  top: -100px;
  left: -100px;
  width: 500px;
  height: 500px;
  background: rgba(106, 17, 203, 0.08);
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  animation: float 15s ease-in-out infinite;
}

.bg-circle-2 {
  position: absolute;
  bottom: -150px;
  right: -150px;
  width: 600px;
  height: 600px;
  background: rgba(37, 117, 252, 0.08);
  border-radius: 50%;
  filter: blur(100px);
  pointer-events: none;
  animation: float 20s ease-in-out infinite reverse;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(30px, 30px); }
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(106, 17, 203, 0.12);
  overflow: hidden;
  position: relative;
  z-index: 10;
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.auth-header {
  background: linear-gradient(135deg, #6a11cb, #2575fc);
  padding: 40px 30px 30px;
  text-align: center;
  color: white;
  border-bottom-left-radius: 30px;
  border-bottom-right-radius: 30px;
  position: relative;
}

.logo-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 8px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: white;
  color: #6a11cb;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 800;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.logo-text {
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -1px;
  margin: 0;
}

.auth-subtitle {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 25px;
  font-weight: 500;
}

/* Toggle Switch */
.toggle-wrapper {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 30px;
  padding: 4px;
  display: flex;
  position: relative;
  backdrop-filter: blur(5px);
  margin: 0 auto;
  max-width: 240px;
}

.toggle-slider {
  position: absolute;
  top: 4px;
  left: 4px;
  width: calc(50% - 4px);
  height: calc(100% - 8px);
  background: white;
  border-radius: 25px;
  transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.toggle-btn {
  flex: 1;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  padding: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  z-index: 2;
  transition: color 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.toggle-btn.active {
  color: #6a11cb;
}

.auth-body {
  padding: 30px;
}

.form-title {
  text-align: center;
  font-size: 22px;
  font-weight: 700;
  color: #333;
  margin: 0 0 25px 0;
}

.input-group {
  position: relative;
  margin-bottom: 16px;
}

.input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
  display: flex;
}

.input-group input {
  width: 100%;
  padding: 14px 16px 14px 48px;
  border-radius: 14px;
  border: 2px solid #f0f0f0;
  background: #fafafa;
  font-size: 14px;
  font-family: 'Poppins', sans-serif;
  color: #333;
  transition: all 0.2s;
  box-sizing: border-box;
}

.input-group input:focus {
  outline: none;
  border-color: #6a11cb;
  background: white;
  box-shadow: 0 0 0 4px rgba(106, 17, 203, 0.05);
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #6a11cb, #2575fc);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 10px;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 8px 20px rgba(106, 17, 203, 0.25);
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(106, 17, 203, 0.35);
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 25px 0;
  color: #a0aec0;
  font-size: 12px;
  font-weight: 600;
}

.divider::before, .divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #edf2f7;
}

.divider span {
  padding: 0 10px;
}

.google-btn {
  width: 100%;
  padding: 12px;
  background: white;
  border: 2px solid #edf2f7;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #4a5568;
  transition: all 0.2s;
}

.google-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e0;
}

.google-icon {
  width: 20px;
  height: 20px;
}

.switch-text {
  text-align: center;
  margin-top: 25px;
  font-size: 14px;
  color: #666;
}

.link-btn {
  background: none;
  border: none;
  color: #6a11cb;
  font-weight: 700;
  cursor: pointer;
  margin-left: 5px;
  padding: 0;
  font-family: 'Poppins', sans-serif;
}

.link-btn:hover {
  text-decoration: underline;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }

@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-slideUp { animation: slideUp 0.3s ease-out forwards; }
`;