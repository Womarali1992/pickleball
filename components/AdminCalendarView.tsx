"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { reservations, courts, timeSlots } from "@/lib/data";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay } from "date-fns";
import DateDetailModal from "@/components/DateDetailModal";

const AdminCalendarView = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  // Get calendar days for current month view
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Function to get day of week (0 = Sunday, 6 = Saturday)
  const getStartingDayOfWeek = () => {
    return getDay(monthStart);
  };
  
  // Get reservations for the current month
  const monthReservations = reservations.filter(reservation => {
    const timeSlot = timeSlots.find(ts => ts.id === reservation.timeSlotId);
    if (!timeSlot) return false;
    
    const reservationDate = new Date(timeSlot.date);
    return reservationDate >= monthStart && reservationDate <= monthEnd;
  });
  
  // Group reservations by date
  const reservationsByDate: Record<string, typeof reservations> = {};
  
  monthReservations.forEach(reservation => {
    const timeSlot = timeSlots.find(ts => ts.id === reservation.timeSlotId);
    if (!timeSlot) return;
    
    if (!reservationsByDate[timeSlot.date]) {
      reservationsByDate[timeSlot.date] = [];
    }
    
    reservationsByDate[timeSlot.date].push(reservation);
  });
  
  const navigateMonth = (direction: 'previous' | 'next') => {
    setCurrentMonth(direction === 'previous' 
      ? subMonths(currentMonth, 1) 
      : addMonths(currentMonth, 1)
    );
  };
  
  // Generate empty cells for days before the first day of the month
  const startingDayOfWeek = getStartingDayOfWeek();
  const emptyCells = Array.from({ length: startingDayOfWeek }, (_, index) => (
    <div key={`empty-${index}`} className="h-24 border border-border/40 bg-background/50"></div>
  ));
  
  return (
    <>
      <Card className="border border-border/50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-lg shadow-primary/5">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigateMonth('previous')}
                className="border-primary/20 hover:bg-primary/10"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigateMonth('next')}
                className="border-primary/20 hover:bg-primary/10"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
          
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-medium py-2 text-sm">
                {day}
              </div>
            ))}
            
            {/* Empty cells for days before month start */}
            {emptyCells}
            
            {/* Calendar days */}
            {calendarDays.map(day => {
              const dateString = format(day, "yyyy-MM-dd");
              const dayReservations = reservationsByDate[dateString] || [];
              const isToday = isSameDay(day, new Date());
              
              return (
                <div 
                  key={dateString} 
                  onClick={() => setSelectedDate(dateString)}
                  className={`h-24 border border-border/40 p-1 overflow-hidden transition-all 
                    hover:bg-primary/5 cursor-pointer 
                    ${isToday ? 'bg-primary/10 border-primary/30' : 'bg-background/50'}`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-sm font-medium ${isToday ? 'text-primary' : ''}`}>
                      {format(day, "d")}
                    </span>
                    
                    {dayReservations.length > 0 && (
                      <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-primary/20 text-primary">
                        {dayReservations.length}
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-1 space-y-1">
                    {dayReservations.slice(0, 2).map(reservation => {
                      const court = courts.find(c => c.id === reservation.courtId);
                      const timeSlot = timeSlots.find(ts => ts.id === reservation.timeSlotId);
                      
                      return (
                        <div 
                          key={reservation.id} 
                          className="text-xs truncate p-1 rounded bg-primary/10 border border-primary/20"
                          title={`${reservation.playerName} - ${court?.name} (${timeSlot?.startTime})`}
                        >
                          {timeSlot?.startTime} • {court?.name.split(' ')[1]}
                        </div>
                      );
                    })}
                    
                    {dayReservations.length > 2 && (
                      <div className="text-xs text-muted-foreground truncate">
                        +{dayReservations.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Date Detail Modal */}
      {selectedDate && (
        <DateDetailModal
          open={!!selectedDate}
          date={selectedDate}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </>
  );
};

export default AdminCalendarView; 