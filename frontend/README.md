# LearnTutor — AI-Powered Personalized Learning Tutor

## Setup
```bash
npm install
npm start
```
Opens at http://localhost:3000

## Project Structure
```
src/
├── App.jsx                → Router
├── components/
│   ├── LandingPage.jsx    → Hero, features, CTA
│   ├── AuthPage.jsx       → Login/Register (email, phone, Google)
│   ├── Dashboard.jsx      → Notebook management
│   ├── ProfilePage.jsx    → Edit profile, avatar, logout
│   ├── ChatPage.jsx       → Chat, citations, doc upload
│   ├── QuizPage.jsx       → Built-in + custom quiz, session timer
│   └── Shared.jsx         → Logo, Modal, Dropdown, helpers
└── data/
    └── sampleData.js      → Sample data
```
