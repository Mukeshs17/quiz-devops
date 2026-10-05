import React, { useState } from 'react';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Sample Quiz Questions
  const questions = [
    {
      question: "Which hook is used for state management in React?",
      options: ["useEffect", "useState", "useContext", "useReducer"],
      answer: "useState"
    },
    {
      question: "What language is used for Flask backend?",
      options: ["JavaScript", "Python", "Java", "C++"],
      answer: "Python"
    }
  ];

  // Login click pannumpodhu Backend DB kooda sync aagum
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username) return;

    try {
      const response = await fetch('http://127.0.0.1:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      const data = await response.json();
      if (data.status === 'success') {
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('DB Sync Error:', error);
      setIsLoggedIn(true); 
    }
  };

  // Option selection logic
  const handleAnswer = (selectedOption) => {
    const isCorrect = selectedOption === questions[currentQuestion].answer;
    const newScore = isCorrect ? score + 1 : score;
    setScore(newScore);

    const nextQ = currentQuestion + 1;
    if (nextQ < questions.length) {
      setCurrentQuestion(nextQ);
    } else {
      setQuizFinished(true);
      syncScore(newScore);
    }
  };

  // Quiz mudhinjadhum final score DB-ku send aagum
  const syncScore = async (finalScore) => {
    try {
      await fetch('http://127.0.0.1:5000/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, score: finalScore })
      });
    } catch (err) {
      console.error("Score sync failed:", err);
    }
  };

  return (
    <div className="app-container">
      {!isLoggedIn ? (
        <div className="card">
          <h2>Quiz Portal 🚀</h2>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Enter your Name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <button type="submit">Login & Start</button>
          </form>
        </div>
      ) : !quizFinished ? (
        <div className="card">
          <h3>Question {currentQuestion + 1}/{questions.length}</h3>
          <p className="question">{questions[currentQuestion].question}</p>
          <div className="options">
            {questions[currentQuestion].options.map((option, idx) => (
              <button key={idx} onClick={() => handleAnswer(option)} className="opt-btn">
                {option}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="card">
          <h2>Quiz Completed! 🎉</h2>
          <p>Great job, <strong>{username}</strong>!</p>
          <p className="score">Your Score: {score}/{questions.length}</p>
        </div>
      )}
    </div>
  );
}

export default App;
