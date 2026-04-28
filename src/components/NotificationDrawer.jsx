import React, { useState } from 'react';
import { X } from 'lucide-react';
import NotificationCard from './NotificationCard';
import './NotificationDrawer.css';

export default function NotificationDrawer({ isOpen, onClose, notifications, onDeleteNotification }) {
  const [openDeleteId, setOpenDeleteId] = useState(null);

  const handleContentClick = (e) => {
    // Close delete view if clicking on empty space (not on a notification card)
    if (e.target === e.currentTarget) {
      setOpenDeleteId(null);
    }
  };

  return (
    <>
      {isOpen && <div className="notification-overlay" onClick={onClose} />}
      <div className={`notification-drawer ${isOpen ? 'is-open' : ''}`}>
        <div className="notification-drawer-header">
          <h2 className="notification-drawer-title">Notifications</h2>
          <button className="notification-drawer-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="notification-drawer-content" onClick={handleContentClick}>
          {notifications.length === 0 ? (
            <div className="notification-empty">
              <div className="notification-empty-icon">🔔</div>
              <p className="notification-empty-text">No notifications yet</p>
            </div>
          ) : (
            <div className="notification-list">
              {notifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onDelete={onDeleteNotification}
                  isDeleting={openDeleteId === notification.id}
                  onToggleDelete={(id) => setOpenDeleteId(openDeleteId === id ? null : id)}
                  onCloseDelete={() => setOpenDeleteId(null)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
