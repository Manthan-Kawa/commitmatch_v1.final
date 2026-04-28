import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import './Login.css';

const DEMO_EMAIL = 'test@example.com';
const DEMO_PASSWORD = '123456';

// Same particle palette as Welcome page
const COLORS = [
  [168, 85,  247],  // purple
  [139, 92,  246],  // violet
  [6,   182, 212],  // cyan
  [192, 132, 252],  // light purple
  [99,  102, 241],  // indigo
];

export default function Login() {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const canvasRef = useRef(null);

  // View: 'login' | 'register'
  const [view, setView] = useState('login');

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // Particle network canvas — identical logic to Welcome page
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const COUNT = window.innerWidth < 600 ? 35 : 65;
    const MAX_DIST = 130;

    const particles = Array.from({ length: COUNT }, () => {
      const col = COLORS[Math.floor(Math.random() * COLORS.length)];
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2.2 + 0.8,
        dx: (Math.random() - 0.5) * 0.35,
        dy: (Math.random() - 0.5) * 0.35,
        alpha: Math.random() * 0.4 + 0.5,
        col,
      };
    });

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const lineAlpha = (1 - dist / MAX_DIST) * 0.12;
            const r = Math.round((a.col[0] + b.col[0]) / 2);
            const g = Math.round((a.col[1] + b.col[1]) / 2);
            const bC = Math.round((a.col[2] + b.col[2]) / 2);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${r},${g},${bC},${lineAlpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Plain dots
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.col[0]},${p.col[1]},${p.col[2]},${p.alpha})`;
        ctx.fill();

        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    setTimeout(() => {
      setLoginLoading(false);
      if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
        // Add welcome notification
        addNotification({
          title: 'Welcome back!',
          message: 'You have successfully logged in.',
          icon: '👋',
          color: '#667eea',
          type: 'login'
        });
        navigate('/dashboard');
      } else {
        setLoginError('Authentication failed. Invalid email or password.');
      }
    }, 900);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regName.trim()) return setRegError('Full name is required.');
    if (!regEmail.includes('@')) return setRegError('Enter a valid email address.');
    if (regPassword.length < 6) return setRegError('Password must be at least 6 characters.');
    if (regPassword !== regConfirm) return setRegError('Passwords do not match.');

    setRegError('Registration is not available in demo mode. Use the demo account to sign in.');
  };

  return (
    <div className="login-root">
      {/* Live particle canvas */}
      <canvas ref={canvasRef} className="login-canvas" />

      {/* Blob accents */}
      <div className="login-blob login-blob--tl" />
      <div className="login-blob login-blob--br" />

      <div className="login-card">
        {/* Logo */}
        <div className="login-brand">
          <img src="/favicon.svg" alt="CommitMatch" className="login-brand-logo" />
          <span className="login-brand-name">CommitMatch</span>
        </div>

        {view === 'login' ? (
          <>
            <h1 className="login-title">Welcome back</h1>
            <p className="login-subtitle">Sign in to your account to continue.</p>

            <form className="login-form" onSubmit={handleLogin} noValidate>
              <div className="login-field">
                <label className="login-label" htmlFor="login-email">EMAIL</label>
                <input
                  id="login-email"
                  type="email"
                  className="login-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="login-field">
                <label className="login-label" htmlFor="login-password">PASSWORD</label>
                <input
                  id="login-password"
                  type="password"
                  className="login-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              {loginError && (
                <div className="login-error" role="alert">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {loginError}
                </div>
              )}

              <button
                id="login-submit-btn"
                type="submit"
                className={`login-btn ${loginLoading ? 'login-btn--loading' : ''}`}
                disabled={loginLoading}
              >
                {loginLoading ? (
                  <>
                    <span className="login-spinner" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <p className="login-switch">
              Don't have an account?{' '}
              <button className="login-switch-link" onClick={() => { setView('register'); setLoginError(''); }}>
                Create an account
              </button>
            </p>

            <div className="login-divider"><span>DEMO CREDENTIALS</span></div>
            <div className="login-demo-box">
              <div><span className="login-demo-label">Email:</span> test@example.com</div>
              <div><span className="login-demo-label">Password:</span> 123456</div>
            </div>
          </>
        ) : (
          <>
            <h1 className="login-title">Create account</h1>
            <p className="login-subtitle">Join CommitMatch and start volunteering.</p>

            <form className="login-form" onSubmit={handleRegister} noValidate>
              <div className="login-field">
                <label className="login-label" htmlFor="reg-name">FULL NAME</label>
                <input
                  id="reg-name"
                  type="text"
                  className="login-input"
                  placeholder="Jane Smith"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                />
              </div>

              <div className="login-field">
                <label className="login-label" htmlFor="reg-email">EMAIL</label>
                <input
                  id="reg-email"
                  type="email"
                  className="login-input"
                  placeholder="you@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                />
              </div>

              <div className="login-field">
                <label className="login-label" htmlFor="reg-password">PASSWORD</label>
                <input
                  id="reg-password"
                  type="password"
                  className="login-input"
                  placeholder="Min 6 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                />
              </div>

              <div className="login-field">
                <label className="login-label" htmlFor="reg-confirm">CONFIRM PASSWORD</label>
                <input
                  id="reg-confirm"
                  type="password"
                  className="login-input"
                  placeholder="Repeat password"
                  value={regConfirm}
                  onChange={(e) => setRegConfirm(e.target.value)}
                />
              </div>

              {regError && (
                <div className="login-error" role="alert">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {regError}
                </div>
              )}

              {regSuccess && (
                <div className="login-success" role="status">{regSuccess}</div>
              )}

              <button id="register-submit-btn" type="submit" className="login-btn">
                Create Account
              </button>
            </form>

            <p className="login-switch">
              Already have an account?{' '}
              <button className="login-switch-link" onClick={() => { setView('login'); setRegError(''); setRegSuccess(''); }}>
                Sign in
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
