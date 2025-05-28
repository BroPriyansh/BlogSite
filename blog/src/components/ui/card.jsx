import React from 'react';
import classNames from 'classnames';

export const Card = ({ children, className }) => (
  <div className={classNames("bg-white rounded-2xl shadow p-4", className)}>
    {children}
  </div>
);

export const CardHeader = ({ children, className }) => (
  <div className={classNames("mb-4", className)}>{children}</div>
);

export const CardTitle = ({ children, className }) => (
  <h2 className={classNames("text-xl font-bold", className)}>{children}</h2>
);

export const CardContent = ({ children, className }) => (
  <div className={classNames("mb-4", className)}>{children}</div>
);

export const CardFooter = ({ children, className }) => (
  <div className={classNames("border-t pt-4 flex justify-between items-center", className)}>
    {children}
  </div>
);
