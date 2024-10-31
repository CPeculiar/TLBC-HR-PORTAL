// components/ui/alert.jsx

import React from 'react';


export function Alert({ children, className = "", ...props }) {
  return (
    <div
      role="alert"
      className={`relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function AlertDescription({ children, className = "" }) {x
  return (
    <div className={`text-sm opacity-90 [&_p]:leading-relaxed ${className}`}>
      {children}
    </div>
  );
}