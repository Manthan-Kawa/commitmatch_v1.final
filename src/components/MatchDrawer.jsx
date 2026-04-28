import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, ChevronDown, ChevronUp, Check, CheckCircle, User, List } from 'lucide-react';
import Button from './Button';
import Input from './Input';
import UrgencyBadge from './UrgencyBadge';
import './MatchDrawer.css';

const VOLUNTEER_MOCKS = [
  {
    id: 'vol_1',
    name: "Rahul Sharma",
    distance: "2.4 km",
    matchScore: 84,
    skills: [
      { name: "food_delivery", matched: true },
      { name: "elderly_care", matched: true },
      { name: "transport", matched: false }
    ],
    availability: "available",
    acceptanceRate: "92%"
  },
  {
    id: 'vol_2',
    name: "Priya Nair",
    distance: "3.1 km",
    matchScore: 71,
    skills: [
      { name: "food_delivery", matched: true },
      { name: "first_aid", matched: false }
    ],
    availability: "limited",
    acceptanceRate: "78%"
  },
  {
    id: 'vol_3',
    name: "Amir Khan",
    distance: "4.8 km",
    matchScore: 63,
    skills: [
      { name: "food_delivery", matched: true },
      { name: "transport", matched: false },
      { name: "elderly_care", matched: false }
    ],
    availability: "available",
    acceptanceRate: "85%"
  }
];

