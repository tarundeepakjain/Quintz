# Quintz — Online Quiz & Assessment Platform

**Live Demo:**  
https://quintz.vercel.app

**Backend API:**  
https://quintz.onrender.com

---

## Overview

Quintz is a full-stack online quiz and assessment platform designed to facilitate secure and flexible quiz creation, management, and evaluation. The system supports role-based access for administrators and students, AI-assisted question generation, public and private quizzes, real-time leaderboards, and detailed answer analytics.

The platform is suitable for academic assessments, practice quizzes, and competitive evaluations.

---

## Features

### User Roles
- Administrator
- Student

---

### Administrator Functionality
- Create quizzes using:
  - Manual question input
  - AI-generated questions using the Gemini API
  - Previous Year Questions (PYQs)
- Configure quizzes as public or private
- Assign custom quiz codes for controlled access
- View quiz submissions, leaderboards, and performance analytics

---

### Student Functionality
- Access public quizzes directly
- Join private quizzes using a quiz code
- Attempt quizzes within defined constraints
- View leaderboard rankings
- Analyze detailed answer summaries after submission

---

## Authentication and Security

- OAuth 2.0 based login
- JWT-based authentication for secure session management
- Role-based access control for protected routes
- Secure backend API endpoints

---

## System Working

### Authentication Flow
1. User authenticates using OAuth
2. Backend generates a JWT token
3. Token is used for authorization in subsequent API requests

---

### Quiz Creation Flow (Administrator)
1. Administrator selects quiz creation mode (Manual, AI-generated, or PYQ)
2. Questions are processed and stored in MongoDB
3. Quiz metadata including visibility, duration, and access code is saved
4. Quiz becomes available based on its configuration

---

### Quiz Attempt Flow (Student)
1. Student accesses a quiz via public listing or private quiz code
2. Quiz questions are fetched securely from the backend
3. Student submits responses
4. Backend evaluates responses and stores results

---

### Leaderboard and Analytics
- Scores are calculated after submission
- Leaderboards are generated dynamically
- Students receive answer-wise performance summaries

---

## Technology Stack

### Frontend
- React.js
- REST API integration
- Responsive user interface

### Backend
- Python Flask
- RESTful API architecture
- JWT authentication
- Gemini API for AI-based question generation

### Database
- MongoDB
  - Users
  - Quizzes
  - Questions
  - Quiz Results
  - Miscellaneous(Tags, User Performance, etc.)

---

## Project Structure (High Level)

QUINTZ/
├── backend/
│   ├── __pycache__/              # Python cache files
│   ├── env1/                     # Virtual environment
│   ├── .env                      # Environment variables
│   ├── .gitignore                # Backend gitignore
│   ├── app.py                    # Main Flask application
│   ├── gunicorn_config.py        # Gunicorn server configuration
│   ├── pymongo_get_database.py   # MongoDB connection utility
│   ├── requirements.txt          # Backend dependencies
│   └── rough.py                  # Testing / experimental code
│
├── frontend/
│   ├── node_modules/             # Frontend dependencies
│   ├── public/                   # Static public assets
│   ├── src/
│   │   ├── components/           # Reusable React components
│   │   ├── App.js                # Root React component
│   │   └── index.js              # React entry point
│   ├── .gitignore                # Frontend gitignore
│   ├── package.json              # Frontend dependencies & scripts
│   └── package-lock.json         # Dependency lock file
│
├── .vscode/                      # VS Code configuration
├── README.md                     # Project documentation
└── Readme.md                     # Additional documentation


## Key Highlights

- AI-assisted quiz generation
- Secure role-based access control
- Scalable backend design
- Clear separation of frontend and backend responsibilities
- Designed for real academic and competitive use cases

---

## Future Enhancements

- Question difficulty classification
- Advanced admin analytics dashboard
- Exportable quiz performance reports

---

## Author

Tarun Jain  
Email: tarundeepakjain@gmail.com  
LinkedIn: https://linkedin.com/in/tarundeepakjain
