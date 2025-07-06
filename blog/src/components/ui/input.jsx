import React from 'react';
import classNames from 'classnames';

export const Input = ({ 
  id, 
  value, 
  onChange, 
  placeholder, 
  type = 'text',
  className,
  required,
  disabled
}) => (
  <input
    id={id}
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    required={required}
    disabled={disabled}
    className={classNames(
      "w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500",
      "focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500",
      "transition-all duration-200",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      className
    )}
  />
);
