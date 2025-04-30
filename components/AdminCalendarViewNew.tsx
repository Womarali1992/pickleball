"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Calendar as CalendarIcon, LayoutList } from "lucide-react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { timeSlots, courts, reservations } from "@/lib/data";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ReservationForm from "@/components/ReservationForm";
import { TimeSlot } from "@/lib/types";

const AdminCalendarViewNew = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);

  // Get slots based on view mode
  const getFilteredSlots = () => {
    if (viewMode === "month") {
      // Month view - only show slots for the selected date
      return timeSlots.filter(
        (slot) => slot.date === format(selectedDate, "yyyy-MM-dd")
      );
    } else {
      // Week view - show slots for the entire week
      const weekStart = startOfWeek(selectedDate);
      const weekDates = Array.from({ length: 7 }, (_, i) => 
        format(addDays(weekStart, i), "yyyy-MM-dd")
      );
      return timeSlots.filter((slot) => weekDates.includes(slot.date));
    }
  };

  const slotsForView = getFilteredSlots();

  // Check if a slot is reserved
  const isSlotReserved = (slotId: string) => {
    return reservations.some((res) => res.timeSlotId === slotId);
  };

  const getSlotColor = (slotId: string, available: boolean) => {
    if (!available) return "bg-gray-200 text-gray-700"; // Blocked with better contrast
    if (isSlotReserved(slotId)) return "bg-secondary/20 text-secondary-foreground"; // Reserved with better contrast
    return "bg-primary/20 text-primary-foreground"; // Available with better contrast
  };

  // Group slots by date for week view
  const slotsByDate = slotsForView.reduce((acc, slot) => {
    acc[slot.date] = acc[slot.date] || [];
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, typeof timeSlots>);

  // Render day header for week view
  const renderDayHeader = (date: string) => {
    const dayDate = new Date(date);
    const isToday = isSameDay(dayDate, new Date());
    return (
      <div className={`text-sm font-medium ${isToday ? "text-primary" : ""}`}>
        {format(dayDate, "EEE")}
        <span className="block text-xs">{format(dayDate, "MMM d")}</span>
      </div>
    );
  };

  const handleSelectTimeSlot = (slot: TimeSlot) => {
    if (slot.available && !isSlotReserved(slot.id)) {
      setSelectedTimeSlot(slot);
    }
  };

  const handleCancelReservation = () => {
    setSelectedTimeSlot(null);
  };

  const handleCompleteReservation = (reservationId: string) => {
    setSelectedTimeSlot(null);
    // Optionally refresh data or show confirmation
    alert(`Reservation created with ID: ${reservationId}`);
  };

  // Get the CSS class for court container based on placement
  const getCourtPlacementClass = (placement?: string) => {
    switch (placement) {
      case 'top-left': return 'order-1';
      case 'top-center': return 'order-2';
      case 'top-right': return 'order-3';
      case 'center-left': return 'order-4';
      case 'center': return 'order-5';
      case 'center-right': return 'order-6';
      case 'bottom-left': return 'order-7';
      case 'bottom-center': return 'order-8';
      case 'bottom-right': return 'order-9';
      default: return 'order-5'; // Default to center
    }
  };

  // Get the CSS classes for a court based on its orientation
  const getCourtOrientationClasses = (orientation?: string) => {
    if (orientation === 'vertical') {
      return "aspect-[9/20] flex flex-col";
    }
    return "aspect-[20/9] flex flex-row"; // horizontal (default)
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">
          Calendar View
        </h2>
        <div className="flex items-center gap-4">
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(value) => value && setViewMode(value as "month" | "week")}
            className="border border-input rounded-md glass-card"
          >
            <ToggleGroupItem value="month" aria-label="Month view" className="hover:bg-primary/10 transition-colors rounded-md p-1">
              <CalendarIcon className="h-4 w-4 text-foreground" />
            </ToggleGroupItem>
            <ToggleGroupItem value="week" aria-label="Week view" className="hover:bg-primary/10 transition-colors rounded-md p-1">
              <LayoutList className="h-4 w-4 text-foreground" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        <Card className="border border-input rounded-md shadow-sm glass-card">
          <div className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="pointer-events-auto"
            />
          </div>
        </Card>

        <Card className="border border-input rounded-md shadow-sm glass-card">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4 text-foreground">
              {viewMode === "month" 
                ? format(selectedDate, "EEEE, MMMM d, yyyy")
                : `Week of ${format(startOfWeek(selectedDate), "MMMM d, yyyy")}`}
            </h3>
            
            {viewMode === "month" ? (
              // Month view
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {courts.map((court) => {
                  const courtSlots = slotsForView.filter(
                    (slot) => slot.courtId === court.id
                  );

                  return (
                    <div 
                      key={court.id} 
                      className={`space-y-2 ${getCourtPlacementClass(court.placement)}`}
                    >
                      <h4 className="font-medium text-foreground">
                        {court.name} 
                        <span className="text-xs ml-2 text-muted-foreground">
                          ({court.orientation === 'vertical' ? 'Portrait' : 'Landscape'})
                        </span>
                      </h4>
                      <div className={`border border-dashed border-border p-3 rounded-md ${getCourtOrientationClasses(court.orientation)}`}>
                        <div className={`grid ${court.orientation === 'vertical' ? 'grid-cols-1 grid-rows-6' : 'grid-cols-6 grid-rows-1'} gap-2 w-full h-full`}>
                          {courtSlots.slice(0, 6).map((slot) => (
                            <Button
                              key={slot.id}
                              variant="outline"
                              className={`${court.orientation === 'vertical' ? 'h-14' : 'w-full'} flex flex-col items-center justify-center ${getSlotColor(
                                slot.id,
                                slot.available
                              )} rounded-md transition-all duration-300`}
                            >
                              <span className="text-sm font-medium">
                                {slot.startTime}
                              </span>
                              <span className="text-xs">
                                {isSlotReserved(slot.id)
                                  ? "Reserved"
                                  : slot.available
                                  ? "Available"
                                  : "Blocked"}
                              </span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Week view
              <div className="overflow-x-auto">
                <div className="space-y-6 min-w-[768px]">
                  {courts.map((court) => (
                    <div 
                      key={court.id} 
                      className={`space-y-2 ${getCourtPlacementClass(court.placement)}`}
                    >
                      <h4 className="font-medium text-foreground">
                        {court.name}
                        <span className="text-xs ml-2 text-muted-foreground">
                          ({court.orientation === 'vertical' ? 'Portrait' : 'Landscape'})
                        </span>
                      </h4>
                      <div className="grid grid-cols-7 gap-2">
                        {/* Day headers */}
                        {Object.keys(slotsByDate).sort().map((date) => (
                          <div key={`header-${date}`} className="text-center py-1">
                            {renderDayHeader(date)}
                          </div>
                        ))}
                        
                        {/* Time slots for each day */}
                        {Object.keys(slotsByDate).sort().map((date) => {
                          const daySlots = slotsByDate[date].filter(
                            slot => slot.courtId === court.id
                          );
                          
                          return (
                            <div key={`slots-${date}`} className="space-y-1">
                              {daySlots.map((slot) => (
                                <Button
                                  key={slot.id}
                                  variant="outline"
                                  className={`h-12 w-full flex flex-col items-center justify-center ${getSlotColor(
                                    slot.id,
                                    slot.available
                                  )} rounded-md transition-all duration-300`}
                                >
                                  <span className="text-xs font-medium">
                                    {slot.startTime}
                                  </span>
                                  <span className="text-xs">
                                    {isSlotReserved(slot.id)
                                      ? "Reserved"
                                      : slot.available
                                      ? "Available"
                                      : "Blocked"}
                                  </span>
                                </Button>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
      
      <Dialog open={selectedTimeSlot !== null} onOpenChange={(open) => !open && setSelectedTimeSlot(null)}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedTimeSlot && (
            <ReservationForm
              selectedTimeSlot={selectedTimeSlot}
              onCancel={handleCancelReservation}
              onComplete={handleCompleteReservation}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCalendarViewNew; 