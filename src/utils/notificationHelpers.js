// Helper functions for creating notifications

export const notificationTypes = {
  VOLUNTEER_ADDED: {
    icon: '👤',
    color: '#10b981',
    type: 'volunteer'
  },
  VOLUNTEER_AVAILABLE: {
    icon: '✓',
    color: '#3b82f6',
    type: 'volunteer'
  },
  NEED_CREATED: {
    icon: '🆘',
    color: '#f59e0b',
    type: 'need'
  },
  NEED_URGENT: {
    icon: '⚠️',
    color: '#ef4444',
    type: 'need'
  },
  TASK_COMPLETED: {
    icon: '✅',
    color: '#8b5cf6',
    type: 'task'
  },
  MESSAGE: {
    icon: '💬',
    color: '#ec4899',
    type: 'message'
  }
};

export const createNotification = (typeKey, customData = {}) => {
  const type = notificationTypes[typeKey];
  if (!type) {
    console.warn(`Unknown notification type: ${typeKey}`);
    return null;
  }

  return {
    ...type,
    ...customData,
  };
};

// Sample notification data for testing
export const SAMPLE_NOTIFICATIONS = [
  createNotification('VOLUNTEER_ADDED', {
    title: 'New Volunteer Added',
    message: 'Sarah Johnson registered as a volunteer'
  }),
  createNotification('NEED_CREATED', {
    title: 'New Need Posted',
    message: 'Community center needs 5 volunteers for food drive'
  }),
  createNotification('VOLUNTEER_AVAILABLE', {
    title: 'Volunteer Available',
    message: 'Mark Davis is available for tasks this weekend'
  }),
  createNotification('NEED_URGENT', {
    title: 'Urgent Need!',
    message: 'Emergency shelter needs support - 3 people required'
  }),
];
