import { useState } from 'react';
import axios from 'axios';

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
    const res = await axios.post("http://localhost:5001/login",{
      userType: currentUserType,
      username: formData.loginEmail,
      password: formData.loginPassword
    });

    console.log(res.data);
    localStorage.setItem("access", res.data.access_token);
    //localStorage.setItem("refresh", res.data.refresh_token);
    alert(res.data.message);
    window.location.href="/home";
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (formData.signupPassword !== formData.signupConfirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    const res = await axios.post("http://localhost:5001/signup",{
      userType: currentUserType,
      name: formData.signupName,
      username: formData.signupEmail,
      password: formData.signupPassword
    });
    console.log(res);
    alert(res.data.message);
    window.location.href="/auth";
  };

  const handleGoogleSignIn = () => {
    console.log('Google Sign-In attempt:', {
      userType: currentUserType,
      action: currentForm
    });

    alert(`Google Sign-In for ${currentUserType.charAt(0).toUpperCase() + currentUserType.slice(1)}\n\nIn production, this would redirect to Google OAuth.`);
  };

  const GoogleIcon = () => (
    <svg style={{width: '20px', height: '20px'}} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );

  return (
    <div style={styles.authBody}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.logo}>QUINTZ</div>
            <div style={styles.tagline}>Your Learning Platform</div>
            <div style={styles.userTypeBadge}>
              <span style={styles.badgeIcon}>{currentUserType === 'student' ? '👨‍🎓' : '👨‍💼'}</span>
              <span>{currentUserType === 'student' ? 'Student Portal' : 'Admin Portal'}</span>
            </div>
          </div>
        </div>

        <div style={styles.toggleContainer}>
          <div style={{
            ...styles.toggleSlider,
            transform: currentUserType === 'admin' ? 'translateX(100%)' : 'translateX(0)'
          }}></div>
          <button 
            style={{
              ...styles.toggleBtn,
              color: currentUserType === 'student' ? 'white' : '#666'
            }}
            onClick={() => switchUserType('student')}
          >
            Student
          </button>
          <button 
            style={{
              ...styles.toggleBtn,
              color: currentUserType === 'admin' ? 'white' : '#666'
            }}
            onClick={() => switchUserType('admin')}
          >
            Admin
          </button>
        </div>

        {/* Login Form */}
        <div style={{
          ...styles.formSection,
          display: currentForm === 'login' ? 'block' : 'none'
        }}>
          <div style={styles.formContainer}>
            <h2 style={styles.formTitle}>Welcome Back</h2>
            
            <div>
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="loginEmail">Username</label>
                <input 
                  style={styles.input}
                  id="loginEmail"
                  name="loginEmail"
                  placeholder="Enter your email"
                  value={formData.loginEmail}
                  onChange={handleInputChange}
                  required 
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="loginPassword">Password</label>
                <input 
                  style={styles.input}
                  type="password" 
                  id="loginPassword"
                  name="loginPassword"
                  placeholder="Enter your password"
                  value={formData.loginPassword}
                  onChange={handleInputChange}
                  required 
                />
              </div>

              <button style={styles.submitBtn} onClick={handleLogin}>Sign In</button>
            </div>

            <div style={styles.divider}>OR</div>

            <button style={styles.googleBtn} onClick={handleGoogleSignIn}>
              <GoogleIcon />
              Sign in with Google
            </button>

            <div style={styles.switchForm}>
              Don't have an account? <a style={styles.link} onClick={() => switchForm('signup')}>Sign Up</a>
            </div>
          </div>
        </div>

        {/* Signup Form */}
        <div style={{
          ...styles.formSection,
          display: currentForm === 'signup' ? 'block' : 'none'
        }}>
          <div style={styles.formContainer}>
            <h2 style={styles.formTitle}>Create Account</h2>
            
            <div>
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="signupName">Full Name</label>
                <input 
                  style={styles.input}
                  type="text" 
                  id="signupName"
                  name="signupName"
                  placeholder="Enter your full name"
                  value={formData.signupName}
                  onChange={handleInputChange}
                  required 
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="signupEmail">Username</label>
                <input 
                  style={styles.input}
                  id="signupEmail"
                  name="signupEmail"
                  placeholder="Enter your email"
                  value={formData.signupEmail}
                  onChange={handleInputChange}
                  required 
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="signupPassword">Password</label>
                <input 
                  style={styles.input}
                  type="password" 
                  id="signupPassword"
                  name="signupPassword"
                  placeholder="Create a password"
                  value={formData.signupPassword}
                  onChange={handleInputChange}
                  required 
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="signupConfirmPassword">Confirm Password</label>
                <input 
                  style={styles.input}
                  type="password" 
                  id="signupConfirmPassword"
                  name="signupConfirmPassword"
                  placeholder="Confirm your password"
                  value={formData.signupConfirmPassword}
                  onChange={handleInputChange}
                  required 
                />
              </div>

              <button style={styles.submitBtn} onClick={handleSignup}>Create Account</button>
            </div>

            <div style={styles.divider}>OR</div>

            <button style={styles.googleBtn} onClick={handleGoogleSignIn}>
              <GoogleIcon />
              Sign up with Google
            </button>

            <div style={styles.switchForm}>
              Already have an account? <a style={styles.link} onClick={() => switchForm('login')}>Sign In</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  authBody: {
    fontFamily: "'Poppins', sans-serif",
    backgroundImage : "url('/loginBg.png')",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 0,
    margin: 0,
  },

  container: {
    background: "white",
    borderRadius: "20px",
    boxShadow: "0 12px 45px rgba(0,0,0,0.18)",
    overflow: "hidden",
    width: "100%",
    maxWidth: "450px",
    height: "90vh",
    display: "flex",
    flexDirection: "column",
  },

  header: {
    background: "linear-gradient(135deg, #6a11cb 0%, #8e63ff 100%)",
    padding: "40px 20px",
    textAlign: "center",
    color: "white",
  },

  headerContent: {
    position: "relative",
    zIndex: 1,
  },

  logo: {
    fontSize: "38px",
    fontWeight: "800",
    letterSpacing: "3px",
    marginBottom: "6px",
  },

  tagline: {
    fontSize: "14px",
    opacity: 0.9,
    marginBottom: "12px",
  },

  userTypeBadge: {
    display: "inline-flex",
    gap: "8px",
    alignItems: "center",
    padding: "6px 18px",
    background: "rgba(255,255,255,0.25)",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
  },

  badgeIcon: {
    width: "18px",
    height: "18px",
    background: "white",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
  },

  toggleContainer: {
    display: "flex",
    background: "#f0e8ff",
    borderRadius: "25px",
    padding: "4px",
    margin: "18px 40px",
    position: "relative",
  },

  toggleBtn: {
    flex: 1,
    padding: "12px",
    border: "none",
    background: "transparent",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    zIndex: 2,
  },

  toggleSlider: {
    position: "absolute",
    top: "4px",
    left: "4px",
    width: "50%",
    height: "calc(100% - 8px)",
    background: "linear-gradient(135deg, #6a11cb 0%, #8e63ff 100%)",
    borderRadius: "20px",
    transition: "transform 0.3s ease",
  },

  formSection: {
    flex: 1,
    overflowY: "auto",
    paddingBottom: "10px",
  },

  formContainer: {
    padding: "25px 30px",
  },

  formTitle: {
    marginBottom: "20px",
    color: "#333",
    fontSize: "22px",
    fontWeight: "700",
  },

  formGroup: {
    marginBottom: "18px",
  },

  label: {
    display: "block",
    marginBottom: "6px",
    color: "#444",
    fontWeight: "600",
    fontSize: "14px",
  },

  input: {
    width: "100%",
    padding: "12px",
    border: "2px solid #e4d7ff",
    borderRadius: "10px",
    fontSize: "14px",
    transition: "0.2s",
  },

  submitBtn: {
    width: "100%",
    padding: "12px",
    background: "linear-gradient(135deg, #6a11cb 0%, #8e63ff 100%)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "8px",
    boxShadow: "0 6px 18px rgba(106, 17, 203, 0.4)",
    transition: "0.2s",
  },

  divider: {
    textAlign: "center",
    margin: "22px 0 15px",
    color: "#888",
    fontSize: "13px",
  },

  googleBtn: {
    width: "100%",
    padding: "12px",
    background: "white",
    border: "2px solid #e4d7ff",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    gap: "10px",
    alignItems: "center",
    justifyContent: "center",
    transition: "0.2s",
  },

  switchForm: {
    marginTop: "15px",
    textAlign: "center",
    fontSize: "14px",
    color: "#666",
  },

  link: {
    color: "#6a11cb",
    fontWeight: "700",
    cursor: "pointer",
  },
};

