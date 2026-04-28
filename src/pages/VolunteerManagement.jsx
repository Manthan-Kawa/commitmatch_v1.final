import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { Search, ChevronDown, ChevronUp, MoreHorizontal, Edit2, X, Plus, Users, LayoutDashboard, Trash2 } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import AvailabilityToggle from '../components/AvailabilityToggle';
import './VolunteerManagement.css';

const MOCK_VOLUNTEERS = [
  {
    id: "vol_01", name: "Rahul Sharma", phone: "+919123456789",
    skills: ["food_delivery", "transport", "elderly_care"],
    area: "Dharavi", availability: true,
    schedule: { mon:true, tue:true, wed:false, thu:true, fri:true, sat:true, sun:false },
    tasksCompleted: 34, acceptanceRate: 0.91, lastActive: "8 min ago", justAdded: false
  },
  {
    id: "vol_02", name: "Priya Nair", phone: "+919876543210",
    skills: ["medical", "first_aid", "translation"],
    area: "Kurla West", availability: true,
    schedule: { mon:true, tue:true, wed:true, thu:true, fri:true, sat:false, sun:false },
    tasksCompleted: 28, acceptanceRate: 0.86, lastActive: "1h ago", justAdded: false
  },
  {
    id: "vol_03", name: "Amir Khan", phone: "+919765432109",
    skills: ["transport", "childcare"],
    area: "Bandra East", availability: false,
    schedule: { mon:false, tue:true, wed:true, thu:false, fri:true, sat:true, sun:true },
    tasksCompleted: 19, acceptanceRate: 0.79, lastActive: "3h ago", justAdded: false
  },
  {
    id: "vol_04", name: "Sunita Rao", phone: "+919654321098",
    skills: ["elderly_care", "food_delivery", "safety", "first_aid"],
    area: "Andheri North", availability: true,
    schedule: { mon:true, tue:true, wed:true, thu:true, fri:true, sat:true, sun:false },
    tasksCompleted: 52, acceptanceRate: 0.94, lastActive: "25 min ago", justAdded: false
  },
  {
    id: "vol_05", name: "Deepak Mehta", phone: "+919543210987",
    skills: ["transport", "medical"],
    area: "Sion", availability: true,
    schedule: { mon:true, tue:false, wed:true, thu:false, fri:true, sat:false, sun:false },
    tasksCompleted: 11, acceptanceRate: 0.73, lastActive: "1d ago", justAdded: false
  },
  {
    id: "vol_06", name: "Fatima Sheikh", phone: "+919432109876",
    skills: ["translation", "childcare", "elderly_care"],
    area: "Dharavi", availability: false,
    schedule: { mon:false, tue:true, wed:false, thu:true, fri:false, sat:true, sun:true },
    tasksCompleted: 23, acceptanceRate: 0.83, lastActive: "2d ago", justAdded: false
  },
  {
    id: "vol_07", name: "Vikram Patel", phone: "+919321098765",
    skills: ["food_delivery", "safety"],
    area: "Kurla East", availability: true,
    schedule: { mon:true, tue:true, wed:true, thu:true, fri:true, sat:false, sun:false },
    tasksCompleted: 7, acceptanceRate: 0.71, lastActive: "4h ago", justAdded: false
  },
  {
    id: "vol_08", name: "Meena Joshi", phone: "+919210987654",
    skills: ["first_aid", "medical", "transport", "food_delivery"],
    area: "Matunga", availability: true,
    schedule: { mon:true, tue:true, wed:false, thu:true, fri:true, sat:true, sun:true },
    tasksCompleted: 41, acceptanceRate: 0.89, lastActive: "15 min ago", justAdded: false
  }
];

