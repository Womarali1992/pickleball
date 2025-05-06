"use client";

import React, { useState } from "react";
import { TimeSlot, Court } from "@/lib/types";
import { format, addDays, startOfWeek } from "date-fns";
import { PopoverContent } from "@/components/ui/popover";
import { COLORS } from "@/lib/constants";
import { Reservation } from "@/lib/data";
import { useSchedulerStatus } from "@/hooks/useSchedulerStatus";
import WeekViewDayColumn from "./WeekViewDayColumn";

interface WeekViewCourtProps {
  court: Court;
  timeSlots: TimeSlot[];
  reservations: Reservation[];
  onSelectTimeSlot?: (timeSlot: TimeSlot, date: Date) => void;
  aspectRatio?: string;
  startDate?: Date;
}

export default function WeekViewCourt({
  court,
  timeSlots,
  reservations,
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
  
  // Add state for popover management
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);

  // Use the hook to get status logic
  const { getStatus } = useSchedulerStatus(timeSlots, reservations);

  // Handle toggling the popover
  const togglePopover = (slotId: string) => {
    if (openPopoverId === slotId) {
      setOpenPopoverId(null);
    } else {
      setOpenPopoverId(slotId);
    }
  };

  // Handle time slot selection - This will be passed to WeekViewTimeSlotButton
  const handleSlotClick = (slot: TimeSlot, date: Date) => {
    const hour = parseInt(slot.startTime.split(':')[0]);
    const status = getStatus(court, date, hour);
    const isClinic = !!status.slot?.clinicDetails;

    if (!isClinic && onSelectTimeSlot && status.available) {
        // Only call onSelectTimeSlot for available, non-clinic slots
        onSelectTimeSlot(slot, date);
    } else if (isClinic) {
        // For clinics, just toggle the popover
        const slotId = slot.id || `${slot.courtId}-${slot.date}-${slot.startTime}`;
        togglePopover(slotId);
    }
    // Do nothing if booked/blocked regular slot is clicked (handled by disabled state in button)
  };

  // Add a function to render clinic popover content
  const renderClinicPopover = (slot: TimeSlot, date: Date) => {
    // We should get details from the status object, not re-fetch
    const hour = parseInt(slot.startTime.split(':')[0]);
    const status = getStatus(court, date, hour);
    const clinicDetails = status.slot?.clinicDetails;

    if (!clinicDetails) {
      // Render basic popover if details are missing for some reason
      return (
          <PopoverContent className="w-80 p-4">
              <h4 className="font-semibold">Clinic</h4>
              <p className="text-sm text-muted-foreground">Details unavailable.</p>
          </PopoverContent>
      );
    }

    // Remove default values and fetching logic
    /*
    const clinicTitle = slot.courtName?.replace('Clinic: ', '') || 'Clinic';
    const clinicId = slot.id?.replace('clinic-', '') || '';
    let coachName = "Coach";
    // ... rest of defaults and fetch logic ...
    */
    
    return (
      <PopoverContent className="w-80 p-0">
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 p-3 text-white rounded-t">
          {/* Use clinicDetails */}
          <h4 className="font-bold text-base">{clinicDetails.title}</h4>
          <p className="text-sm font-medium">with {clinicDetails.coachName}</p>
        </div>
        <div className="p-4 space-y-4">
          <div className="text-sm text-muted-foreground">
            {/* Use clinicDetails */}
            {clinicDetails.description || 'No description available.'}
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{slot.startTime} - {slot.endTime}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{format(date, "MMMM d, yyyy")}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              {/* Use clinicDetails */}
              <span className="text-sm">Max participants: {clinicDetails.maxParticipants}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-muted-foreground" />
              {/* Use clinicDetails */}
              <span className="text-sm">Skill level: {clinicDetails.skillLevel}</span>
            </div>
          </div>
          <div className="bg-green-100 rounded p-2 flex justify-between items-center text-green-800">
            <span className="font-medium">Price per person</span>
            {/* Use clinicDetails */}
            <span className="font-bold text-lg">${clinicDetails.price}</span>
          </div>
        </div>
      </PopoverContent>
    );
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
            {formattedDates.map((dayInfo) => (
              <WeekViewDayColumn 
                key={dayInfo.formattedDate}
                dayInfo={dayInfo}
                slotsForDay={slotsByDate[dayInfo.formattedDate]}
                court={court}
                getStatus={getStatus}
                openPopoverId={openPopoverId}
                togglePopover={togglePopover}
                handleSlotClick={handleSlotClick}
                renderClinicPopover={renderClinicPopover}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 