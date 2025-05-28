import React from 'react';
import classNames from 'classnames';

export const Button = ({
  children,
  onClick,
  disabled,
  variant = 'default',
  size = 'md',
  className
}) => {
  const baseStyle = "inline-flex items-center justify-center font-medium rounded-lg transition";
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-100",
  };
  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={classNames(baseStyle, variants[variant], sizes[size], className)}
    >
      {children}
    </button>
  );
};
