import React from 'react';

export const Textarea = ({ id, value, onChange, placeholder, className }) => (
  <textarea
    id={id}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:ring-blue-200 ${className}`}
  />
);