export default function MatchDrawer({ isOpen, onClose, need, devState = '', onDispatchClick }) {
  const [isRendered, setIsRendered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const [showOriginal, setShowOriginal] = useState(false);
  const [showOverrideSearch, setShowOverrideSearch] = useState(false);
  const [overrideSearchQuery, setOverrideSearchQuery] = useState('');
  
  // Load volunteers from localStorage and filter for matches
  const [volunteers, setVolunteers] = useState([]);
  
  useEffect(() => {
    if (isOpen && need) {
      const savedVolunteers = localStorage.getItem('volunteers');
      let matched = [];
      
      if (savedVolunteers) {
        const allVolunteers = JSON.parse(savedVolunteers);
        
        // First, try to filter available volunteers with matching skills
        matched = allVolunteers.filter(vol => {
          if (!vol.availability) return false; // Only available volunteers
          const hasMatchingSkill = need.parsed.skillsRequired.some(skill => vol.skills.includes(skill));
          return hasMatchingSkill;
        }).map(vol => ({
          id: vol.id,
          name: vol.name,
          distance: '2.4 km',
          matchScore: Math.round(need.parsed.skillsRequired.filter(s => vol.skills.includes(s)).length / need.parsed.skillsRequired.length * 100),
          skills: need.parsed.skillsRequired.map(s => ({
            name: s,
            matched: vol.skills.includes(s)
          })),
          availability: vol.availability ? 'available' : 'limited',
          acceptanceRate: Math.round(vol.acceptanceRate * 100) + '%'
        }));
        
        // If no skill matches found, show available volunteers without skill requirement (up to 3)
        if (matched.length === 0) {
          matched = allVolunteers
            .filter(vol => vol.availability) // Only available volunteers
            .slice(0, 3) // Get first 3 available
            .map(vol => ({
              id: vol.id,
              name: vol.name,
              distance: '2.4 km',
              matchScore: Math.round(need.parsed.skillsRequired.filter(s => vol.skills.includes(s)).length / need.parsed.skillsRequired.length * 100),
              skills: need.parsed.skillsRequired.map(s => ({
                name: s,
                matched: vol.skills.includes(s)
              })),
              availability: vol.availability ? 'available' : 'limited',
              acceptanceRate: Math.round(vol.acceptanceRate * 100) + '%'
            }));
        }
      }
      
      setVolunteers(matched);
    }
  }, [isOpen, need]);
  
  // Mount / Unmount animation logic
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      requestAnimationFrame(() => setIsAnimating(true));
      
      setShowOriginal(false);
      setShowOverrideSearch(false);
      setOverrideSearchQuery('');
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsRendered(false), 180);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Escape key to close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // If devState enforces override search
  useEffect(() => {
    if (devState === 'override_search' && isOpen) {
      setShowOverrideSearch(true);
    }
  }, [devState, isOpen]);

  const [touchStart, setTouchStart] = useState(null);
  const [touchCurrent, setTouchCurrent] = useState(null);

  if (!isRendered && !isOpen) return null;

  const isLoading = devState === 'loading';
  const isPartial = devState === 'partial';
  const isEmpty = devState === 'empty';

  // Use filtered volunteers from localStorage, or apply dev state overrides
  let displayVolunteers = [...volunteers];
  if (isPartial && displayVolunteers.length > 1) displayVolunteers = displayVolunteers.slice(0, 1);
  if (isEmpty) displayVolunteers = [];

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e) => {
    setTouchCurrent(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (touchStart && touchCurrent && touchCurrent - touchStart > 80) {
      onClose();
    }
    setTouchStart(null);
    setTouchCurrent(null);
  };

  const drawerClass = isAnimating ? 'drawer-open' : 'drawer-closed';
  
  return createPortal(
    <div className={`match-drawer-container ${drawerClass}`}>
      {/* Overlay */}
      <div className="drawer-overlay" onClick={onClose}></div>

      {/* Drawer Panel */}
      <div 
        className="drawer-panel"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="drawer-handle">
          <div className="handle-pill"></div>
        </div>
        <div className="drawer-header">
          <button className="drawer-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
          <h3 className="drawer-title">Match Suggestions</h3>
        </div>

        <div className="drawer-body">
          {/* Need Summary Card */}
          <div className="need-summary-card">
            {isLoading ? (
              <div className="skeleton-summary">
                <div className="skeleton-block" style={{width: '30%', height: '20px', marginBottom: '8px'}}></div>
                <div className="skeleton-block" style={{width: '100%', height: '14px', marginBottom: '16px'}}></div>
                <div className="skeleton-block" style={{width: '100%', height: '40px'}}></div>
              </div>
            ) : need ? (
              <>
                <div className="summary-top-row">
                  <UrgencyBadge level={need.urgencyLevel} />
                  <div className="summary-category">
                    {/* Simplified category icon */}
                    <div className="summary-category-icon"><List size={14}/></div>
                    {need.parsed.category}
                  </div>
                </div>
                <div className="summary-desc">{need.rawText}</div>
                
                <div className="summary-grid">
                  <div className="summary-field">
                    <span className="field-label">Location</span>
                    <span className="field-value">{need.parsed.location.raw}</span>
                  </div>
                  <div className="summary-field">
                    <span className="field-label">Required Skills</span>
                    <span className="field-value">{need.parsed.skillsRequired.map(s => s.replace('_', ' ')).join(', ')}</span>
                  </div>
                  <div className="summary-field">
                    <span className="field-label">Affected Count</span>
                    <span className="field-value">{need.parsed.affectedCount}</span>
                  </div>
                  <div className="summary-field">
                    <span className="field-label">Reported By</span>
                    <span className="field-value">{need.reportedBy.name}</span>
                  </div>
                  <div className="summary-field">
                    <span className="field-label">Reported At</span>
                    <span className="field-value">{new Date(need.reportedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                </div>

                <div className="section-label original-report-toggle" onClick={() => setShowOriginal(!showOriginal)} style={{cursor: 'pointer', padding: '0 0 8px 0', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '4px', borderBottom: 'none'}}>
                  ORIGINAL REPORT {showOriginal ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                </div>
                {showOriginal && (
                  <div className="original-message-block" style={{fontStyle: 'italic', backgroundColor: '#0B1120', padding: '12px', color: '#94A3B8', borderRadius: '6px', border: '1px solid #1E293B', marginTop: '4px'}}>
                    "{need.rawText}"
                  </div>
                )}
              </>
            ) : (
              <div className="summary-desc">No need selected.</div>
            )}
          </div>

          <div className="section-label">Top Matches</div>

          <div className="volunteer-list">
            {isLoading ? (
               Array.from({length: 3}).map((_, i) => (
                 <div key={i} className="volunteer-card skeleton-volunteer">
                   <div className="skeleton-block" style={{width: '100%', height: '40px', marginBottom: '12px'}}></div>
                   <div className="skeleton-block" style={{width: '100%', height: '16px', marginBottom: '12px'}}></div>
                   <div className="skeleton-block" style={{width: '100%', height: '36px'}}></div>
                 </div>
               ))
            ) : volunteers.length === 0 ? (
              <div className="no-matches-msg">
                <p style={{marginBottom: '16px', color: 'var(--text-secondary)', fontSize: '14px'}}>No volunteers currently available.</p>
                <Button variant="secondary" onClick={() => setShowOverrideSearch(true)}>Search manually</Button>
              </div>
            ) : (
              <>
                {displayVolunteers.map((vol, idx) => {
                  const isBestMatch = idx === 0 && displayVolunteers.length > 1;
                  
                  return (
                    <div key={vol.id} className={`volunteer-card ${isBestMatch ? 'best-match' : ''}`}>
                      {isBestMatch && <div className="best-match-badge">Best Match</div>}
                      
                      <div className="vol-row-1">
                        <div className="vol-avatar">{vol.name.split(' ').map(n=>n[0]).join('')}</div>
                        <div className="vol-name">{vol.name}</div>
                        <div className="vol-distance">{vol.distance}</div>
                      </div>
                      
                      <div className="vol-row-2">
                        <div className="match-score-label">Match Score:</div>
                        <div className="match-score-bar-container">
                          <div 
                            className={`match-score-fill ${idx === 0 ? 'best' : idx === 1 ? 'second' : 'third'}`} 
                            style={{ '--score-width': vol.matchScore + '%' }}
                          ></div>
                        </div>
                        <div className="match-score-pct">{vol.matchScore}%</div>
                      </div>

                      <div className="vol-row-3">
                        {vol.skills.map((skill, sIdx) => (
                          <span key={sIdx} className={`vol-skill-pill ${skill.matched ? 'matched' : 'unmatched'}`}>
                            {skill.name.replace('_', ' ')}
                          </span>
                        ))}
                      </div>

                      <div className="vol-row-4">
                        <div className={`availability-dot ${vol.availability}`}></div>
                        <span className="availability-text">
                          {vol.availability === 'available' ? 'Available now' : vol.availability === 'limited' ? 'Limited availability' : 'Unavailable'}
                        </span>
                      </div>

                      <div className="vol-row-5">
                        Acceptance Rate: {vol.acceptanceRate}
                      </div>

                      <div className="vol-divider"></div>

                      <Button 
                        variant={isBestMatch ? "primary" : "ghost"} 
                        className={`btn-dispatch ${isBestMatch ? 'primary' : 'ghost'}`}
                        onClick={() => onDispatchClick && onDispatchClick(vol)}
                      >
                        {isBestMatch ? `Dispatch ${vol.name.split(' ')[0]} →` : `Dispatch ${vol.name.split(' ')[0]}`}
                      </Button>
                    </div>
                  );
                })}
                {isPartial && (
                  <div className="partial-matches-msg">
                    No additional matches available
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="drawer-footer">
          <button className="override-search-btn" onClick={() => setShowOverrideSearch(!showOverrideSearch)}>
            Override or search manually
          </button>
          
          {showOverrideSearch && (
            <div className="override-search-container">
              <Input 
                placeholder="Search volunteers by name or skill..." 
                value={overrideSearchQuery}
                onChange={e => setOverrideSearchQuery(e.target.value)}
              />
              <div className="override-search-results">
                <div className="mock-search-result"><User size={16}/> Sanjay K.</div>
                <div className="mock-search-result"><User size={16}/> Anita M.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
