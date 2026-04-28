import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { 
  List, AlertTriangle, Users, CheckCircle, Search, ChevronDown, ChevronUp, Inbox 
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import UrgencyBadge from '../components/UrgencyBadge';
import MatchDrawer from '../components/MatchDrawer';
import DispatchModal from '../components/DispatchModal';
import './NeedsQueue.css';

const MOCK_NEEDS = [
  {
    id: "need_01",
    rawText: "Elderly woman hasn't eaten in 2 days, trapped in Dharavi sector 4",
    parsed: {
      category: "Food",
      location: { raw: "Dharavi sector 4", lat: 19.0422, lng: 72.8558 },
      skillsRequired: ["food_delivery", "elderly_care"],
      affectedCount: 1,
      urgencySignals: ["elderly", "hasn't eaten", "urgently", "alone"]
    },
    urgencyScore: 87,
    urgencyLevel: "p0",
    status: "UNASSIGNED",
    reportedBy: { name: "Meena K.", phone: "+919876543210" },
    reportedAt: new Date(Date.now() - 14 * 60000).toISOString(),
    channel: "whatsapp",
    assignedVolunteerId: null,
    taskId: null,
    justAdded: true
  },
  {
    id: "need_02",
    rawText: "Need basic first aid supplies at community center",
    parsed: {
      category: "Medical",
      location: { raw: "Community Center", lat: 19.05, lng: 72.86 },
      skillsRequired: ["first_aid"],
      affectedCount: 5,
      urgencySignals: []
    },
    urgencyScore: 70,
    urgencyLevel: "p1",
    status: "UNASSIGNED",
    reportedBy: { name: "Rahul T.", phone: "+919876543211" },
    reportedAt: new Date(Date.now() - 45 * 60000).toISOString(),
    channel: "sms",
    assignedVolunteerId: null,
    taskId: null
  },
  {
    id: "need_03",
    rawText: "Fallen tree blocking the main road near school",
    parsed: {
      category: "Safety",
      location: { raw: "Main Road School", lat: 19.06, lng: 72.87 },
      skillsRequired: ["heavy_lifting", "equipment"],
      affectedCount: 20,
      urgencySignals: ["blocking"]
    },
    urgencyScore: 50,
    urgencyLevel: "p2",
    status: "IN PROGRESS",
    reportedBy: { name: "Amit P.", phone: "+919876543212" },
    reportedAt: new Date(Date.now() - 120 * 60000).toISOString(),
    channel: "app",
    assignedVolunteerId: null,
    taskId: null
  },
  {
    id: "need_04",
    rawText: "Looking for transport for 3 families",
    parsed: {
      category: "Transport",
      location: { raw: "Shelter A", lat: 19.07, lng: 72.88 },
      skillsRequired: ["driving", "large_vehicle"],
      affectedCount: 12,
      urgencySignals: []
    },
    urgencyScore: 20,
    urgencyLevel: "p3",
    status: "UNASSIGNED",
    reportedBy: { name: "Priya M.", phone: "+919876543213" },
    reportedAt: new Date(Date.now() - 240 * 60000).toISOString(),
    channel: "whatsapp",
    assignedVolunteerId: null,
    taskId: null
  }
];

export default function NeedsQueue() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  
  // Initialize needs from localStorage or use MOCK_NEEDS
  const [needs, setNeeds] = useState(() => {
    const saved = localStorage.getItem('needs');
    return saved ? JSON.parse(saved) : MOCK_NEEDS;
  });
  
  // Check for newly added needs and show notifications
  useEffect(() => {
    needs.forEach((need) => {
      if (need.justAdded) {
        // Create notification for new need
        const icon = need.urgencyLevel === 'p0' ? '⚠️' : '🆘';
        const color = need.urgencyLevel === 'p0' ? '#ef4444' : '#f59e0b';
        
        addNotification({
          title: 'New Need Posted',
          message: need.rawText.substring(0, 50) + (need.rawText.length > 50 ? '...' : ''),
          icon: icon,
          color: color,
          type: 'need',
          needId: need.id
        });
        
        // Remove the justAdded flag
        need.justAdded = false;
      }
    });
  }, [needs, addNotification]);
  
  // Initialize tasks in localStorage if not exists
  useEffect(() => {
    if (!localStorage.getItem('tasks')) {
      localStorage.setItem('tasks', JSON.stringify([]));
    }
  }, []);
  
  // Listen for task status changes and sync need status
  useEffect(() => {
    const syncTaskStatusToNeeds = () => {
      const tasks = localStorage.getItem('tasks');
      if (!tasks) return;
      
      const parsedTasks = JSON.parse(tasks);
      let needsUpdated = false;
      
      const updatedNeeds = needs.map(need => {
        // Find if this need has an associated task
        const associatedTask = parsedTasks.find(t => t.id === need.taskId);
        
        if (associatedTask && need.status !== associatedTask.status) {
          needsUpdated = true;
          return {
            ...need,
            status: associatedTask.status
          };
        }
        
        return need;
      });
      
      if (needsUpdated) {
        setNeeds(updatedNeeds);
        localStorage.setItem('needs', JSON.stringify(updatedNeeds));
      }
    };
    
    // Check every 1 second for task changes
    const interval = setInterval(syncTaskStatusToNeeds, 1000);
    return () => clearInterval(interval);
  }, [needs]);
  
  // Listen for focus events to sync needs from localStorage
  useEffect(() => {
    const handleFocus = () => {
      const updated = localStorage.getItem('needs');
      if (updated) {
        setNeeds(JSON.parse(updated));
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);
  
  // Persist needs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('needs', JSON.stringify(needs));
  }, [needs]);
  
  const [initialLoad, setInitialLoad] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [selectedNeedId, setSelectedNeedId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dispatchVolunteer, setDispatchVolunteer] = useState(null);

  const fileInputRef = useRef(null);

  // Read state from URL or set defaults
  const devState = searchParams.get('devstate');
  const sortCol = searchParams.get('sortCol') || 'urgencyScore';
  const sortAsc = searchParams.get('sortAsc') === 'true';
  const searchQuery = searchParams.get('search') || '';
  
  const tabStatus = searchParams.get('tab') || 'All'; // "All", "Unassigned", "In Progress", "Completed"

  useEffect(() => {
    if (devState === 'loading') {
      setInitialLoad(true);
      return;
    }
    const timer = setTimeout(() => {
      setInitialLoad(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [devState]);

  useEffect(() => {
    if (initialLoad) return;
    setFilterLoading(true);
    const timer = setTimeout(() => {
      setFilterLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchParams, initialLoad]);

  const processedNeeds = useMemo(() => {
    if (devState === 'empty') return [];
    if (devState === 'error') return [];
    if (devState === 'loading') return [];

    let filtered = [...needs];

    // Apply text search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        n.rawText.toLowerCase().includes(q) || 
        n.parsed.category.toLowerCase().includes(q) ||
        n.parsed.location.raw.toLowerCase().includes(q)
      );
    }

    // Tab status - normalize status values for comparison
    if (tabStatus !== 'All') {
      const tabStatusNormalized = tabStatus.toUpperCase().replace(' ', '_');
      filtered = filtered.filter(n => {
        const needStatus = n.status.toUpperCase().replace(' ', '_');
        return needStatus === tabStatusNormalized;
      });
    }

    // Urgency filter
    const urgencyFilter = searchParams.get('urgency');
    if (urgencyFilter && urgencyFilter !== 'All') {
      filtered = filtered.filter(n => n.urgencyLevel === urgencyFilter.toLowerCase());
    }

    // Category filter
    const categoryFilter = searchParams.get('category');
    if (categoryFilter && categoryFilter !== 'All') {
      filtered = filtered.filter(n => n.parsed.category === categoryFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let valA, valB;
      if (sortCol === 'urgencyScore') {
        valA = a.urgencyScore; valB = b.urgencyScore;
      } else if (sortCol === 'category') {
        valA = a.parsed.category; valB = b.parsed.category;
      } else if (sortCol === 'rawText') {
        valA = a.rawText; valB = b.rawText;
      } else if (sortCol === 'location') {
        valA = a.parsed.location.raw; valB = b.parsed.location.raw;
      } else if (sortCol === 'reportedAt') {
        valA = new Date(a.reportedAt).getTime(); valB = new Date(b.reportedAt).getTime();
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [devState, searchQuery, tabStatus, sortCol, sortAsc, needs, searchParams]);

  const handleSort = (col) => {
    const newParams = new URLSearchParams(searchParams);
    if (sortCol === col) {
      newParams.set('sortAsc', (!sortAsc).toString());
    } else {
      newParams.set('sortCol', col);
      newParams.set('sortAsc', 'false');
    }
    setSearchParams(newParams);
  };

  const handleRowClick = (id) => {
    // Only allow opening drawer if need is UNASSIGNED
    const need = needs.find(n => n.id === id);
    if (need && need.status === 'UNASSIGNED') {
      setSelectedNeedId(id);
      setIsDrawerOpen(true);
    }
  };

  const handleViewMatches = (e, id) => {
    e.stopPropagation();
    handleRowClick(id);
  };

  const handleDispatchComplete = () => {
    setIsModalOpen(false);
    setIsDrawerOpen(false);
    setTimeout(() => {
      setSelectedNeedId(null);
    }, 180);
  };

  const renderSortIcon = (col) => {
    if (sortCol !== col) return null;
    return sortAsc ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  const timeAgo = (isoDate) => {
    const diff = Math.floor((new Date() - new Date(isoDate)) / 60000);
    if (diff < 60) return `${diff} min ago`;
    const hours = Math.floor(diff / 60);
    return `${hours} hr ago`;
  };

  const isLoading = initialLoad || filterLoading || devState === 'loading';

  return (
    <div className="needs-queue-container">
      {/* Match Drawer */}
      <MatchDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        need={processedNeeds.find(n => n.id === selectedNeedId)} 
        onDispatchClick={(vol) => {
          setDispatchVolunteer(vol);
          setIsModalOpen(true);
          setIsDrawerOpen(false);
        }}
      />

      {/* Dispatch Modal */}
      <DispatchModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccessSequenceComplete={handleDispatchComplete}
        volunteer={dispatchVolunteer}
        need={processedNeeds.find(n => n.id === selectedNeedId)}
      />

      {/* Stat Cards Grid */}
      <div className="stat-cards-grid">
        <div className="stat-card active-needs">
          <div className="card-icon"><List size={24} /></div>
          <span className="card-label">Active Needs</span>
          <div className="card-value">1,204</div>
          <div className="card-delta positive">↑ 12%</div>
        </div>

        <div className="stat-card high-urgency">
          <div className="card-icon"><AlertTriangle size={24} /></div>
          <span className="card-label">High Urgency Unassigned</span>
          <div className="card-value">48</div>
          <div className="card-delta negative">↓ 5%</div>
        </div>

        <div className="stat-card volunteers">
          <div className="card-icon"><Users size={24} /></div>
          <span className="card-label">Volunteers Available Now</span>
          <div className="card-value">156</div>
          <div className="card-delta positive">↑ 24</div>
        </div>

        <div className="stat-card completed">
          <div className="card-icon"><CheckCircle size={24} /></div>
          <span className="card-label">Completed Today</span>
          <div className="card-value">328</div>
          <div className="card-delta positive">↑ 8%</div>
        </div>
      </div>

      <div className="needs-content-wrapper">
        {/* Filter Bar */}
        <div className="filter-bar">
          <div className="search-input-wrapper">
            <Input 
              type="text" 
              className="search-input"
              placeholder="Search needs, locations, names..." 
              value={searchQuery}
              onChange={e => {
                const newParams = new URLSearchParams(searchParams);
                if (e.target.value) newParams.set('search', e.target.value);
                else newParams.delete('search');
                setSearchParams(newParams);
              }}
            />
          </div>
          
          <select 
            className="filter-pill" 
            value={searchParams.get('urgency') || 'All'}
            onChange={(e) => {
              const newParams = new URLSearchParams(searchParams);
              if (e.target.value === 'All') newParams.delete('urgency');
              else newParams.set('urgency', e.target.value);
              setSearchParams(newParams);
            }}
          >
            <option value="All">Urgency: All</option>
            <option value="P0">P0 (Critical)</option>
            <option value="P1">P1 (High)</option>
            <option value="P2">P2 (Medium)</option>
            <option value="P3">P3 (Low)</option>
          </select>

          <select 
            className="filter-pill"
            value={searchParams.get('category') || 'All'}
            onChange={(e) => {
              const newParams = new URLSearchParams(searchParams);
              if (e.target.value === 'All') newParams.delete('category');
              else newParams.set('category', e.target.value);
              setSearchParams(newParams);
            }}
          >
            <option value="All">Category: All</option>
            <option value="Food">Food</option>
            <option value="Medical">Medical</option>
            <option value="Safety">Safety</option>
            <option value="Transport">Transport</option>
          </select>

          <button className="filter-pill" onClick={() => alert("Area/Zone filter coming soon!")}>Area/Zone</button>
          
          <div className="status-tabs">
            {['All', 'Unassigned', 'Dispatched', 'In Progress', 'Completed'].map((tab) => (
              <button 
                key={tab}
                className={`status-tab ${tabStatus === tab ? 'active' : ''}`}
                onClick={() => {
                  const newParams = new URLSearchParams(searchParams);
                  if (tab === 'All') newParams.delete('tab');
                  else newParams.set('tab', tab);
                  setSearchParams(newParams);
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="filter-bar-actions">
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept=".csv"
              onChange={(e) => {
                if (e.target.files.length > 0) {
                  alert("CSV Upload feature coming soon!");
                  e.target.value = null;
                }
              }}
            />
            <Button variant="secondary" size="compact" onClick={() => fileInputRef.current?.click()}>
              Upload CSV
            </Button>
            <button className="btn-add-need" onClick={() => navigate('/report')}>Add Need</button>
          </div>
        </div>

        {/* Main Table Area */}
        <div className="needs-table-container">
          <div className="table-card-wrapper">
            <table className="needs-table">
              <thead>
                <tr>
                  <th className="col-urgency" onClick={() => handleSort('urgencyLevel')}>Urgency {renderSortIcon('urgencyLevel')}</th>
                  <th className="col-category" onClick={() => handleSort('category')}>Category {renderSortIcon('category')}</th>
                  <th className="col-description" onClick={() => handleSort('rawText')}>Description {renderSortIcon('rawText')}</th>
                  <th className="col-location" onClick={() => handleSort('location')}>Location {renderSortIcon('location')}</th>
                  <th className="col-reported" onClick={() => handleSort('reportedAt')}>Reported {renderSortIcon('reportedAt')}</th>
                  <th className="col-skills">Skills Required</th>
                  <th className="col-status">Status</th>
                  <th className="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {processedNeeds.map((need) => (
                  <tr 
                    key={need.id} 
                    className={`${need.urgencyLevel === 'p0' ? 'p0-row' : ''} ${selectedNeedId === need.id ? 'selected' : ''} ${need.status === 'UNASSIGNED' ? 'clickable-row' : 'assigned-row'}`}
                    onClick={() => handleRowClick(need.id)}
                  >
                    <td className="col-urgency">
                      <UrgencyBadge level={need.urgencyLevel} />
                    </td>
                    <td className="col-category">
                      <span className="category-label">{need.parsed.category}</span>
                    </td>
                    <td className="col-description" title={need.rawText}>
                      {need.rawText}
                    </td>
                    <td className="col-location">
                      {need.parsed.location.raw}
                    </td>
                    <td className="col-reported">
                      {timeAgo(need.reportedAt)}
                    </td>
                    <td className="col-skills">
                      {need.parsed.skillsRequired.slice(0, 2).map(skill => (
                        <span key={skill} className="skill-tag">{skill.replace('_', ' ')}</span>
                      ))}
                      {need.parsed.skillsRequired.length > 2 && (
                        <span className="skill-tag-overflow">
                          +{need.parsed.skillsRequired.length - 2} more
                        </span>
                      )}
                    </td>
                    <td className="col-status">
                      <span className={`status-badge status-${need.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {need.status === 'UNASSIGNED' ? 'Unassigned' : 
                         need.status === 'DISPATCHED' ? 'Dispatched' :
                         need.status === 'IN_PROGRESS' ? 'In Progress' : 
                         need.status === 'COMPLETED' ? 'Completed' :
                         need.status}
                      </span>
                    </td>
                    <td className="col-actions">
                      {need.status === 'UNASSIGNED' ? (
                        <button 
                          className="btn-view-matches"
                          onClick={(e) => handleViewMatches(e, need.id)}
                        >
                          View Matches
                        </button>
                      ) : (
                        <span className="status-assigned">
                          {need.status === 'DISPATCHED' ? 'Dispatched' :
                           need.status === 'IN_PROGRESS' ? 'In Progress' :
                           need.status === 'COMPLETED' ? 'Completed' : 'Assigned'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {processedNeeds.length === 0 && !isLoading && (
              <div className="empty-state">
                <Inbox className="empty-state-icon" size={48} />
                <div className="empty-state-text">No needs match your filters</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
