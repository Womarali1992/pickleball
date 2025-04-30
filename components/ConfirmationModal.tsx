"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  reservationId: string;
}

export default function ConfirmationModal({
  open,
  onClose,
  reservationId,
}: ConfirmationModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">
            Reservation Confirmed!
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Your court has been successfully reserved. Please check your email for details.
          </p>
          <div className="bg-muted/50 p-3 rounded-md mb-4">
            <p className="text-sm font-semibold">Reservation ID:</p>
            <p className="text-lg">{reservationId}</p>
          </div>
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
} 