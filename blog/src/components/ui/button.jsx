import React from 'react';
import classNames from 'classnames';

export const Button = ({
  children,
  onClick,
  disabled,
  variant = 'default',
  size = 'md',
  className,
  type = 'button'
}) => {
  const baseStyle = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    default: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-sm hover:shadow-md",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500 bg-white",
    ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
    gradient: "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 focus:ring-indigo-500 shadow-lg hover:shadow-xl",
  };
  
  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classNames(baseStyle, variants[variant], sizes[size], className)}
    >
      {children}
    </button>
  );
};
