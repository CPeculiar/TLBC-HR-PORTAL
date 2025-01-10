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
      <div className="bg-white rounded-md shadow-lg p-6 w-full max-w-lg">
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
