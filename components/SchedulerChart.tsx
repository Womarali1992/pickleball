"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, Search, Users, Mail, Phone, Info } from "lucide-react";
import { format, addDays, subDays, startOfDay, parse, parseISO } from "date-fns";
import { TimeSlot, Court } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { useMediaQuery } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { specialTimeSlots } from "@/lib/data";
import { Reservation } from "@/lib/data";

// Hardcoded colors for scheduler cells
const SCHEDULER_COLORS = {
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
  MY_BOOKING: {
    BG: "bg-blue-700",
    TEXT: "text-white",
    LABEL: "Your Booking"
  },
  BLOCKED: {
    BG: "bg-blue-300",
    TEXT: "text-white",
    LABEL: "Blocked"
  }
};

interface SchedulerChartProps {
  courts: Court[];
  timeSlots: TimeSlot[];
  reservations?: Reservation[];
  onScheduleCourt: (court: Court) => void;
  onDateSelect?: (date: Date) => void;
}

const SchedulerChart = ({ courts, timeSlots, reservations = [], onScheduleCourt, onDateSelect }: SchedulerChartProps) => {
  const [currentDate, setCurrentDate] = useState<Date>(startOfDay(new Date()));
  const [viewDays, setViewDays] = useState<number>(3);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [searchDate, setSearchDate] = useState<string>("");
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Time range to display (8am to 10pm)
  const startHour = 8;
  const endHour = 22;
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);

  // Calculate days to display based on current date
  const daysToShow = Array.from({ length: viewDays }, (_, i) => addDays(currentDate, i));

  // Navigate through dates
  const previousDay = () => setCurrentDate(subDays(currentDate, 1));
  const nextDay = () => setCurrentDate(addDays(currentDate, 1));
  const today = () => setCurrentDate(startOfDay(new Date()));

  // Set a specific date from calendar
  const setSpecificDate = (date: Date | undefined) => {
    if (date) {
      setCurrentDate(startOfDay(date));
      setCalendarOpen(false);
    }
  };

  // Handle manual date input
  const handleSearchDate = () => {
    try {
      // Try to parse the entered date
      const date = parse(searchDate, "yyyy-MM-dd", new Date());
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date");
      }
      setCurrentDate(startOfDay(date));
      setSearchDate("");
    } catch (error) {
      console.error("Invalid date format. Please use YYYY-MM-DD");
      // Could add user feedback for invalid date format
    }
  };

  // Get availability for a specific court, day and hour
  const getSlotStatus = (court: Court, day: Date, hour: number) => {
    const formattedDate = format(day, "yyyy-MM-dd");
    
    // Format the hour as both "9:00" and "09:00" to catch all formats
    const hourString = `${hour}:00`;
    const paddedHourString = `${hour.toString().padStart(2, '0')}:00`;
    
    // Check in generated slots
    const relevantSlots = timeSlots.filter(
      slot => {
        // Check if this is the slot we're looking for
        const matchesCourtAndDate = slot.courtId === court.id && slot.date === formattedDate;
        
        // Check various time formats
        const slotHour = parseInt(slot.startTime.split(":")[0]);
        const matchesHour = slotHour === hour;
        const matchesExactTime = slot.startTime === hourString || slot.startTime === paddedHourString;
        
        return matchesCourtAndDate && (matchesHour || matchesExactTime);
      }
    );

    // Also check in special slots
    const specialSlot = specialTimeSlots.find(slot => 
      slot.courtId === court.id && 
      slot.date === formattedDate && 
      (slot.startTime === hourString || slot.startTime === paddedHourString || parseInt(slot.startTime.split(":")[0]) === hour)
    );
    
    // Check for reservations
    let reservation = null;
    if (relevantSlots.length > 0) {
      const slotId = relevantSlots[0].id;
      reservation = reservations.find(res => res.timeSlotId === slotId);
    }
    
    if (specialSlot) {
      // Check for special slot reservations
      const specialReservation = reservations.find(res => res.timeSlotId === specialSlot.id);
      return {
        available: specialSlot.available,
        reserved: !specialSlot.available,
        slot: specialSlot,
        reservation: specialReservation,
        reason: specialReservation ? `Reserved by ${specialReservation.playerName}` : specialSlot.reason || 'Reserved',
      };
    }

    if (relevantSlots.length === 0) {
      return { available: false, reserved: false, reason: 'Unavailable' };
    }

    const slot = relevantSlots[0];
    // Check if it's reserved (not available in our data model means it's either blocked or reserved)
    return {
      available: slot.available,
      reserved: !slot.available || !!reservation,
      slot: slot,
      reservation: reservation,
      reason: reservation ? `Reserved by ${reservation.playerName}` : slot.reason || (slot.available ? 'Available' : 'Reserved'),
    };
  };
  
  // Debug logging - log all time slots for today
  const currentFormattedDate = format(currentDate, "yyyy-MM-dd");
  const slotsForToday = timeSlots.filter(slot => slot.date === currentFormattedDate);
  console.log(`Time slots for ${currentFormattedDate}:`, slotsForToday);
  
  // Check for special slots
  const specialSlotsForToday = specialTimeSlots.filter(slot => slot.date === currentFormattedDate);
  if (specialSlotsForToday.length > 0) {
    console.log(`Special slots for ${currentFormattedDate}:`, specialSlotsForToday);
  }
  
  // Handle date click for day view
  const handleDateClick = (date: Date) => {
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  // Handle keyboard events for date input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchDate();
    }
  };

  // Function to check if a booking belongs to the current user
  // In a real app, this would check against the logged-in user's ID
  const isUserBooking = (reservation: any) => {
    // For demo purposes, assuming the first 3 reservations are the user's
    return reservation && reservation.id && ['res1', 'res2', 'res3'].includes(reservation.id);
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

  // Get cell background based on status
  const getCellBackground = (status: ReturnType<typeof getSlotStatus>) => {
    if (status.reservation && isUserBooking(status.reservation)) {
      return `${SCHEDULER_COLORS.MY_BOOKING.BG} ${SCHEDULER_COLORS.MY_BOOKING.TEXT}`;
    } else if (status.available) {
      return `${SCHEDULER_COLORS.AVAILABLE.BG} ${SCHEDULER_COLORS.AVAILABLE.TEXT}`;
    } else if (status.reserved) {
      return `${SCHEDULER_COLORS.BOOKED.BG} ${SCHEDULER_COLORS.BOOKED.TEXT}`;
    } else {
      return `${SCHEDULER_COLORS.BLOCKED.BG} ${SCHEDULER_COLORS.BLOCKED.TEXT}`;
    }
  };

  // Apply consistent cell styling for all courts regardless of orientation
  const cellClass = "h-6 rounded-sm flex items-center px-1 text-xs court-slot";

  // Replace the court slot rendering with this:
  const renderCourtSlot = (court: Court, day: Date, hour: number) => {
    const status = getSlotStatus(court, day, hour);
    const bgClass = getCellBackground(status);
    const popoverId = `${court.id}-${format(day, 'yyyy-MM-dd')}-${hour}`;
    
    if (status.reservation) {
      return (
        <Popover open={openPopoverId === popoverId} onOpenChange={() => togglePopover(popoverId)}>
          <PopoverTrigger asChild>
            <div
              className={`${cellClass} cursor-pointer justify-between px-2 ${bgClass}`}
            >
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {`${hour}:00`}
              </div>
              <Info className="h-3 w-3" />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-4">
            <div className="space-y-3">
              <div className="border-b pb-2">
                <h4 className="font-semibold text-sm">Booking Details</h4>
              </div>
              
              <div className="flex items-start space-x-2">
                <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium text-sm">{status.reservation.playerName}</div>
                  <div className="text-xs text-muted-foreground">
                    {status.reservation.players} player{status.reservation.players !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{status.reservation.playerEmail}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{formatPhone(status.reservation.playerPhone)}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">
                  <span>{format(parseISO(status.reservation.createdAt), "MMM d, yyyy")}</span>
                  <Badge className="ml-2 text-xs" variant={
                    status.reservation.status === "confirmed" ? "success" :
                    status.reservation.status === "completed" ? "default" : "destructive"
                  }>
                    {status.reservation.status}
                  </Badge>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <Button size="sm" variant="outline">Edit</Button>
                <Button size="sm" variant="destructive">Cancel</Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      );
    } else {
      return (
        <div
          className={`${cellClass} ${bgClass}`}
          onClick={() => onScheduleCourt(court)}
          title={status.reason}
        >
          <Clock className="h-3 w-3 mr-1" />
          {`${hour}:00`}
        </div>
      );
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
          
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <CalendarIcon className="h-4 w-4 mr-1" />
                Calendar
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={currentDate}
                onSelect={setSpecificDate}
                initialFocus
                fromYear={2024}
                toYear={2030}
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      
      <CardContent className="px-1 md:px-4 pb-2">
        {/* Date search form */}
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Search date (YYYY-MM-DD)"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-9"
          />
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleSearchDate}
            className="whitespace-nowrap"
          >
            <Search className="h-4 w-4 mr-1" />
            Go to Date
          </Button>
        </div>
        
        {/* Current date display */}
        <div className="mb-4 text-center">
          <h3 className="text-lg font-semibold">
            {format(currentDate, "EEEE, MMMM d, yyyy")}
          </h3>
        </div>
      
        <div className="overflow-x-auto">
          <div className="min-w-max relative">
            {/* Time header */}
            <div
              className="grid"
              style={{
                gridTemplateColumns: `150px repeat(${viewDays}, 1fr)`,
              }}
            >
              {/* Empty cell for court names */}
              <div className="border-b border-border/30 p-2"></div>

              {/* Date headers - now clickable */}
              {daysToShow.map((day) => (
                <Button 
                  key={day.toString()}
                  variant="ghost"
                  className="border-b border-border/30 p-2 text-center font-medium text-foreground hover:bg-primary/10"
                  onClick={() => handleDateClick(day)}
                >
                  {format(day, isMobile ? "MMM d" : "EEEE, MMM d")}
                </Button>
              ))}
            </div>

            {/* Court rows */}
            {courts.map((court) => (
              <div
                key={court.id}
                className="grid"
                style={{
                  gridTemplateColumns: `150px repeat(${viewDays}, 1fr)`,
                }}
              >
                {/* Court name */}
                <div className="border-b border-border/30 p-2 flex flex-col justify-center">
                  <span className="font-medium text-foreground">{court.name}</span>
                  <div className="flex flex-col gap-1 mt-1">
                    <Badge
                      variant={court.indoor ? "secondary" : "outline"}
                      className={cn(
                        "text-xs",
                        court.indoor ? "bg-secondary/20" : "border-primary/20"
                      )}
                    >
                      {court.indoor ? "Indoor" : "Outdoor"}
                    </Badge>
                  </div>
                </div>

                {/* Day cells */}
                {daysToShow.map((day) => (
                  <div key={`${court.id}-${day.toString()}`} className="border-b border-border/30 p-2">
                    <div className="space-y-1">
                      {hours.map((hour) => {
                        return renderCourtSlot(court, day, hour);
                      })}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onScheduleCourt(court)}
                      className="w-full mt-2 text-xs h-7"
                    >
                      Schedule
                    </Button>
                  </div>
                ))}
              </div>
            ))}

            {/* Legend */}
            <div className="flex items-center justify-end gap-3 mt-4 text-xs">
              <div className="flex items-center gap-1">
                <div className={`w-3 h-3 rounded-sm ${SCHEDULER_COLORS.AVAILABLE.BG}`}></div>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-3 h-3 rounded-sm ${SCHEDULER_COLORS.BOOKED.BG}`}></div>
                <span>Booked</span>
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-3 h-3 rounded-sm ${SCHEDULER_COLORS.MY_BOOKING.BG}`}></div>
                <span>My Booking</span>
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-3 h-3 rounded-sm ${SCHEDULER_COLORS.BLOCKED.BG}`}></div>
                <span>Unavailable</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SchedulerChart; 