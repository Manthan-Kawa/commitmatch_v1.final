import React from 'react';
import './Input.css';

export default function Input({
  error = false,
  className = '',
  ...props
}) {
  return (
    <input 
      className={`input ${error ? 'input-error' : ''} ${className}`}
      {...props}
    />
  );
}
