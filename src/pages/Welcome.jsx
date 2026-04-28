import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Welcome.css';

// Phrases that cycle in the typewriter
const TYPED_PHRASES = [
  'Crisis Needs',
  'Urgent Calls',
  'Community Aid',
  'Disaster Relief',
  'Real Emergencies',
];

const TYPE_SPEED = 75;    // ms per character typed
const DELETE_SPEED = 40;  // ms per character deleted
const PAUSE_AFTER = 1800; // ms pause when fully typed
const PAUSE_BEFORE = 400; // ms pause before typing next

export default function Welcome() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Typewriter state
  const [displayText, setDisplayText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Canvas particle network
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

    // Mixed purple + cyan palette for cosmic feel
    const COLORS = [
      [168, 85, 247],   // purple (#a855f7)
      [139, 92, 246],   // violet (#8b5cf6)
      [6,   182, 212],  // cyan   (#06b6d4)
      [192, 132, 252],  // light purple (#c084fc)
      [99,  102, 241],  // indigo (#6366f1)
    ];

    const COUNT = window.innerWidth < 600 ? 35 : 65;
    const MAX_DIST = 130;

    const particles = Array.from({ length: COUNT }, () => {
      const col = COLORS[Math.floor(Math.random() * COLORS.length)];
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2.2 + 0.8,        // larger: 0.8–3px
        dx: (Math.random() - 0.5) * 0.35,
        dy: (Math.random() - 0.5) * 0.35,
        alpha: Math.random() * 0.4 + 0.5,     // brighter: 0.5–0.9
        col,
      };
    });

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connecting lines first (behind dots)
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const lineAlpha = (1 - dist / MAX_DIST) * 0.12;
            // Blend color between the two particle colors
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

      // Draw plain dots
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.col[0]},${p.col[1]},${p.col[2]},${p.alpha})`;
        ctx.fill();

        // Move
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

  // Typewriter engine
  useEffect(() => {
    const current = TYPED_PHRASES[phraseIndex];
    let timeout;

    if (!isDeleting) {
      if (displayText.length < current.length) {
        timeout = setTimeout(() => {
          setDisplayText(current.slice(0, displayText.length + 1));
        }, TYPE_SPEED);
      } else {
        timeout = setTimeout(() => setIsDeleting(true), PAUSE_AFTER);
      }
    } else {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(current.slice(0, displayText.length - 1));
        }, DELETE_SPEED);
      } else {
        timeout = setTimeout(() => {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % TYPED_PHRASES.length);
        }, PAUSE_BEFORE);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, phraseIndex]);

  return (
    <div className="welcome-root">
      <canvas ref={canvasRef} className="welcome-canvas" />

      {/* Glow blobs */}
      <div className="welcome-blob welcome-blob--left" />
      <div className="welcome-blob welcome-blob--right" />

      {/* Navbar */}
      <nav className="welcome-nav">
        <div className="welcome-nav-brand">
          <img src="/favicon.svg" alt="CommitMatch logo" className="welcome-nav-logo" />
          <span className="welcome-nav-name">CommitMatch</span>
        </div>
        <div className="welcome-nav-links">
          <a href="#features" className="welcome-nav-link">Features</a>
          <a href="#about" className="welcome-nav-link">About</a>
          <button className="welcome-nav-signin" onClick={() => navigate('/login')}>Sign in</button>
        </div>
      </nav>

      {/* Hero */}
      <main className="welcome-hero">
        <div className="welcome-badge">
          <span className="welcome-badge-dot" />
          CRISIS VOLUNTEER OS — V1.0
        </div>

        <h1 className="welcome-headline">
          Match Volunteers to<br />
          <span className="welcome-headline-gradient">
            {displayText}
            <span className="welcome-cursor">|</span>
          </span>
        </h1>

        <p className="welcome-subtext">
          CommitMatch intelligently connects the right volunteers to urgent community<br />
          needs in real time — faster response, better outcomes.
        </p>

        <div className="welcome-actions">
          <button
            id="get-started-btn"
            className="welcome-btn-primary"
            onClick={() => navigate('/login')}
          >
            Get Started
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="welcome-stats">
          <div className="welcome-stat">
            <span className="welcome-stat-value">1,200+</span>
            <span className="welcome-stat-label">active needs</span>
          </div>
          <div className="welcome-stat-divider" />
          <div className="welcome-stat">
            <span className="welcome-stat-value">500+</span>
            <span className="welcome-stat-label">volunteers ready</span>
          </div>
          <div className="welcome-stat-divider" />
          <div className="welcome-stat">
            <span className="welcome-stat-value">4.9★</span>
            <span className="welcome-stat-label">response rating</span>
          </div>
        </div>
      </main>
    </div>
  );
}
