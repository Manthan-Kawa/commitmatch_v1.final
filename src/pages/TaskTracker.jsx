import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { Clock, Loader2, Star, ChevronDown, Copy, User, MapPin } from 'lucide-react';
import UrgencyBadge from '../components/UrgencyBadge';
import Button from '../components/Button';
import './TaskTracker.css';

const MOCK_TASKS = [
  {
    id: "task_01",
    status: "DISPATCHED",
    urgencyLevel: "p0",
    needSummary: "Elderly woman needs food assistance, lives alone",
    volunteerName: "Rahul Sharma",
    location: "Dharavi Sector 4",
    dispatchedAt: new Date(Date.now() - 6 * 60000).toISOString(),
    escalationDeadline: new Date(Date.now() + 14 * 60000).toISOString(),
    phone: "+919123456789",
  },
  {
    id: "task_02",
    status: "DISPATCHED",
    urgencyLevel: "p1",
    needSummary: "Family of 4 requires medical supply delivery",
    volunteerName: "Priya Nair",
    location: "Kurla West",
    dispatchedAt: new Date(Date.now() - 2 * 60000).toISOString(),
    escalationDeadline: new Date(Date.now() + 18 * 60000).toISOString(),
    phone: "+919876543210",
  },
  {
    id: "task_03",
    status: "IN_PROGRESS",
    urgencyLevel: "p1",
    needSummary: "Transport needed for hospital visit, elderly patient",
    volunteerName: "Amir Khan",
    location: "Bandra East",
    dispatchedAt: new Date(Date.now() - 45 * 60000).toISOString(),
    respondedAt: new Date(Date.now() - 40 * 60000).toISOString(),
    phone: "+919765432109",
  },
  {
    id: "task_04",
    status: "IN_PROGRESS",
    urgencyLevel: "p2",
    needSummary: "Child safety concern reported by neighbor",
    volunteerName: "Sunita Rao",
    location: "Andheri North",
    dispatchedAt: new Date(Date.now() - 120 * 60000).toISOString(),
    respondedAt: new Date(Date.now() - 115 * 60000).toISOString(),
    phone: "+919654321098",
  },
  {
    id: "task_05",
    status: "COMPLETED",
    urgencyLevel: "p0",
    needSummary: "Emergency food delivery to bedridden senior",
    volunteerName: "Rahul Sharma",
    location: "Dharavi Sector 2",
    dispatchedAt: new Date(Date.now() - 240 * 60000).toISOString(),
    respondedAt: new Date(Date.now() - 230 * 60000).toISOString(),
    completedAt: new Date(Date.now() - 200 * 60000).toISOString(),
    resolutionTime: "40 minutes",
    rating: null,
    phone: "+919123456789",
  },
  {
    id: "task_06",
    status: "COMPLETED",
    urgencyLevel: "p2",
    needSummary: "Translation assistance for non-English speaking family",
    volunteerName: "Priya Nair",
    location: "Dharavi Main Road",
    dispatchedAt: new Date(Date.now() - 360 * 60000).toISOString(),
    respondedAt: new Date(Date.now() - 355 * 60000).toISOString(),
    completedAt: new Date(Date.now() - 310 * 60000).toISOString(),
    resolutionTime: "45 minutes",
    rating: 4,
    phone: "+919876543210",
  }
];

function formatTimeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (diff < 60) return `${Math.max(0, diff)} min ago`;
  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  return `${hours}h ${mins}m`;
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function TaskTracker() {
  const [searchParams] = useSearchParams();
  const { addNotification } = useNotifications();
  const devState = searchParams.get('kanbanstate');

  // Initialize tasks from localStorage or use MOCK_TASKS
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : MOCK_TASKS;
  });
  
  // Check for newly assigned tasks and show notifications
  useEffect(() => {
    tasks.forEach((task) => {
      if (task.justAssigned) {
        const icon = task.urgencyLevel === 'p0' ? '⚠️' : '📋';
        const color = task.urgencyLevel === 'p0' ? '#ef4444' : '#8b5cf6';
        
        addNotification({
          title: 'Task Assigned',
          message: `${task.volunteerName} assigned: ${task.needSummary.substring(0, 40)}...`,
          icon: icon,
          color: color,
          type: 'task',
          taskId: task.id
        });
        
        task.justAssigned = false;
      }
    });
  }, [tasks, addNotification]);
  
  // Persist tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);
  
  // Listen for storage changes from other components
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'tasks' && e.newValue) {
        setTasks(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  // Listen for focus events to sync tasks from localStorage
  useEffect(() => {
    const handleFocus = () => {
      const updated = localStorage.getItem('tasks');
      if (updated) {
        setTasks(JSON.parse(updated));
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);
  
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [volunteerFilter, setVolunteerFilter] = useState('');
  
  const [lastUpdatedSecs, setLastUpdatedSecs] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [toastMessage, setToastMessage] = useState(null);

  // Derive unique volunteers
  const uniqueVolunteers = useMemo(() => {
    const set = new Set();
    tasks.forEach(t => set.add(t.volunteerName));
    return Array.from(set).sort();
  }, [tasks]);

  // Filter tasks
  const visibleTasks = useMemo(() => {
    if (devState === 'empty') return [];
    if (devState === 'loading') return [];
    if (!volunteerFilter) return tasks;
    return tasks.filter(t => t.volunteerName === volunteerFilter);
  }, [tasks, volunteerFilter, devState]);

  const columns = {
    DISPATCHED: visibleTasks.filter(t => t.status === 'DISPATCHED'),
    IN_PROGRESS: visibleTasks.filter(t => t.status === 'IN_PROGRESS'),
    COMPLETED: visibleTasks.filter(t => t.status === 'COMPLETED'),
  };

  // Auto-refresh simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdatedSecs(prev => {
        if (prev >= 29) {
          setIsRefreshing(true);
          setTimeout(() => {
            setIsRefreshing(false);
            setLastUpdatedSecs(0);
          }, 800);
          return 30; // hold at 30 until refresh finishes
        }
        return isRefreshing ? prev : prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRefreshing]);

  const [isToastExiting, setIsToastExiting] = useState(false);

  // Handle Toast timeout
  useEffect(() => {
    if (toastMessage) {
      setIsToastExiting(false);
      const exitTimer = setTimeout(() => setIsToastExiting(true), 1300);
      const removeTimer = setTimeout(() => setToastMessage(null), 1500);
      return () => {
        clearTimeout(exitTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [toastMessage]);

  const toggleExpand = (id) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleContact = (e, phone) => {
    e.stopPropagation();
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      window.location.href = `tel:${phone}`;
    } else {
      navigator.clipboard.writeText(phone).then(() => {
        setToastMessage("Contact copied");
      });
    }
  };

  const handleRating = (e, id, ratingValue) => {
    e.stopPropagation();
    console.log("Rating:", ratingValue);
    setTasks(prev => prev.map(t => t.id === id ? { ...t, rating: ratingValue } : t));
  };

  const handleStatusUpdate = (taskId, newStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    let notificationTitle = '';
    let notificationMessage = '';
    let icon = '';
    let color = '#8b5cf6';

    if (newStatus === 'IN_PROGRESS') {
      notificationTitle = 'Volunteer Reached Location';
      notificationMessage = `${task.volunteerName} has reached the location for: ${task.needSummary.substring(0, 40)}...`;
      icon = '📍';
    } else if (newStatus === 'COMPLETED') {
      notificationTitle = 'Task Completed';
      notificationMessage = `${task.volunteerName} has completed: ${task.needSummary.substring(0, 40)}...`;
      icon = '✅';
      color = '#10b981';
    }

    // Add notification
    if (notificationTitle) {
      addNotification({
        title: notificationTitle,
        message: notificationMessage,
        icon: icon,
        color: color,
        type: 'task',
        taskId: taskId
      });
    }

    // Update task status
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updated = { ...t, status: newStatus };
        
        if (newStatus === 'IN_PROGRESS' && !t.respondedAt) {
          updated.respondedAt = new Date().toISOString();
        } else if (newStatus === 'COMPLETED' && !t.completedAt) {
          updated.completedAt = new Date().toISOString();
          const dispatchedTime = new Date(t.dispatchedAt);
          const completedTime = new Date(updated.completedAt);
          const diffMs = completedTime - dispatchedTime;
          const diffMins = Math.floor(diffMs / 60000);
          updated.resolutionTime = `${diffMins} minutes`;
        }
        
        return updated;
      }
      return t;
    }));

    setToastMessage(`Task moved to ${newStatus === 'IN_PROGRESS' ? 'In Progress' : 'Completed'}`);
  };

  const [activeTab, setActiveTab] = useState('DISPATCHED');

  const isLoading = devState === 'loading';

  return (
    <div className="task-tracker-page">
      {toastMessage && (
        <div className={`success-toast toast ${isToastExiting ? 'exiting' : ''}`}>
          <span className="success-toast-text">{toastMessage}</span>
        </div>
      )}

      {/* Sub-header for Kanban tools */}
      <div className="kanban-tools">
        <div className="kanban-filters">
          <select 
            className="kanban-dropdown" 
            value={volunteerFilter} 
            onChange={(e) => setVolunteerFilter(e.target.value)}
          >
            <option value="">Filter by volunteer (All)</option>
            {uniqueVolunteers.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>

          <select className="kanban-dropdown">
            <option value="">Filter by date range</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
          </select>
        </div>
        
        <div className="kanban-refresh">
          {isRefreshing ? (
            <span className="refreshing-text">Refreshing<span className="dots-anim">...</span></span>
          ) : (
            <span>Last updated {lastUpdatedSecs}s ago</span>
          )}
        </div>
      </div>

      <div className="kanban-mobile-tabs">
        <button className={`kanban-tab ${activeTab === 'DISPATCHED' ? 'active' : ''}`} onClick={() => setActiveTab('DISPATCHED')}>Dispatched</button>
        <button className={`kanban-tab ${activeTab === 'IN_PROGRESS' ? 'active' : ''}`} onClick={() => setActiveTab('IN_PROGRESS')}>In Progress</button>
        <button className={`kanban-tab ${activeTab === 'COMPLETED' ? 'active' : ''}`} onClick={() => setActiveTab('COMPLETED')}>Completed</button>
      </div>

      <div className="kanban-board">
        {/* DISPATCHED COLUMN */}
        <div className={`kanban-col dispatched ${activeTab === 'DISPATCHED' ? 'mobile-active' : ''}`}>
          <div className="kanban-col-header">
            <span className="col-title">DISPATCHED</span>
            <span className="col-badge">{isLoading ? 0 : columns.DISPATCHED.length}</span>
          </div>
          <div className="kanban-col-body">
            {isLoading ? <LoadingSkeletons /> : columns.DISPATCHED.length === 0 ? <EmptyCol /> : 
              columns.DISPATCHED.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  expanded={expandedCards.has(task.id)}
                  onToggle={() => toggleExpand(task.id)}
                  onContact={(e) => handleContact(e, task.phone)}
                  onStatusUpdate={handleStatusUpdate}
                />
              ))
            }
          </div>
        </div>

        {/* IN PROGRESS COLUMN */}
        <div className={`kanban-col in-progress ${activeTab === 'IN_PROGRESS' ? 'mobile-active' : ''}`}>
          <div className="kanban-col-header">
            <span className="col-title">IN PROGRESS</span>
            <span className="col-badge">{isLoading ? 0 : columns.IN_PROGRESS.length}</span>
          </div>
          <div className="kanban-col-body">
            {isLoading ? <LoadingSkeletons /> : columns.IN_PROGRESS.length === 0 ? <EmptyCol /> : 
              columns.IN_PROGRESS.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  expanded={expandedCards.has(task.id)}
                  onToggle={() => toggleExpand(task.id)}
                  onContact={(e) => handleContact(e, task.phone)}
                  onStatusUpdate={handleStatusUpdate}
                />
              ))
            }
          </div>
        </div>

        {/* COMPLETED COLUMN */}
        <div className={`kanban-col completed ${activeTab === 'COMPLETED' ? 'mobile-active' : ''}`}>
          <div className="kanban-col-header">
            <span className="col-title">COMPLETED</span>
            <span className="col-badge">{isLoading ? 0 : columns.COMPLETED.length}</span>
          </div>
          <div className="kanban-col-body">
            {isLoading ? <LoadingSkeletons /> : columns.COMPLETED.length === 0 ? <EmptyCol /> : 
              columns.COMPLETED.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  expanded={expandedCards.has(task.id)}
                  onToggle={() => toggleExpand(task.id)}
                  onContact={(e) => handleContact(e, task.phone)}
                  onRate={handleRating}
                />
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskCard({ task, expanded, onToggle, onContact, onRate, onStatusUpdate }) {
  const isCompleted = task.status === 'COMPLETED';
  
  const handleReached = (e) => {
    e.stopPropagation();
    onStatusUpdate(task.id, 'IN_PROGRESS');
  };

  const handleCompleted = (e) => {
    e.stopPropagation();
    onStatusUpdate(task.id, 'COMPLETED');
  };
  
  return (
    <div 
      className={`task-card ${isCompleted ? 'card-completed' : ''} ${expanded ? 'card-expanded' : ''}`}
      onClick={onToggle}
    >
      <div className="card-row-1">
        <span className="card-urgency-text">{
          task.urgencyLevel === 'p0' ? 'P0 Critical' : 
          task.urgencyLevel === 'p1' ? 'P1 High' : 
          task.urgencyLevel === 'p2' ? 'P2 Medium' : 'P3 Low'
        }</span>
        <span className="card-elapsed">{formatTimeAgo(task.dispatchedAt)}</span>
      </div>

      <div className={`card-row-2 ${expanded ? 'expanded-desc' : 'truncate-desc'}`}>
        {task.needSummary}
      </div>

      <div className="card-row-3">
        <div className="vol-meta-item">
          <User size={14} className="vol-meta-icon" />
          <span className="card-volunteer">{task.volunteerName}</span>
        </div>
        <div className="vol-meta-item">
          <MapPin size={14} className="vol-meta-icon loc-icon" />
          <span className="card-location">{task.location}</span>
        </div>
      </div>

      <div className="card-row-4">
        <span className="card-dispatched">Dispatched: {formatTime(task.dispatchedAt)}</span>
        <button className="contact-link" onClick={(e) => { e.stopPropagation(); onContact(e); }}>
          Contact
        </button>
      </div>

      {task.status === 'DISPATCHED' && (
        <div className="card-action-row">
          <EscalationTimer deadline={task.escalationDeadline} />
          <button className="action-btn reached-btn" onClick={handleReached}>
            Reached
          </button>
        </div>
      )}

      {task.status === 'IN_PROGRESS' && (
        <div className="card-action-row">
          <button className="action-btn completed-btn" onClick={handleCompleted}>
            Completed
          </button>
        </div>
      )}

      {isCompleted && (
        <div className="card-completed-meta">
          <div className="card-resolution">Resolved in {task.resolutionTime}</div>
          <StarRating rating={task.rating} onRate={(e, val) => onRate(e, task.id, val)} />
        </div>
      )}

      {expanded && (
        <div className="card-action-log" onClick={(e) => e.stopPropagation()}>
          <div className="log-title">Action History</div>
          <ul className="log-list">
            <li>Dispatched to {task.volunteerName} at {formatTime(task.dispatchedAt)}</li>
            {task.respondedAt && (
              <li>Volunteer accepted at {formatTime(task.respondedAt)}</li>
            )}
            {task.completedAt && (
              <li>Task completed at {formatTime(task.completedAt)}</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

function EscalationTimer({ deadline }) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const end = new Date(deadline).getTime();
    
    const calculate = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((end - now) / 1000));
      setTimeLeft(diff);
    };
    
    calculate();
    const intv = setInterval(calculate, 1000);
    return () => clearInterval(intv);
  }, [deadline]);

  if (timeLeft === 0) {
    return (
      <div className="escalation-timer timer-frozen">
        <Loader2 className="animate-spin timer-spinner" size={14} />
        <span>Escalating to next volunteer...</span>
      </div>
    );
  }

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const isCritical = timeLeft <= 300; // <= 5:00

  return (
    <div className={`escalation-timer ${isCritical ? 'critical' : 'timer-default'}`}>
      ⏱ Auto-escalate in {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
    </div>
  );
}

function StarRating({ rating, onRate }) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="star-rating" onMouseLeave={() => setHoverRating(0)}>
      {[1, 2, 3, 4, 5].map((idx) => {
        const isFilled = (hoverRating || rating) >= idx;
        return (
          <Star 
            key={idx}
            size={16}
            className={`star-icon ${isFilled ? 'star-filled' : 'star-empty'}`}
            onMouseEnter={() => setHoverRating(idx)}
            onClick={(e) => onRate(e, idx)}
            fill={isFilled ? 'currentColor' : 'none'}
          />
        );
      })}
    </div>
  );
}

function EmptyCol() {
  return <div className="kanban-empty">No tasks</div>;
}

function LoadingSkeletons() {
  return (
    <>
      <div className="skeleton-card">
        <div className="skeleton-block" style={{width: '40px', height: '20px', marginBottom: '12px'}}></div>
        <div className="skeleton-block" style={{width: '100%', height: '14px', marginBottom: '8px'}}></div>
        <div className="skeleton-block" style={{width: '80%', height: '14px', marginBottom: '16px'}}></div>
        <div className="skeleton-block" style={{width: '100%', height: '1px', marginBottom: '12px'}}></div>
        <div className="skeleton-block" style={{width: '60%', height: '14px'}}></div>
      </div>
      <div className="skeleton-card">
        <div className="skeleton-block" style={{width: '40px', height: '20px', marginBottom: '12px'}}></div>
        <div className="skeleton-block" style={{width: '100%', height: '14px', marginBottom: '8px'}}></div>
        <div className="skeleton-block" style={{width: '80%', height: '14px', marginBottom: '16px'}}></div>
        <div className="skeleton-block" style={{width: '100%', height: '1px', marginBottom: '12px'}}></div>
        <div className="skeleton-block" style={{width: '60%', height: '14px'}}></div>
      </div>
    </>
  );
}
