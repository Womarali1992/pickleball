"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Users, Mail, Phone, Info, Star, Calendar as CalendarIcon } from "lucide-react";
import { format, addDays, subDays, startOfDay, parse, parseISO } from "date-fns";
import { TimeSlot, Court } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { useMediaQuery } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { specialTimeSlots } from "@/lib/data";
import { Reservation } from "@/lib/data";
import TimeSlotCell, { SlotStatus } from "./TimeSlotCell";
import SchedulerNav from "./SchedulerNav";
import { COLORS } from '@/lib/constants';
import { useSchedulerStatus } from "@/hooks/useSchedulerStatus";

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
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Add useEffect to handle mounting
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Use the hook to get the status calculation logic
  const { getStatus } = useSchedulerStatus(timeSlots, reservations);

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
    }
  };

  // Handle date click for day view
  const handleDateClick = (date: Date) => {
    if (onDateSelect) {
      onDateSelect(date);
    }
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
      <SchedulerNav 
        currentDate={currentDate}
        onPreviousDay={previousDay}
        onNextDay={nextDay}
        onToday={today}
        onSetSpecificDate={setSpecificDate}
      />
      
      <CardContent className="px-1 md:px-4 pb-2">
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
                  {isMounted ? format(day, isMobile ? "MMM d" : "EEEE, MMM d") : format(day, "MMM d")}
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
                        const alignmentClass =
                          court.orientation === "vertical"
                            ? court.verticalAlignment === "right"
                              ? "justify-end"
                              : "justify-start"
                            : "justify-start"; // Default horizontal alignment

                        // Use the function returned by the hook
                        const status = getStatus(court, day, hour);
                        const popoverId = `${court.id}-${format(day, 'yyyy-MM-dd')}-${hour}`;

                        return (
                          <div key={`${day}-${hour}`} className={`flex items-center ${alignmentClass} w-full h-full px-0.5`}>
                            <TimeSlotCell
                              court={court}
                              day={day}
                              hour={hour}
                              status={status}
                              popoverId={popoverId}
                              openPopoverId={openPopoverId}
                              togglePopover={togglePopover}
                              onScheduleCourt={onScheduleCourt}
                            />
                          </div>
                        );
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
                <div className={`w-3 h-3 rounded-sm ${COLORS.AVAILABLE.BG}`}></div>
                <span>{COLORS.AVAILABLE.LABEL}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-3 h-3 rounded-sm ${COLORS.BOOKED.BG}`}></div>
                <span>{COLORS.BOOKED.LABEL}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-3 h-3 rounded-sm ${COLORS.MY_BOOKING.BG}`}></div>
                <span>{COLORS.MY_BOOKING.LABEL}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-3 h-3 rounded-sm ${COLORS.BLOCKED.BG}`}></div>
                <span>{COLORS.BLOCKED.LABEL}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-3 h-3 rounded-sm ${COLORS.CLINIC.BG}`}></div>
                <span>{COLORS.CLINIC.LABEL}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SchedulerChart; 