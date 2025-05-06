"use client";

import React from "react";
import { TimeSlot, Court } from "@/lib/types";
import { Button } from "@/components/ui/button";

// Court slot styling
const SLOT_COLORS = {
  AVAILABLE: {
    BG: "bg-green-500 hover:bg-green-300",
    TEXT: "text-white",
    LABEL: "Available"
  },
  BOOKED: {
    BG: "bg-blue-500 hover:bg-blue-300", 
    TEXT: "text-white",
    LABEL: "Booked"
  },
  CLINIC: {
    BG: "bg-yellow-500 hover:bg-yellow-300",
    TEXT: "text-white",
    LABEL: "Clinic"
  }
};

interface CourtCardProps {
  court: Court;
  timeSlots: TimeSlot[];
  onSelectTimeSlot?: (timeSlot: TimeSlot) => void;
  aspectRatio?: string;
}

export default function CourtCard({ 
  court, 
  timeSlots,
  onSelectTimeSlot,
  aspectRatio = "aspect-[22/10]" // Default to 22:10 aspect ratio
}: CourtCardProps) {
  // Sort slots by start time
  const sortedSlots = [...timeSlots].sort((a, b) => {
    return a.startTime.localeCompare(b.startTime);
  });

  // Handle slot selection
  const handleSlotClick = (slot: TimeSlot) => {
    if (onSelectTimeSlot) {
      onSelectTimeSlot(slot);
    }
  };

  // Determine if the court is vertical
  const isVertical = court.orientation === "vertical";

  // Grid columns based on orientation
  const gridCols = isVertical 
    ? "grid-cols-1" // Single column for vertical
    : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"; // Multiple columns for horizontal

  return (
    <div className={`w-full order-2 mb-6 ${aspectRatio}`}>
      <div className="h-full flex flex-col">
        <div className="bg-gradient-to-r from-blue-500 to-green-500 p-3 flex justify-between items-center rounded-t-lg">
          <h3 className="font-medium text-white">{court.name}</h3>
          <div className="flex space-x-2">
            <span className="bg-secondary text-white text-xs px-2 py-1 rounded-full">
              {court.indoor ? "Indoor" : "Outdoor"}
            </span>
            <span className="bg-secondary text-white text-xs px-2 py-1 rounded-full">
              {isVertical ? "Vertical" : "Horizontal"}
            </span>
          </div>
        </div>
        <div className={`grid ${gridCols} gap-2 bg-white p-3 rounded-b-lg border-x border-b flex-1 overflow-auto`}>
          {sortedSlots.map((slot) => {
            const isAvailable = slot.available;
            const isClinic = slot.courtName?.startsWith('Clinic:');
            
            let bgColor, statusLabel;
            
            if (isClinic) {
              bgColor = SLOT_COLORS.CLINIC.BG;
              statusLabel = "Clinic";
            } else if (isAvailable) {
              bgColor = SLOT_COLORS.AVAILABLE.BG;
              statusLabel = "Available";
            } else {
              bgColor = SLOT_COLORS.BOOKED.BG;
              statusLabel = "Booked";
            }
            
            // For vertical courts, we make buttons shorter but wider
            const buttonHeight = isVertical ? "h-10" : "h-16";
            
            return (
              <button
                key={slot.id || `${slot.courtId}-${slot.date}-${slot.startTime}`}
                onClick={() => handleSlotClick(slot)}
                className={`whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input hover:text-accent-foreground px-3 py-1 court-slot ${buttonHeight} flex flex-col items-center justify-center ${bgColor} text-white`}
              >
                <span className="text-sm font-medium">{slot.startTime} - {slot.endTime}</span>
                <span className="text-xs text-muted-foreground">{statusLabel}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
} 