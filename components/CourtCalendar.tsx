"use client";

import { useState, useEffect } from "react";
import { TimeSlot } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { getTimeSlots } from "@/lib/api";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { getCourts } from "@/lib/data";
import { reservations } from "@/lib/data";

// Hardcoded colors for court slots
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
  MY_BOOKING: {
    BG: "bg-blue-500 hover:bg-blue-600",
    TEXT: "text-white",
    LABEL: "Your Booking"
  }
};

// Add CSS styles for the court orientations
const courtStyles = {
  horizontal: "w-full h-[360px]",
  vertical: "h-[600px] w-3/5 flex flex-col",
};

interface CourtCalendarProps {
  onSelectTimeSlot: (timeSlot: TimeSlot) => void;
  selectedDate: Date;
}

// Remove the hardcoded COURT_CONFIG and use the courts from data.ts
const getCourtConfig = (courtId: string) => {
  const court = getCourts().find(c => c.id === courtId);
  if (!court) return null;
  return court;
};

export default function CourtCalendar({ onSelectTimeSlot, selectedDate }: CourtCalendarProps) {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchTimeSlots = async () => {
    setLoading(true);
    try {
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      console.log("Fetching time slots for date:", formattedDate);
      const slots = await getTimeSlots(formattedDate);
      console.log("Fetched slots count:", slots.length);
      setAvailableSlots(slots);
    } catch (error) {
      console.error("Error fetching time slots:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeSlots();
  }, [selectedDate, refreshKey]);

  // Handle booking completion - refresh the time slots
  const handleSlotSelect = (slot: TimeSlot) => {
    onSelectTimeSlot(slot);
    // We'll refresh the slots after the booking dialog closes
    setTimeout(() => {
      setRefreshKey(prev => prev + 1);
    }, 2000);
  };

  // Function to check if a booking belongs to the current user
  const isUserBooking = (reservation: any) => {
    // For demo purposes, assuming the first 3 reservations are the user's
    return reservation && reservation.id && ['res1', 'res2', 'res3'].includes(reservation.id);
  };

  // Check if a time slot has a reservation
  const getReservationForSlot = (slotId: string) => {
    return reservations.find(r => r.timeSlotId === slotId);
  };

  // Check if a slot is booked by the current user
  const isSlotBookedByUser = (slotId: string) => {
    const reservation = getReservationForSlot(slotId);
    return reservation && isUserBooking(reservation);
  };

  // Filter slots by selected date
  const filteredSlots = availableSlots.filter(
    (slot) => slot.date === format(selectedDate, "yyyy-MM-dd")
  );

  // Group slots by court
  const slotsByCourtMap = filteredSlots.reduce((acc, slot) => {
    if (!acc[slot.courtId]) {
      acc[slot.courtId] = {
        courtId: slot.courtId,
        courtName: slot.courtName || "Unknown Court",
        slots: [],
      };
    }
    acc[slot.courtId].slots.push(slot);
    return acc;
  }, {} as Record<string, { courtId: string; courtName: string; slots: TimeSlot[] }>);

  const slotsByCourt = Object.values(slotsByCourtMap);

  // Get CSS class for court container based on orientation
  const getCourtContainerClass = (courtId: string) => {
    const courtConfig = getCourtConfig(courtId);
    if (!courtConfig) return "";
    
    if (courtConfig.orientation === 'vertical') {
      return courtStyles.vertical;
    }
    return courtStyles.horizontal;
  };

  // Get CSS class for time slot container based on court orientation
  const getTimeSlotContainerClass = (courtId: string) => {
    const courtConfig = getCourtConfig(courtId);
    if (!courtConfig) return "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2";
    
    if (courtConfig.orientation === 'vertical') {
      return "grid grid-cols-1 gap-2 flex-grow overflow-y-auto"; // Single column that fills available vertical space
    }
    return "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2"; // Multiple columns for horizontal courts
  };

  // Get orientation badge for court
  const getOrientationBadge = (courtId: string) => {
    const courtConfig = getCourtConfig(courtId);
    if (!courtConfig) return null;
    
    let badgeText = "Horizontal";
    if (courtConfig.orientation === 'vertical') {
      badgeText = `Vertical ${courtConfig.verticalAlignment === 'left' ? '(Left)' : '(Right)'}`;
    }
    
    return (
      <span className="bg-secondary text-white text-xs px-2 py-1 rounded-full">
        {badgeText}
      </span>
    );
  };

  // Get order class based on court placement
  const getCourtOrderClass = (courtId: string) => {
    const courtConfig = getCourtConfig(courtId);
    if (!courtConfig || !courtConfig.placement) return "";
    
    switch (courtConfig.placement) {
      case 'top-left': return 'order-1';
      case 'top-center': return 'order-2';
      case 'top-right': return 'order-3';
      case 'center-left': return 'order-4';
      case 'center': return 'order-5';
      case 'center-right': return 'order-6';
      case 'bottom-left': return 'order-7';
      case 'bottom-center': return 'order-8';
      case 'bottom-right': return 'order-9';
      default: return '';
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Available Time Slots</h2>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-muted-foreground">Loading time slots...</p>
          </div>
        ) : slotsByCourt.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {slotsByCourt.map((court) => (
              <div 
                key={court.courtId} 
                className={`${getCourtContainerClass(court.courtId)} ${getCourtOrderClass(court.courtId)} mb-6`}
              >
                <div className="bg-gradient-to-r from-blue-500 to-green-500 p-4 flex justify-between items-center rounded-t-lg">
                  <h3 className="font-medium text-white">{court.courtName}</h3>
                  <div className="flex space-x-2">
                    <span className="bg-secondary text-white text-xs px-2 py-1 rounded-full">Indoor</span>
                    {getOrientationBadge(court.courtId)}
                  </div>
                </div>
                <div className={`${getTimeSlotContainerClass(court.courtId)} bg-white p-4 rounded-b-lg border-x border-b`}>
                  {court.slots.map((slot) => {
                    const slotId = slot.id || `${slot.courtId}-${slot.date}-${slot.startTime}`;
                    return (
                      <Button
                        key={`${slotId}-${refreshKey}`}
                        onClick={() => slot.available && handleSlotSelect(slot)}
                        className={`court-slot h-16 flex flex-col items-center justify-center ${
                          // Check if slot has a reservation that belongs to the user
                          isSlotBookedByUser(slotId)
                            ? SLOT_COLORS.MY_BOOKING.BG + " " + SLOT_COLORS.MY_BOOKING.TEXT
                            : !slot.available || getReservationForSlot(slotId)
                              ? SLOT_COLORS.BOOKED.BG + " " + SLOT_COLORS.BOOKED.TEXT
                              : SLOT_COLORS.AVAILABLE.BG + " " + SLOT_COLORS.AVAILABLE.TEXT
                        }`}
                        variant="outline"
                      >
                        <span className="text-sm font-medium">
                          {slot.startTime} - {slot.endTime}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {isSlotBookedByUser(slotId)
                            ? SLOT_COLORS.MY_BOOKING.LABEL
                            : !slot.available || getReservationForSlot(slotId)
                              ? SLOT_COLORS.BOOKED.LABEL
                              : SLOT_COLORS.AVAILABLE.LABEL}
                        </span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No time slots available for the selected date.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 