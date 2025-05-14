"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { format, addDays, subDays, startOfDay } from "date-fns";
import { TimeSlot, Court } from "@/lib/types";
import { Reservation } from "@/lib/data";
import { useSchedulerStatus } from "@/hooks/useSchedulerStatus";
import DayViewNav from "./DayViewNav";
import DayViewCourtCard from "./DayViewCourtCard";
import TimeSlotCell from "./TimeSlotCell";

interface DayScheduleViewProps {
  courts: Court[];
  timeSlots: TimeSlot[];
  reservations: Reservation[];
  onScheduleCourt: (court: Court) => void;
  onDateSelect: (date: Date) => void;
  isAdmin?: boolean;
}

const DayScheduleView = ({ 
  courts, 
  timeSlots, 
  reservations, 
  onScheduleCourt,
  onDateSelect,
  isAdmin = false
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
        <div className="overflow-x-auto">
          <div className="min-w-max">
            {/* Time header */}
            <div className="grid" style={{ gridTemplateColumns: `150px repeat(${courts.length}, 1fr)` }}>
              {/* Empty cell for court names */}
              <div className="border-b border-border/30 p-2"></div>

              {/* Court headers */}
              {courts.map((court) => (
                <div key={court.id} className="border-b border-border/30 p-2 text-center">
                  <span className="font-medium">{court.name}</span>
                </div>
              ))}
            </div>

            {/* Time slots */}
            {hours.map((hour) => (
              <div key={hour} className="grid" style={{ gridTemplateColumns: `150px repeat(${courts.length}, 1fr)` }}>
                {/* Time label */}
                <div className="border-b border-border/30 p-2 flex items-center">
                  <span className="text-sm font-medium">{`${hour}:00`}</span>
                </div>

                {/* Court cells */}
                {courts.map((court) => {
                  const status = getStatus(court, selectedDate, hour);
                  const popoverId = `${court.id}-${format(selectedDate, 'yyyy-MM-dd')}-${hour}`;

                  return (
                    <div key={`${court.id}-${hour}`} className="border-b border-border/30 p-2">
                      <TimeSlotCell
                        court={court}
                        day={selectedDate}
                        hour={hour}
                        status={status}
                        popoverId={popoverId}
                        openPopoverId={openPopoverId}
                        togglePopover={togglePopover}
                        onScheduleCourt={onScheduleCourt}
                        isAdmin={isAdmin}
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DayScheduleView; 