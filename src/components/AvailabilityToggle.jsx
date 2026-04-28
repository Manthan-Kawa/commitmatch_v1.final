import React from 'react';
import './AvailabilityToggle.css';

export default function AvailabilityToggle({
  checked = false,
  onChange,
  className = '',
  ...props
}) {
  return (
    <button 
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange && onChange(!checked)}
      className={`availability-toggle ${checked ? 'is-on' : 'is-off'} ${className}`}
      {...props}
    >
      <span className="availability-knob"></span>
    </button>
  );
}
