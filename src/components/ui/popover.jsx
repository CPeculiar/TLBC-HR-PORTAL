import React, { useState, useRef } from 'react';
import { ClickOutside } from '../../components/ClickOutside';
import { cn } from "../../components/ui/cn";

export function Popover({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef();
  ClickOutside(ref, () => setIsOpen(false));

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setIsOpen(!isOpen)}>{children[0]}</div>
      {isOpen && <div className="absolute z-10 mt-2">{children[1]}</div>}
    </div>
  );
}

export function PopoverTrigger({ children }) {
    return <>{children}</>;
  }

  
  export function PopoverContent({ children, className, align }) {
    return (
      <div className={cn("bg-white border rounded shadow p-2", className)} style={{ textAlign: align }}>
        {children}
      </div>
    );
  }