"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock, Users, Mail, Phone, Calendar, Info } from "lucide-react";
import { format, addDays, subDays, startOfDay, parseISO } from "date-fns";
import { TimeSlot, Court } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Reservation } from "@/lib/data";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Hardcoded colors for day schedule view
const DAY_COLORS = {
  AVAILABLE: {
    BG: "bg-green-500",
    TEXT: "text-white",
    LABEL: "Available"
  },
  BOOKED: {
    BG: "bg-blue-500",
    TEXT: "text-white",
    LABEL: "Booked"
  },
  BLOCKED: {
    BG: "bg-gray-300",
    TEXT: "text-white",
    LABEL: "Blocked"
  }
};

interface DayScheduleViewProps {
  courts: Court[];
  timeSlots: TimeSlot[];
  reservations: Reservation[];
  onScheduleCourt: (court: Court) => void;
  onDateSelect?: (date: Date) => void;
}

const DayScheduleView = ({ 
  courts, 
  timeSlots, 
  reservations, 
  onScheduleCourt,
  onDateSelect
}: DayScheduleViewProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);

  // Time range to display (8am to 10pm)
  const startHour = 8;
  const endHour = 22;
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);

  // Navigate through dates
  const previousDay = () => {
    const newDate = subDays(selectedDate, 1);
    setSelectedDate(newDate);
    if (onDateSelect) onDateSelect(newDate);
  };
  
  const nextDay = () => {
    const newDate = addDays(selectedDate, 1);
    setSelectedDate(newDate);
    if (onDateSelect) onDateSelect(newDate);
  };
  
  const today = () => {
    const newDate = startOfDay(new Date());
    setSelectedDate(newDate);
    if (onDateSelect) onDateSelect(newDate);
  };

  // Function to check if a booking belongs to the current user
  // In a real app, this would check against the logged-in user's ID
  const isUserBooking = (reservation: any) => {
    // For demo purposes, assuming the first 3 reservations are the user's
    return reservation && reservation.id && ['res1', 'res2', 'res3'].includes(reservation.id);
  };

  // Get availability for a specific court, day and hour
  const getSlotDetails = (court: Court, hour: number) => {
    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    const relevantSlots = timeSlots.filter(
      slot =>
        slot.courtId === court.id &&
        slot.date === formattedDate &&
        parseInt(slot.startTime.split(":")[0]) === hour
    );

    if (relevantSlots.length === 0) return { available: false, reserved: false, reservation: null, reason: "Not Available" };

    const slot = relevantSlots[0];
    // Find if there's a reservation for this slot
    const reservation = reservations.find(res => res.timeSlotId === slot.id);
    
    // Determine reason based on availability and reservation status
    let reason = "Available";
    if (!slot.available) {
      reason = "Blocked by admin";
    }
    if (reservation) {
      reason = `Reserved by ${reservation.playerName}`;
    }
    
    return {
      available: slot.available,
      reserved: !slot.available || !!reservation,
      slot: slot,
      reservation: reservation || null,
      reason: slot.reason || reason,
    };
  };

  // Get CSS class for time slot container based on court orientation
  const getTimeSlotContainerClass = (court: Court) => {
    // Use a consistent single column layout for all courts
    return "space-y-1";
  };

  // Format phone number nicely
  const formatPhone = (phone: string) => {
    return phone; // Keep as is, or implement formatting if needed
  };

  // Handle toggling the popover
  const togglePopover = (slotId: string) => {
    if (openPopoverId === slotId) {
      setOpenPopoverId(null);
    } else {
      setOpenPopoverId(slotId);
    }
  };

  return (
    <Card className="gradient-card overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg md:text-xl font-bold text-foreground">
          Schedule | Court Schedule
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={previousDay}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={today}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={nextDay}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="space-y-4">
          <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <div className="flex items-center space-x-2">
              <button
                onClick={previousDay}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h3 className="text-center font-medium py-2 text-sm">
                {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </h3>
              <button
                onClick={nextDay}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div className={`w-4 h-4 rounded-sm ${DAY_COLORS.AVAILABLE.BG}`}></div>
                <span className="text-xs">Available</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className={`w-4 h-4 rounded-sm ${DAY_COLORS.BOOKED.BG}`}></div>
                <span className="text-xs">Booked</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className={`w-4 h-4 rounded-sm ${DAY_COLORS.BLOCKED.BG}`}></div>
                <span className="text-xs">Blocked</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {courts.map(court => (
              <div
                key={court.id}
                className="border rounded-lg shadow-sm overflow-hidden"
              >
                <div className="bg-gray-100 p-3 font-medium border-b flex justify-between items-center">
                  <span>{court.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {court.indoor ? 'Indoor' : 'Outdoor'}
                  </Badge>
                </div>
                <div className="p-3">
                  <div className="space-y-2">
                    {hours.map(hour => {
                      const slotDetails = getSlotDetails(court, hour);
                      const popoverId = `${court.id}-${hour}`;
                      
                      // Use consistent styling across both components
                      let bgClass = "";
                      if (slotDetails.available && !slotDetails.reserved) {
                        bgClass = `${DAY_COLORS.AVAILABLE.BG} ${DAY_COLORS.AVAILABLE.TEXT}`;
                      } else if (slotDetails.reservation) {
                        bgClass = `${DAY_COLORS.BOOKED.BG} ${DAY_COLORS.BOOKED.TEXT}`;
                      } else {
                        bgClass = `${DAY_COLORS.BLOCKED.BG} ${DAY_COLORS.BLOCKED.TEXT}`;
                      }
                      
                      return (
                        <div
                          key={popoverId}
                          className={`h-16 w-full rounded-md ${bgClass} flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity`}
                          onClick={() => togglePopover(popoverId)}
                        >
                          <div className="flex items-center justify-between w-full px-4">
                            <span className="text-sm font-medium">
                              {`${hour}:00`}
                            </span>
                            <span className="text-sm font-medium">
                              {slotDetails.available && !slotDetails.reserved
                                ? "Available"
                                : slotDetails.reservation
                                ? "Booked"
                                : "Blocked"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DayScheduleView; 