const SKILL_OPTIONS = ['food_delivery', 'transport', 'first_aid', 'elderly_care', 'medical', 'translation', 'childcare', 'safety'];
const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function VolunteerManagement() {
  const [searchParams] = useSearchParams();
  const { addNotification } = useNotifications();
  const devState = searchParams.get('volunteerstate');

  // Initialize volunteers from localStorage or use MOCK_VOLUNTEERS
  const [volunteers, setVolunteers] = useState(() => {
    const saved = localStorage.getItem('volunteers');
    return saved ? JSON.parse(saved) : MOCK_VOLUNTEERS;
  });
  
  // Check for newly added or available volunteers and show notifications
  useEffect(() => {
    volunteers.forEach((volunteer) => {
      if (volunteer.justAdded) {
        addNotification({
          title: 'New Volunteer Registered',
          message: `${volunteer.name} has joined as a volunteer`,
          icon: '👤',
          color: '#10b981',
          type: 'volunteer',
          volunteerId: volunteer.id
        });
        volunteer.justAdded = false;
      }
      
      if (volunteer.justBecameAvailable) {
        addNotification({
          title: 'Volunteer Available',
          message: `${volunteer.name} is now available for tasks`,
          icon: '✓',
          color: '#3b82f6',
          type: 'volunteer_available',
          volunteerId: volunteer.id
        });
        volunteer.justBecameAvailable = false;
      }
    });
  }, [volunteers, addNotification]);
  
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Persist volunteers to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('volunteers', JSON.stringify(volunteers));
  }, [volunteers]);
  
  // Listen for storage changes from other components (e.g., when needs are dispatched)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'volunteers' && e.newValue) {
        setVolunteers(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSkillFilter, setActiveSkillFilter] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const [toastMsg, setToastMsg] = useState(null);
  const [toastType, setToastType] = useState('error');

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState('add');
  const [editingVolId, setEditingVolId] = useState(null);

  // Derived visible volunteers
  const visibleVolunteers = useMemo(() => {
    if (devState === 'empty' || devState === 'loading') return [];
    
    let filtered = [...volunteers];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(v => v.name.toLowerCase().includes(q) || v.phone.includes(q));
    }
    if (activeSkillFilter) {
      filtered = filtered.filter(v => v.skills.includes(activeSkillFilter));
    }
    if (areaFilter) {
      filtered = filtered.filter(v => v.area === areaFilter);
    }
    if (availabilityFilter === 'Available Today') {
      const today = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
      filtered = filtered.filter(v => v.availability[today]);
    }

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [volunteers, searchQuery, activeSkillFilter, sortConfig, devState]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === visibleVolunteers.length && visibleVolunteers.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(visibleVolunteers.map(v => v.id)));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAvailabilityToggle = (id, currentVal) => {
    // Optimistic
    setVolunteers(prev => prev.map(v => v.id === id ? { ...v, availability: !currentVal } : v));
    console.log("PATCH stub: toggle availability", id, !currentVal);
    
    // Simulate 20% error rate
    setTimeout(() => {
      if (Math.random() < 0.2) {
        setVolunteers(prev => prev.map(v => v.id === id ? { ...v, availability: currentVal } : v));
        setToastType('error');
        setToastMsg("Failed to update availability. Please try again.");
      }
    }, 400);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setActiveSkillFilter('');
    setAreaFilter('');
    setAvailabilityFilter('');
    setSelectedIds(new Set());
  };

  const openDrawer = (mode, volId = null) => {
    setDrawerMode(mode);
    setEditingVolId(volId);
    setIsDrawerOpen(true);
  };

  const deleteVolunteer = (id) => {
    setVolunteers(prev => prev.filter(v => v.id !== id));
    setToastMsg("Volunteer removed successfully");
    setToastType("success");
  };

  const saveVolunteer = (data) => {
    if (drawerMode === 'add') {
      const newVol = {
        ...data,
        id: 'vol_' + Date.now(),
        tasksCompleted: 0,
        acceptanceRate: 0,
        lastActive: "Just now",
        justAdded: true
      };
      setVolunteers(prev => [newVol, ...prev]);
      console.log('Added:', newVol);
      
      // Remove flash flag after 600ms
      setTimeout(() => {
        setVolunteers(prev => prev.map(v => v.id === newVol.id ? { ...v, justAdded: false } : v));
      }, 600);
    } else {
      setVolunteers(prev => prev.map(v => v.id === data.id ? { ...v, ...data } : v));
      console.log('Updated:', data);
    }
    setIsDrawerOpen(false);
  };

  // Toast effect
  useEffect(() => {
    if (toastMsg) {
      const t = setTimeout(() => setToastMsg(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toastMsg]);

  const isLoading = devState === 'loading';
  const isEmpty = devState === 'empty' || (!isLoading && visibleVolunteers.length === 0 && !searchQuery && !activeSkillFilter);

  return (
    <div className="volunteer-mgmt-page">
      {/* Toast */}
      {toastMsg && (
        <div className={`toast-notification ${toastType === 'error' ? 'toast-error' : 'toast-success'}`}>
          {toastMsg}
        </div>
      )}

      {/* Toolbar Area */}
      <div className="vol-management-toolbar">
        <div className="toolbar-left">
          <div className="vol-search-container">
            <Search className="search-icon-inner" size={16} />
            <Input 
              placeholder="Search volunteers by name or phone..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="toolbar-search-input"
            />
          </div>
          <div className="toolbar-filters">
            <select 
              className="vol-filter-pill"
              value={activeSkillFilter}
              onChange={e => setActiveSkillFilter(e.target.value)}
            >
              <option value="">Skills: All</option>
              <option value="Medical">Medical</option>
              <option value="Elderly Care">Elderly Care</option>
              <option value="Food Delivery">Food Delivery</option>
              <option value="Logistics">Logistics</option>
              <option value="Teaching">Teaching</option>
            </select>

            <select 
              className="vol-filter-pill"
              value={areaFilter}
              onChange={e => setAreaFilter(e.target.value)}
            >
              <option value="">Area: All</option>
              <option value="Dharavi Sector 4">Dharavi Sector 4</option>
              <option value="Kurla West">Kurla West</option>
              <option value="Bandra East">Bandra East</option>
              <option value="Andheri North">Andheri North</option>
            </select>

            <select 
              className="vol-filter-pill"
              value={availabilityFilter}
              onChange={e => setAvailabilityFilter(e.target.value)}
            >
              <option value="">Availability: All</option>
              <option value="Available Today">Available Today</option>
            </select>
            {(searchQuery || activeSkillFilter) && (
              <button className="vol-clear-filters" onClick={clearFilters}>Clear</button>
            )}
          </div>
        </div>
        <Button variant="primary" className="btn-add-vol" onClick={() => openDrawer('add')}>
          + Add Volunteer
        </Button>
      </div>

      <div className="vol-table-wrapper relative">
        <div className="vol-table-card">
        
        {/* Batch Action Bar */}
        <div className={`batch-action-bar ${selectedIds.size > 0 ? 'visible' : ''}`}>
          <div className="batch-count">{selectedIds.size} volunteers selected</div>
          <div className="batch-actions">
            <Button variant="ghost" size="compact" onClick={() => console.log('Check-in', selectedIds)}>Send Check-in</Button>
            <Button variant="ghost" size="compact" onClick={() => console.log('Export', selectedIds)}>Export CSV</Button>
            <Button variant="ghost" size="compact" onClick={() => console.log('Deactivate', selectedIds)} style={{color: '#EF4444'}}>Deactivate</Button>
          </div>
        </div>

        <div className="vol-table-container">
          <div className="vol-table">
            <div className="vol-table-header vol-table-grid">
              <div className="th-cell">
                <input 
                  type="checkbox" 
                  className="vol-checkbox"
                  checked={visibleVolunteers.length > 0 && selectedIds.size === visibleVolunteers.length}
                  onChange={toggleSelectAll}
                />
              </div>
              <div className="th-cell sortable-header" onClick={() => requestSort('name')}>
                Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>)}
              </div>
              <div className="th-cell sortable-header" onClick={() => requestSort('skills')}>
                Skills {sortConfig.key === 'skills' && (sortConfig.direction === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>)}
              </div>
              <div className="th-cell sortable-header" onClick={() => requestSort('area')}>
                Service Area {sortConfig.key === 'area' && (sortConfig.direction === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>)}
              </div>
              <div className="th-cell sortable-header" onClick={() => requestSort('availability')}>
                Availability {sortConfig.key === 'availability' && (sortConfig.direction === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>)}
              </div>
              <div className="th-cell th-acc sortable-header" style={{justifyContent: 'flex-end'}} onClick={() => requestSort('tasksCompleted')}>
                Tasks {sortConfig.key === 'tasksCompleted' && (sortConfig.direction === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>)}
              </div>
              <div className="th-cell th-acc sortable-header" onClick={() => requestSort('acceptanceRate')}>
                Acceptance {sortConfig.key === 'acceptanceRate' && (sortConfig.direction === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>)}
              </div>
              <div className="th-cell th-active sortable-header" onClick={() => requestSort('lastActive')}>
                Last Active {sortConfig.key === 'lastActive' && (sortConfig.direction === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>)}
              </div>
              <div className="th-cell">Actions</div>
            </div>

            {isLoading ? (
               Array.from({length: 5}).map((_, i) => (
                 <div key={i} className="vol-skeleton-row vol-table-grid">
                   <div className="skeleton-cell"><div className="skeleton-block" style={{width: 16, height: 16}}></div></div>
                   <div className="skeleton-cell"><div className="skeleton-block" style={{width: 120, height: 16}}></div></div>
                   <div className="skeleton-cell"><div className="skeleton-block" style={{width: 160, height: 20, borderRadius: 10}}></div></div>
                   <div className="skeleton-cell"><div className="skeleton-block" style={{width: 80, height: 14}}></div></div>
                   <div className="skeleton-cell"><div className="skeleton-block" style={{width: 36, height: 20, borderRadius: 10}}></div></div>
                   <div className="skeleton-cell th-acc"><div className="skeleton-block" style={{width: 24, height: 14, marginLeft: 'auto'}}></div></div>
                   <div className="skeleton-cell th-acc"><div className="skeleton-block" style={{width: 60, height: 4}}></div></div>
                   <div className="skeleton-cell th-active"><div className="skeleton-block" style={{width: 60, height: 14}}></div></div>
                   <div className="skeleton-cell"><div className="skeleton-block" style={{width: 24, height: 24}}></div></div>
                 </div>
               ))
            ) : isEmpty ? (
              <div className="vol-empty-state">
                <Users size={48} className="vol-empty-icon" />
                <div className="vol-empty-text">No volunteers yet</div>
                <Button variant="primary" onClick={() => openDrawer('add')}>+ Add Your First Volunteer</Button>
              </div>
            ) : (
              visibleVolunteers.map(vol => {
                const isSelected = selectedIds.has(vol.id);
                const hiddenSkills = vol.skills.slice(3).map(s => s.replace('_', ' ')).join(', ');
                return (
                  <div 
                    key={vol.id} 
                    className={`vol-table-row vol-table-grid ${isSelected ? 'row-selected' : ''} ${vol.justAdded ? 'row-flash' : ''}`}
                  >
                    <div className="td-cell">
                      <input 
                        type="checkbox" 
                        className="vol-checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(vol.id)}
                      />
                    </div>
                    
                    <div className="td-cell vol-name-cell">
                      <div className="vol-name">{vol.name}</div>
                      <div className="vol-phone">{vol.phone}</div>
                    </div>
                    
                    <div className="td-cell td-skills">
                      {vol.skills.slice(0, 3).map((s, idx) => (
                        <span 
                          key={idx} 
                          className="vol-skill-tag"
                        >
                          {s.replace('_', ' ')}
                        </span>
                      ))}
                      {vol.skills.length > 3 && (
                        <span className="vol-skill-tag more-tag">+ {vol.skills.length - 3} more</span>
                      )}
                    </div>

                    <div className="td-cell td-area">{vol.area}</div>
                    
                    <div className="td-cell td-avail">
                      <div className={`vol-switch ${vol.availability ? 'active' : ''}`} onClick={() => handleAvailabilityToggle(vol.id, vol.availability)}>
                        <div className="vol-switch-thumb"></div>
                      </div>
                    </div>

                    <div className="td-cell td-tasks">
                      {vol.tasksCompleted}
                    </div>

                    <div className="td-cell td-acceptance">
                      <div className="vol-acc-row">
                        <div className="vol-acc-bar-container">
                          <div className="vol-acc-bar-fill" style={{width: `${vol.acceptanceRate * 100}%`}}></div>
                        </div>
                        <div className="vol-acc-percent">{Math.round(vol.acceptanceRate * 100)}%</div>
                      </div>
                    </div>

                    <div className="td-cell td-last-active">{vol.lastActive}</div>

                    <div className="td-cell td-actions">
                      <button className="vol-action-btn" onClick={() => openDrawer('edit', vol.id)}>
                        <Edit2 size={16} />
                      </button>
                      <button className="vol-action-btn" onClick={() => deleteVolunteer(vol.id)}>
                        <Trash2 size={16} color="#EF4444" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>

      <VolDrawer 
        isOpen={isDrawerOpen} 
        mode={drawerMode}
        volunteer={drawerMode === 'edit' ? volunteers.find(v => v.id === editingVolId) : null}
        onClose={() => setIsDrawerOpen(false)}
        onSave={saveVolunteer}
      />
    </div>
  );
}

function VolDrawer({ isOpen, mode, volunteer, onClose, onSave }) {
  const [isRendered, setIsRendered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [skills, setSkills] = useState([]);
  const [area, setArea] = useState('');
  const [availability, setAvailability] = useState(true);
  const [schedule, setSchedule] = useState({ mon:true, tue:true, wed:true, thu:true, fri:true, sat:true, sun:true });
  const [notes, setNotes] = useState('');
  
  const [skillInput, setSkillInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      requestAnimationFrame(() => setIsAnimating(true));
      setIsSaving(false);
      setSkillInput('');
      setFormErrors({});
      
      if (mode === 'edit' && volunteer) {
        setName(volunteer.name || '');
        setPhone(volunteer.phone || '');
        setSkills(volunteer.skills || []);
        setArea(volunteer.area || '');
        setAvailability(volunteer.availability ?? true);
        setSchedule(volunteer.schedule || { mon:true, tue:true, wed:true, thu:true, fri:true, sat:true, sun:true });
        setNotes(volunteer.notes || '');
      } else {
        setName('');
        setPhone('');
        setSkills([]);
        setArea('');
        setAvailability(true);
        setSchedule({ mon:true, tue:true, wed:true, thu:true, fri:true, sat:true, sun:true });
        setNotes('');
      }
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsRendered(false), 180);
      return () => clearTimeout(timer);
    }
  }, [isOpen, mode, volunteer]);

  // Esc to close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isRendered && !isOpen) return null;
  const drawerClass = isAnimating ? 'drawer-open' : 'drawer-closed';

  const availableSkills = SKILL_OPTIONS.filter(s => !skills.includes(s) && s.includes(skillInput.toLowerCase()));

  const handleSave = () => {
    const errors = {};
    if (!name.trim()) errors.name = "Name is required";
    if (!phone.trim() || phone === '+91') errors.phone = "Phone number is required";
    if (skills.length === 0) errors.skills = "Add at least one skill";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsSaving(true);
    setTimeout(() => {
      onSave({
        ...(mode === 'edit' ? { id: volunteer.id } : {}),
        name,
        phone,
        skills,
        area,
        availability,
        schedule,
        notes
      });
    }, 150);
  };

  const addSkill = (s) => {
    setSkills([...skills, s]);
    setSkillInput('');
  };

  const removeSkill = (s) => {
    setSkills(skills.filter(x => x !== s));
  };

  const toggleDay = (day) => {
    setSchedule(prev => ({ ...prev, [day]: !prev[day] }));
  };

  return createPortal(
    <div className={`vol-drawer-container ${drawerClass}`}>
      <div className="drawer-overlay" onClick={onClose}></div>
      
      <div className="drawer-panel" style={{width: 440}}>
        <div className="drawer-header">
          <button className="drawer-close-btn" onClick={onClose}><X size={20} /></button>
          <h3 className="drawer-title">{mode === 'edit' ? 'Edit Volunteer' : 'Add Volunteer'}</h3>
        </div>

        <div className="drawer-body drawer-form">
          <div className="form-group">
            <label>Full Name <span className="req">*</span></label>
            <Input 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="e.g. Rahul Sharma" 
              style={{height: 40, borderColor: formErrors.name ? 'var(--color-danger)' : undefined}} 
            />
            {formErrors.name && <div className="error-text">{formErrors.name}</div>}
          </div>

          <div className="form-group">
            <label>Phone Number <span className="req">*</span></label>
            <div className="phone-input-row" style={{borderColor: formErrors.phone ? 'var(--color-danger)' : undefined}}>
              <div className="phone-prefix" style={{borderColor: formErrors.phone ? 'var(--color-danger)' : undefined}}>+91</div>
              <input 
                type="tel" 
                className="phone-input" 
                value={phone.replace('+91', '')} 
                onChange={e => setPhone('+91' + e.target.value)} 
                placeholder="98765 43210" 
                style={{borderColor: formErrors.phone ? 'var(--color-danger)' : undefined}}
              />
            </div>
            {formErrors.phone && <div className="error-text">{formErrors.phone}</div>}
          </div>

          <div className="form-group">
            <label>Skills <span className="req">*</span></label>
            <div className="skill-chip-input" style={{borderColor: formErrors.skills ? 'var(--color-danger)' : undefined}}>
              {skills.map(s => (
                <div key={s} className="skill-chip">
                  {s.replace('_', ' ')}
                  <button onClick={() => removeSkill(s)}><X size={12}/></button>
                </div>
              ))}
              <input 
                value={skillInput} 
                onChange={e => setSkillInput(e.target.value)} 
                placeholder={skills.length === 0 ? "Type to search skills..." : ""} 
              />
            </div>
            {formErrors.skills && <div className="error-text">{formErrors.skills}</div>}
            {skillInput && availableSkills.length > 0 && (
              <div className="skill-dropdown">
                {availableSkills.map(s => (
                  <div key={s} className="skill-dropdown-item" onClick={() => addSkill(s)}>
                    {s.replace('_', ' ')}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Service Area</label>
            <Input value={area} onChange={e => setArea(e.target.value)} placeholder="e.g. Dharavi" style={{height: 40}} />
            <div className="helper-text">Enter neighborhood or zone name</div>
          </div>

          <div className="form-group inline-group">
            <label>Available for tasks</label>
            <AvailabilityToggle checked={availability} onChange={() => setAvailability(!availability)} />
          </div>

          <div className="form-group">
            <label>Active Days</label>
            <div className="schedule-pills">
              {DAYS.map((day, idx) => (
                <div key={day} className="schedule-pill-wrap">
                  <button 
                    className={`schedule-pill ${schedule[day] ? 'active' : ''}`}
                    onClick={() => toggleDay(day)}
                  >
                    {DAY_LABELS[idx]}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Notes (optional)</label>
            <textarea 
              className="notes-textarea" 
              rows="3" 
              placeholder="Any additional context about this volunteer"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            ></textarea>
          </div>
        </div>

        <div className="drawer-footer">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} loading={isSaving}>
            {mode === 'edit' ? 'Update Volunteer' : 'Save Volunteer'}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
