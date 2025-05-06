"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SchedulerChart from "@/components/SchedulerChart";
import DayScheduleView from "@/components/DayScheduleView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { getCourts, timeSlots, reservations } from "@/lib/data";
import { format, startOfDay, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay } from "date-fns";
import ScheduleCourtForm from "@/components/ScheduleCourtForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Define gradient colors for each day
const DAY_GRADIENTS = {
  0: "from-blue-600 to-blue-500", // Sunday
  1: "from-blue-500 to-blue-400",
  2: "from-blue-400 to-blue-300",
  3: "from-blue-300 to-green-300",
  4: "from-green-300 to-green-400",
  5: "from-green-400 to-green-500",
  6: "from-green-500 to-green-600", // Saturday
};

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(() => startOfDay(new Date()));
  const [viewMode, setViewMode] = useState<"overview" | "day" | "calendar">("overview");
  const [schedulingCourt, setSchedulingCourt] = useState<any>(null);
  const [courtsList, setCourtsList] = useState(() => getCourts());
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [isMounted, setIsMounted] = useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const handleScheduleCourt = (court: any) => {
    setSchedulingCourt(court);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setViewMode("day");
  };

  const formattedDate = isMounted ? format(selectedDate, "MMMM d, yyyy") : format(startOfDay(new Date()), "MMMM d, yyyy");

  // Get calendar days for current month view
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Function to get day of week (0 = Sunday, 6 = Saturday)
  const getStartingDayOfWeek = () => {
    return getDay(monthStart);
  };

  // Get available slots for a specific date
  const getAvailableSlotsForDate = (date: Date) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    return timeSlots.filter(slot => 
      slot.date === formattedDate && 
      slot.available && 
      !reservations.some(res => res.timeSlotId === slot.id)
    ).length;
  };

  // Navigate through months
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
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-center font-medium py-2 text-sm">
            Schedule | Court Schedule
          </h1>
          <p className="text-muted-foreground text-center">
            View and reserve pickleball courts
          </p>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <Card
              key={day}
              className="cursor-pointer transition-all hover:shadow-md"
            >
              <CardContent className={`p-2 text-center bg-gradient-to-br ${DAY_GRADIENTS[index as keyof typeof DAY_GRADIENTS]} text-white rounded-md`}>
                <div className="text-xs font-medium text-white">
                  {day}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-between items-center mb-6">
          <Tabs
            defaultValue="overview"
            value={viewMode}
            onValueChange={(value) => setViewMode(value as "overview" | "day" | "calendar")}
            className="w-full"
          >
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="day">
                Day View {viewMode === "day" && `(${formattedDate})`}
              </TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-0">
              <SchedulerChart
                courts={courtsList}
                timeSlots={timeSlots}
                reservations={reservations}
                onScheduleCourt={handleScheduleCourt}
                onDateSelect={handleDateSelect}
              />
            </TabsContent>

            <TabsContent value="day" className="mt-0">
              <DayScheduleView
                courts={courtsList}
                timeSlots={timeSlots}
                reservations={reservations}
                onScheduleCourt={handleScheduleCourt}
                onDateSelect={setSelectedDate}
              />
            </TabsContent>

            <TabsContent value="calendar" className="mt-0">
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
                      const availableSlots = getAvailableSlotsForDate(day);
                      const isToday = isSameDay(day, new Date());
                      
                      return (
                        <div 
                          key={dateString} 
                          onClick={() => handleDateSelect(day)}
                          className={`h-24 border border-border/40 p-1 overflow-hidden transition-all 
                            hover:bg-primary/5 cursor-pointer 
                            ${isToday ? 'bg-primary/10 border-primary/30' : 'bg-background/50'}`}
                        >
                          <div className="flex flex-col h-full">
                            <span className={`text-sm font-medium ${isToday ? 'text-primary' : ''}`}>
                              {format(day, "d")}
                            </span>
                            
                            {availableSlots > 0 && (
                              <div className="flex-1 flex items-center justify-center">
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-primary">
                                    {availableSlots}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    slots available
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Court Scheduling Dialog */}
        {schedulingCourt && (
          <Dialog open={!!schedulingCourt} onOpenChange={(open) => !open && setSchedulingCourt(null)}>
            <DialogContent>
              <ScheduleCourtForm
                court={schedulingCourt}
                isOpen={!!schedulingCourt}
                onClose={() => setSchedulingCourt(null)}
                onSave={handleScheduleCourt}
              />
            </DialogContent>
          </Dialog>
        )}
      </main>
      <Footer />
    </div>
  );
} 