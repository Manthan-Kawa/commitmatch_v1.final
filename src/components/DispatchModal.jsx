import React, { useState, useEffect, useRef } from 'react';
import { X, Check } from 'lucide-react';
import Button from './Button';
import './DispatchModal.css';

export default function DispatchModal({ 
  isOpen, 
  onClose, 
  onSuccessSequenceComplete, 
  volunteer, 
  need, 
  devState = '' 
}) {
  const [isRendered, setIsRendered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const [note, setNote] = useState('');
  const [status, setStatus] = useState('default'); // default, sending, error, success
  const [showSpinner, setShowSpinner] = useState(false);

  const modalRef = useRef(null);
  const cancelBtnRef = useRef(null);
  const sendBtnRef = useRef(null);
  const xBtnRef = useRef(null);
  const noteRef = useRef(null);

  // Mount/Unmount
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      requestAnimationFrame(() => setIsAnimating(true));
      setNote('');
      
      let initStatus = 'default';
      if (devState === 'sending') initStatus = 'sending';
      if (devState === 'error') initStatus = 'error';
      if (devState === 'success') initStatus = 'success';
      setStatus(initStatus);
      setShowSpinner(initStatus === 'sending');
      
      // Focus cancel button
      setTimeout(() => {
        cancelBtnRef.current?.focus();
      }, 50);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsRendered(false), 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, devState]);

  // Focus trap
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.stopPropagation();
        if (status !== 'sending' && status !== 'success') {
          onClose();
        }
        return;
      }

      if (e.key === 'Tab') {
        const focusableElements = [cancelBtnRef.current, sendBtnRef.current, xBtnRef.current, noteRef.current].filter(Boolean);
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown, true);
    }
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, status, onClose]);

  const handleSend = () => {
    if (devState === 'error') {
      setStatus('sending');
      setTimeout(() => setShowSpinner(true), 150);
      setTimeout(() => {
        setStatus('error');
        setShowSpinner(false);
      }, 1500);
      return;
    }

    setStatus('sending');
    setTimeout(() => {
      if (status !== 'success' && status !== 'error') {
         setShowSpinner(true);
      }
    }, 150);

    setTimeout(() => {
      setShowSpinner(false);
      setStatus('success');
      
      // Save task to localStorage
      if (volunteer && need) {
        const newTask = {
          id: 'task_' + Date.now(),
          status: 'DISPATCHED',
          urgencyLevel: need.urgencyLevel,
          needSummary: need.rawText,
          volunteerName: volunteer.name,
          location: need.parsed.location.raw,
          dispatchedAt: new Date().toISOString(),
          escalationDeadline: new Date(Date.now() + 30 * 60000).toISOString(),
          phone: volunteer.phone || '+91-unknown',
          needId: need.id
        };
        
        // Add task to localStorage
        const existingTasks = localStorage.getItem('tasks');
        const tasks = existingTasks ? JSON.parse(existingTasks) : [];
        localStorage.setItem('tasks', JSON.stringify([newTask, ...tasks]));
        
        // Update volunteer availability to false
        const existingVolunteers = localStorage.getItem('volunteers');
        if (existingVolunteers) {
          const volunteers = JSON.parse(existingVolunteers);
          const updated = volunteers.map(v => 
            v.id === volunteer.id ? { ...v, availability: false } : v
          );
          localStorage.setItem('volunteers', JSON.stringify(updated));
        }
        
        // Update need status to DISPATCHED
        const existingNeeds = localStorage.getItem('needs');
        if (existingNeeds) {
          const needs = JSON.parse(existingNeeds);
          const updated = needs.map(n => 
            n.id === need.id ? { ...n, status: 'DISPATCHED', taskId: newTask.id, assignedVolunteerId: volunteer.id } : n
          );
          localStorage.setItem('needs', JSON.stringify(updated));
        }
      }
      
      setTimeout(() => {
        setIsAnimating(false);
        setTimeout(() => {
          onSuccessSequenceComplete();
        }, 150);
      }, 800);
    }, 1500);
  };

  if (!isRendered && !isOpen) return null;

  const modalClass = isAnimating ? 'modal-open' : 'modal-closed';
  
  const truncatedDesc = need ? need.parsed.category + ' — ' + need.rawText.substring(0, 100) + (need.rawText.length > 100 ? '...' : '') : '';

  return (
    <div className={`dispatch-modal-container ${modalClass}`} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-overlay" aria-hidden="true" onClick={() => status !== 'sending' && status !== 'success' && onClose()}></div>
      
      <div className="modal-content" ref={modalRef}>
        <div className="modal-header">
          <div>
            <h2 id="modal-title" className="modal-title">Confirm Dispatch</h2>
            <div className="modal-subtitle">
              {volunteer?.name} → {need?.rawText?.substring(0, 40)}{need?.rawText?.length > 40 ? '...' : ''}
            </div>
          </div>
          <button 
            ref={xBtnRef}
            className="modal-close-btn" 
            onClick={onClose} 
            aria-label="Close modal"
            disabled={status === 'sending' || status === 'success'}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-preview-box">
          📋 Task Assignment<br/>
          Hi {volunteer?.name}, you've been matched to a community need.<br/><br/>
          Category: {need?.parsed?.category}<br/>
          Location: {need?.parsed?.location?.raw}<br/>
          Details: {truncatedDesc}<br/><br/>
          Reply YES to accept this task<br/>
          Reply NO to decline
        </div>

        <div className="modal-note-section">
          <label className="note-label">Add a note (optional):</label>
          <textarea 
            ref={noteRef}
            className="note-textarea"
            rows="3"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={status === 'sending' || status === 'success'}
          ></textarea>
        </div>

        <div className="modal-footer">
          {status === 'error' && (
            <div className="modal-error-text" style={{position: 'absolute', bottom: 64, right: 24}}>
              Failed to send. Check connection and retry.
            </div>
          )}
          <Button 
            ref={cancelBtnRef}
            variant="ghost" 
            onClick={onClose}
            disabled={status === 'sending' || status === 'success'}
          >
            Cancel
          </Button>
          <Button 
            ref={sendBtnRef}
            variant="primary" 
            onClick={handleSend}
            disabled={status === 'sending' || status === 'success'}
            className="send-dispatch-btn"
          >
            {status === 'success' ? (
              <Check size={20} />
            ) : showSpinner ? (
              <span className="spinner"></span>
            ) : (
              "Send Dispatch →"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
