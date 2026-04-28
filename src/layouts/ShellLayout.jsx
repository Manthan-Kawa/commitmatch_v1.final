import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import ProfileCard from '../components/ProfileCard';

export default function ShellLayout() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isProfileCardOpen, setIsProfileCardOpen] = useState(false);
  const location = useLocation();

  // Close sidebar overlay on navigation
  useEffect(() => {
    setIsSidebarExpanded(false);
    setIsProfileCardOpen(false);
  }, [location.pathname]);

  return (
    <div className={`app-shell ${isSidebarExpanded ? 'sidebar-expanded' : ''}`}>
      <Sidebar isExpanded={isSidebarExpanded} onClose={() => setIsSidebarExpanded(false)} />
      <div className="main-content">
        <Topbar 
          onToggleSidebar={() => setIsSidebarExpanded(!isSidebarExpanded)} 
          isSidebarExpanded={isSidebarExpanded}
          onOpenProfileCard={() => setIsProfileCardOpen(true)}
        />
        <main className="screen-content">
          <Outlet />
        </main>
      </div>
      {isSidebarExpanded && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarExpanded(false)}></div>
      )}
      <ProfileCard 
        isOpen={isProfileCardOpen} 
        onClose={() => setIsProfileCardOpen(false)} 
      />
    </div>
  );
}
