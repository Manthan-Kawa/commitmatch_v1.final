import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { Loader2 } from 'lucide-react';
import './IntakeForm.css';

export default function IntakeForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const devState = searchParams.get('formstate');

  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [website, setWebsite] = useState(''); // Honeypot

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [validationError, setValidationError] = useState(false);

  const descRef = useRef(null);

  const charCount = description.length;
  const isDescValid = charCount >= 80;

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check honeypot
    if (website) {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSuccess(true);
      }, 1200);
      return;
    }

    if (!isDescValid) {
      setValidationError(true);
      if (descRef.current) descRef.current.focus();
      return;
    }

    setValidationError(false);
    setHasError(false);
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      if (devState === 'error') {
        setHasError(true);
      } else {
        // Create new need and save to localStorage
        const newNeed = {
          id: 'need_' + Date.now(),
          rawText: description,
          parsed: {
            category: 'Other',
            location: { raw: location, lat: 19.0422, lng: 72.8558 },
            skillsRequired: [],
            affectedCount: 1,
            urgencySignals: []
          },
          urgencyScore: 30,
          urgencyLevel: 'p2',
          status: 'UNASSIGNED',
          reportedBy: { name: name || 'Anonymous', phone: contact || '' },
          reportedAt: new Date().toISOString(),
          channel: 'app',
          assignedVolunteerId: null,
          taskId: null,
          justAdded: true
        };
        
        // Save to localStorage
        const existingNeeds = localStorage.getItem('needs');
        const needs = existingNeeds ? JSON.parse(existingNeeds) : [];
        localStorage.setItem('needs', JSON.stringify([newNeed, ...needs]));
        
        // Add notification
        addNotification({
          title: 'Need Submitted Successfully',
          message: `Your need has been posted: "${description.substring(0, 40)}..."`,
          icon: '📝',
          color: '#6366f1',
          type: 'need_submitted'
        });
        
        setIsSuccess(true);
        // Auto-redirect after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      }
    }, 1200);
  };

  const handleReset = () => {
    setDescription('');
    setLocation('');
    setName('');
    setContact('');
    setWebsite('');
    setIsSuccess(false);
    setHasError(false);
    setValidationError(false);
  };

  return (
    <div className="intake-page">
      <div className="intake-logo">CommitMatch</div>
      <h1 className="intake-heading">Report a Community Need</h1>
      <p className="intake-subheading">
        Your report helps us connect the right volunteer to someone who needs help.
      </p>

      <div className="intake-card">
        {isSuccess ? (
          <div className="intake-success">
            <div className="success-icon-container">
              <svg viewBox="0 0 64 64" className="success-svg">
                <circle className="success-circle" cx="32" cy="32" r="28" fill="none" />
                <path className="success-check" d="M 20 32 L 28 40 L 44 24" fill="none" />
              </svg>
            </div>
            <h2 className="success-heading">Thank you!</h2>
            <p className="success-subtext">
              Your report has been received. We'll work on connecting a volunteer as soon as possible.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="reset-link" onClick={handleReset}>
                Submit another report
              </button>
              <button className="reset-link dashboard-link" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <form className="intake-form" onSubmit={handleSubmit}>
            {hasError && (
              <div className="network-error-banner">
                Something went wrong. Please try again.
              </div>
            )}

            {/* HONEYPOT */}
            <div className="honeypot-container">
              <label htmlFor="website">Website</label>
              <input 
                type="text" 
                id="website" 
                name="website" 
                tabIndex="-1" 
                autoComplete="off"
                value={website}
                onChange={e => setWebsite(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="description">What do you need help with? <span className="req">*</span></label>
              <textarea 
                id="description"
                ref={descRef}
                className={`intake-input intake-textarea ${validationError ? 'input-error' : ''}`}
                placeholder="Describe the situation in detail — who needs help, what kind of help, how urgent it is..."
                value={description}
                onChange={e => {
                  setDescription(e.target.value);
                  if (e.target.value.length >= 80) setValidationError(false);
                }}
                disabled={isSubmitting}
              />
              <div className="desc-footer">
                {validationError && (
                  <div className="validation-error-msg">Please describe the need in at least 80 characters</div>
                )}
                <div className={`char-counter ${isDescValid ? 'counter-valid' : ''}`}>
                  {isDescValid ? `${charCount} / 80 ✓` : `${charCount} / 80 minimum`}
                </div>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="location">Location</label>
              <input 
                type="text" 
                id="location"
                className="intake-input"
                placeholder="Street, area, or landmark"
                value={location}
                onChange={e => setLocation(e.target.value)}
                disabled={isSubmitting}
              />
              <div className="field-helper">Helps us match a nearby volunteer</div>
            </div>

            <div className="form-field">
              <label htmlFor="name">Your Name</label>
              <input 
                type="text" 
                id="name"
                className="intake-input"
                placeholder="How should we address you?"
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="form-field">
              <label htmlFor="contact">Phone or Email</label>
              <input 
                type="text" 
                id="contact"
                className="intake-input"
                placeholder="So we can follow up if needed"
                value={contact}
                onChange={e => setContact(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <button 
              type="submit" 
              className="submit-btn" 
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={16} color="white" /> : "Submit Report"}
            </button>
          </form>
        )}
      </div>

      <div className="intake-footer">
        Your information is kept private and only shared with matched volunteers.
      </div>
    </div>
  );
}
