import React from 'react';
import './Button.css';

export default function Button({ 
  variant = 'primary', 
  size = 'default', 
  loading = false, 
  disabled = false, 
  children, 
  className = '',
  ...props 
}) {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-size-${size}`;
  const stateClass = loading ? 'btn-loading' : '';
  const disabledClass = disabled || loading ? 'btn-disabled' : '';

  return (
    <button 
      className={`${baseClass} ${variantClass} ${sizeClass} ${stateClass} ${disabledClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="spinner"></span>
      ) : (
        children
      )}
    </button>
  );
}
