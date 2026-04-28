import React, { useState } from 'react';
import { X, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ProfileCard.css';

export default function ProfileCard({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [showReset, setShowReset] = useState(false);

  const handleLogout = () => {
    onClose();
    navigate('/');
  };

  const handleResetSettings = () => {
    // Clear all localStorage
    localStorage.clear();
    
    // Close dropdowns
    setShowReset(false);
    onClose();
    
    // Navigate to welcome page
    navigate('/');
  };

  const handleSettingsClick = (e) => {
    e.stopPropagation();
    setShowReset(!showReset);
  };

  return (
    <>
      {isOpen && <div className="profile-card-overlay" onClick={onClose}></div>}
      <div className={`profile-card ${isOpen ? 'is-open' : ''}`}>
        <div className="profile-card-header">
          <div className="profile-header-content">
            <div className="profile-photo">O</div>
            <div className="profile-info">
              <h3 className="profile-name">Olivia Admin</h3>
              <p className="profile-post">Admin</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="profile-card-content">
          <button className="profile-option settings-option" onClick={handleSettingsClick}>
            <Settings size={18} />
            <span>Settings</span>
          </button>

          {showReset && (
            <button 
              className="reset-button"
              onClick={handleResetSettings}
            >
              Reset Local Settings
            </button>
          )}

          <div className="profile-divider"></div>

          <button className="profile-option logout-option" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}
