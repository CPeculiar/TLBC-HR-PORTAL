import React from 'react';

export const Input = ({ className, ...props }) => (
  <input
    className={`border border-gray-300 p-2 rounded-md w-full ${className}`}
    {...props}
  />
);
