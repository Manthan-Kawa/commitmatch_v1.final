import React, { useState, useRef, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import './NotificationCard.css';

export default function NotificationCard({ notification, onDelete, isDeleting, onToggleDelete, onCloseDelete }) {
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef(null);
  const contentRef = useRef(null);

  // Touch events
  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    
    // Calculate new position based on whether delete is showing
    const baseOffset = isDeleting ? -100 : 0;
    let newTranslateX = baseOffset + diff;
    
    // Constrain between -100 and 0
    newTranslateX = Math.max(Math.min(newTranslateX, 0), -100);
    setTranslateX(newTranslateX);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    finalizeDrag();
  };

  // Mouse events (desktop)
  const handleMouseDown = (e) => {
    // Don't start drag if clicking the delete button
    if (e.target.closest('.notification-delete-btn')) {
      return;
    }
    setStartX(e.clientX);
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const currentX = e.clientX;
    const diff = currentX - startX;
    
    // Calculate new position based on whether delete is showing
    const baseOffset = isDeleting ? -100 : 0;
    let newTranslateX = baseOffset + diff;
    
    // Constrain between -100 and 0
    newTranslateX = Math.max(Math.min(newTranslateX, 0), -100);
    setTranslateX(newTranslateX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    finalizeDrag();
  };

  const finalizeDrag = () => {
    // Determine threshold based on current state
    if (isDeleting) {
      // Already showing delete - check if user swiped enough to the right to close
      if (translateX > -50) {
        onCloseDelete();
        setTranslateX(0);
      } else {
        // Snap back to fully open delete view
        setTranslateX(-100);
      }
    } else {
      // Not showing delete - check if user swiped enough to the left to open
      if (translateX < -50) {
        onToggleDelete(notification.id);
        setTranslateX(-100);
      } else {
        // Snap back to closed position
        setTranslateX(0);
      }
    }
  };

  // Click handler - toggle delete view
  const handleContentClick = (e) => {
    // Don't toggle if clicking the delete button
    if (e.target.closest('.notification-delete-btn')) {
      return;
    }
    
    if (isDeleting) {
      // Close delete view
      onCloseDelete();
      setTranslateX(0);
    } else {
      // Open delete view
      onToggleDelete(notification.id);
      setTranslateX(-100);
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, translateX, isDeleting]);

  useEffect(() => {
    // Reset translateX when isDeleting changes from parent
    if (!isDeleting) {
      setTranslateX(0);
    } else {
      setTranslateX(-100);
    }
  }, [isDeleting]);

  const handleDelete = () => {
    cardRef.current?.classList.add('deleting');
    setTimeout(() => {
      onDelete(notification.id);
    }, 300);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div
      ref={cardRef}
      className="notification-card"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onClick={handleContentClick}
    >
      <div
        ref={contentRef}
        className={`notification-card-content ${isDeleting ? 'show-delete' : ''}`}
        style={{ 
          transform: `translateX(${translateX}px)`,
          cursor: isDeleting ? 'pointer' : 'grab'
        }}
      >
        <div className="notification-card-main">
          <div className="notification-icon" style={{ background: notification.color || '#667eea' }}>
            {notification.icon}
          </div>
          <div className="notification-details">
            <h4 className="notification-title">{notification.title}</h4>
            <p className="notification-message">{notification.message}</p>
            <span className="notification-time">{formatTime(notification.timestamp)}</span>
          </div>
        </div>
      </div>

      {isDeleting && (
        <div className="notification-delete-section">
          <button
            className="notification-delete-btn"
            onClick={handleDelete}
            title="Delete notification"
          >
            <Trash2 size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
