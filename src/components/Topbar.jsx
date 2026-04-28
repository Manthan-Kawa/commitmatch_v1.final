import React, { useState } from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import NotificationDrawer from './NotificationDrawer';
import './Topbar.css';

export default function Topbar({ onToggleSidebar, isSidebarExpanded, onOpenProfileCard }) {
  const location = useLocation();
  const { notifications, removeNotification } = useNotifications();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  let pageName = 'Dashboard';
  if (location.pathname === '/tasks') pageName = 'Task Tracker';
  else if (location.pathname === '/volunteers') pageName = 'Volunteer Management';
  else if (location.pathname === '/dashboard') pageName = 'Needs Queue';

  const hasNotifications = notifications.length > 0;

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <button className="hamburger-btn" onClick={onToggleSidebar}>
            <Menu size={24} />
          </button>
          <div className="breadcrumb">
            {pageName}
          </div>
        </div>
        <div className="topbar-actions">

          <button className="icon-btn bell-icon" onClick={() => setIsDrawerOpen(true)}>
            <Bell size={20} />
            {hasNotifications && <span className="notification-dot"></span>}
          </button>
          <button className="avatar-btn" onClick={onOpenProfileCard}>
            <div className="avatar-icon">O</div>
          </button>
        </div>
      </header>

      <NotificationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        notifications={notifications}
        onDeleteNotification={removeNotification}
      />
    </>
  );
}
