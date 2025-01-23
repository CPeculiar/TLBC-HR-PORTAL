import React from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";

export const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  const handleClose = (e) => {
    if (e.target.dataset.overlay) {
      onOpenChange(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      data-overlay
      onClick={handleClose}
    >
      <div className="bg-white rounded-md shadow-lg w-full max-w-[95vw] sm:max-w-[600px] p-4 sm:p-6 md:p-8">
        {children}
      </div>
    </div>,
    document.body
  );
};

export const DialogContent = ({ children }) => (
  <div className="mt-4">{children}</div>
);

export const DialogHeader = ({ children }) => (
  <div className="border-b pb-2 mb-4">{children}</div>
);

export const DialogTitle = ({ children }) => (
  <h2 className="text-xl font-semibold">{children}</h2>
);

export const DialogDescription = ({ children }) => (
  <p className="text-sm text-gray-600 mt-2">{children}</p>
);

export const DialogFooter = ({ children }) => (
  <div className="border-t pt-3 mt-4 flex justify-end space-x-2">
    {children}
  </div>
);