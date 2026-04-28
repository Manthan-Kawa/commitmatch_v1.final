import React from 'react';
import './Card.css';

export default function Card({
  radius = 'primary', // primary, dense, inline
  padding = 'stat', // stat, kanban, volunteer, none
  elevated = false,
  className = '',
  children,
  ...props
}) {
  const radiusClass = `card-radius-${radius}`;
  const paddingClass = `card-padding-${padding}`;
  const shadowClass = elevated ? 'card-shadow-elevated' : 'card-shadow-default';

  return (
    <div className={`card ${radiusClass} ${paddingClass} ${shadowClass} ${className}`} {...props}>
      {children}
    </div>
  );
}
