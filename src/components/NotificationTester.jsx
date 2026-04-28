import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { SAMPLE_NOTIFICATIONS } from '../utils/notificationHelpers';

export default function NotificationTester() {
  const { addNotification } = useNotifications();

  const handleAddTestNotification = () => {
    const notification = SAMPLE_NOTIFICATIONS[Math.floor(Math.random() * SAMPLE_NOTIFICATIONS.length)];
    addNotification(notification);
  };

  return (
    <button
      onClick={handleAddTestNotification}
      style={{
        padding: '8px 12px',
        background: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: '500',
        marginLeft: '8px'
      }}
      title="Add test notification"
    >
      + Test Notif
    </button>
  );
}
