import React from 'react';
import classNames from 'classnames';

export const Card = ({ children, className }) => (
  <div className={classNames(
    "bg-white rounded-2xl shadow-lg border border-gray-100",
    "hover:shadow-xl transition-shadow duration-300",
    className
  )}>
    {children}
  </div>
);

export const CardHeader = ({ children, className }) => (
  <div className={classNames("p-6 pb-4", className)}>{children}</div>
);

export const CardTitle = ({ children, className }) => (
  <h2 className={classNames("text-xl font-bold text-gray-900", className)}>{children}</h2>
);

export const CardContent = ({ children, className }) => (
  <div className={classNames("p-6 pt-0", className)}>{children}</div>
);

export const CardFooter = ({ children, className }) => (
  <div className={classNames("p-6 pt-0 border-t border-gray-100 flex justify-between items-center", className)}>
    {children}
  </div>
);
