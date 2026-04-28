import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const navigate = useNavigate();
  
  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">CommitMatch</h1>
        <p className="auth-subtitle">Crisis Volunteer Coordination</p>
        <form onSubmit={handleLogin}>
          <input 
            type="email" 
            placeholder="Enter your email" 
            className="auth-input" 
            required 
          />
          <button type="submit" className="auth-btn">
            Send Magic Link
          </button>
        </form>
      </div>
    </div>
  );
}
