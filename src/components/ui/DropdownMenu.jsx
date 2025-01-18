import React, { useState, useRef, useEffect } from 'react';

const DropdownMenu = ({ trigger, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      {isOpen && (
        <div className="absolute right-0 mt-1 w-44 rounded-md shadow-lg bg-white dark:bg-boxdark ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

const DropdownItem = ({ onClick, children, className = '' }) => (
  <button
    onClick={(e) => {
      e.preventDefault();
      onClick();
    }}
    className={`block w-full text-left px-4 py-1 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray/50 dark:hover:bg-gray/10 ${className}`}
  >
    {children}
  </button>
);

export { DropdownMenu, DropdownItem };