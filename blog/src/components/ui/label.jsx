import React from 'react';
import classNames from 'classnames';

export const Label = ({ htmlFor, children, className }) => (
  <label 
    htmlFor={htmlFor} 
    className={classNames(
      "block text-sm font-medium text-gray-700 mb-2",
      className
    )}
  >
    {children}
  </label>
);
