import React from 'react';
import { NavLink } from 'react-router-dom';
import { ListTodo, ClipboardList, Users, X } from 'lucide-react';

export default function Sidebar({ isExpanded, onClose }) {

  return (
    <aside className={`sidebar ${isExpanded ? 'is-expanded' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img
            src="/favicon.svg"
            alt="CommitMatch logo"
            style={{ width: 32, height: 32, borderRadius: 4, objectFit: 'contain' }}
          />
          <span style={{ color: 'white' }}>CommitMatch</span>
        </div>
        <button className="mobile-close-btn" onClick={onClose}>
          <X size={24} />
        </button>
      </div>

      <nav className="nav-menu">
        <NavLink to="/dashboard" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <div className="nav-icon"><ClipboardList size={20} /></div>
          <span className="nav-label">Needs Queue</span>
        </NavLink>
        <NavLink to="/tasks" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <div className="nav-icon"><ListTodo size={20} /></div>
          <span className="nav-label">Task Tracker</span>
        </NavLink>
        <NavLink to="/volunteers" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <div className="nav-icon"><Users size={20} /></div>
          <span className="nav-label">Volunteers</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="user-avatar">O</div>
          <div className="org-info">
            <span className="user-name" style={{ color: 'white' }}>Olivia Admin</span>
            <span className="org-name">Global Crisis Relief</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
