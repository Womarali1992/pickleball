"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { format, addDays, subDays, startOfDay } from "date-fns";
import { TimeSlot, Court } from "@/lib/types";
import { Reservation } from "@/lib/data";
import { useSchedulerStatus } from "@/hooks/useSchedulerStatus";
import DayViewNav from "./DayViewNav";
import DayViewCourtCard from "./DayViewCourtCard";

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
  const [selectedDate, setSelectedDate] = useState<Date>(() => startOfDay(new Date()));
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const { getStatus } = useSchedulerStatus(timeSlots, reservations);

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
      <DayViewNav 
        selectedDate={selectedDate}
        onPreviousDay={previousDay}
        onNextDay={nextDay}
        onToday={today}
        title="Day View"
      />
      
      <CardContent className="px-4 pb-4">
        <div className="grid grid-cols-1 gap-4">
            {courts.map(court => (
                <DayViewCourtCard 
                    key={court.id}
                    court={court}
                    selectedDate={selectedDate}
                    hours={hours}
                    getStatus={getStatus}
                    openPopoverId={openPopoverId}
                    togglePopover={togglePopover}
                    onScheduleCourt={onScheduleCourt}
                />
            ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DayScheduleView; 