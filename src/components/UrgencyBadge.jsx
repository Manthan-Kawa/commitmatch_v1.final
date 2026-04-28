import React from 'react';

export default function UrgencyBadge({ level, className = '' }) {
  let label = '';
  switch (level.toLowerCase()) {
    case 'p0': label = 'P0 Critical'; break;
    case 'p1': label = 'P1 High'; break;
    case 'p2': label = 'P2 Medium'; break;
    case 'p3': label = 'P3 Low'; break;
    default: label = level;
  }

  return (
    <span className={`urgency-badge ${level.toLowerCase()} ${className}`}>
      {label}
    </span>
  );
}
