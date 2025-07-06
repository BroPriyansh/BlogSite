import React from 'react';
import classNames from 'classnames';

export const Textarea = ({ 
  id, 
  value, 
  onChange, 
  placeholder, 
  className,
  required,
  disabled,
  rows = 4
}) => (
  <textarea
    id={id}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    required={required}
    disabled={disabled}
    rows={rows}
    className={classNames(
      "w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500",
      "focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500",
      "transition-all duration-200 resize-none",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      className
    )}
  />
);
