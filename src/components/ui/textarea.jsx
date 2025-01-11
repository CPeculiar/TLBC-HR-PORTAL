import React from 'react';

export const Textarea = ({ className, ...props }) => (
  <textarea
    className={`border border-gray-300 p-2 rounded-md w-full resize-none ${className}`}
    {...props}
  />
);
