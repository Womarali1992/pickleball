"use client";

import React, { useState } from "react";
import { TimeSlot, Court } from "@/lib/types";
import { format, addDays, startOfWeek } from "date-fns";

interface WeekViewCourtProps {
  court: Court;
  timeSlots: TimeSlot[];
  onSelectTimeSlot?: (timeSlot: TimeSlot, date: Date) => void;
  aspectRatio?: string;
  startDate?: Date;
}

export default function WeekViewCourt({
  court,
  timeSlots,
  onSelectTimeSlot,
  aspectRatio = "aspect-[22/10]",
  startDate = new Date()
}: WeekViewCourtProps) {
  // Calculate week dates
  const weekStart = startOfWeek(startDate, { weekStartsOn: 1 }); // Start on Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  // Format dates for display and filtering
  const formattedDates = weekDays.map((date) => ({
    date,
    displayDate: format(date, "EEE d"),
    formattedDate: format(date, "yyyy-MM-dd")
  }));
  
  // Group time slots by date
  const slotsByDate = formattedDates.reduce((acc, { formattedDate }) => {
    acc[formattedDate] = timeSlots.filter(slot => 
      slot.courtId === court.id && slot.date === formattedDate
    ).sort((a, b) => a.startTime.localeCompare(b.startTime));
    return acc;
  }, {} as Record<string, TimeSlot[]>);
  
  // Determine if court is vertical
  const isVertical = court.orientation === "vertical";
  
  // Handle time slot selection
  const handleSlotClick = (slot: TimeSlot, date: Date) => {
    if (onSelectTimeSlot) {
      onSelectTimeSlot(slot, date);
    }
  };

  return (
    <div className={`w-full ${aspectRatio} order-2 mb-6`}>
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
        
        <div className="flex-1 bg-white rounded-b-lg border-x border-b overflow-hidden">
          <div className="grid grid-cols-7 h-full">
            {formattedDates.map(({ date, displayDate, formattedDate }) => (
              <div key={formattedDate} className="flex flex-col border-r last:border-r-0">
                {/* Day header */}
                <div className="bg-gray-100 p-2 text-center border-b">
                  <div className="text-sm font-medium">{displayDate}</div>
                </div>
                
                {/* Time slots for the day */}
                <div className="flex-1 overflow-y-auto p-1">
                  {slotsByDate[formattedDate]?.length > 0 ? (
                    <div className="space-y-1">
                      {slotsByDate[formattedDate].map((slot) => {
                        const isAvailable = slot.available;
                        const bgColor = isAvailable 
                          ? "bg-green-500 hover:bg-green-300" 
                          : "bg-blue-500 hover:bg-blue-300";
                        const statusLabel = isAvailable ? "Available" : "Booked";
                        
                        return (
                          <button
                            key={slot.id || `${slot.courtId}-${slot.date}-${slot.startTime}`}
                            onClick={() => handleSlotClick(slot, date)}
                            className={`w-full whitespace-nowrap rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input hover:text-accent-foreground px-1 py-1 court-slot flex flex-col items-center justify-center ${bgColor} text-white`}
                          >
                            <span className="text-xs font-medium">{slot.startTime}</span>
                            <span className="text-xs text-muted-foreground">{statusLabel}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                      No slots
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 