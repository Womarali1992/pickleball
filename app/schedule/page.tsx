"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SchedulerChart from "@/components/SchedulerChart";
import DayScheduleView from "@/components/DayScheduleView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { getCourts, timeSlots as initialTimeSlots, reservations } from "@/lib/data";
import { format, startOfDay, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay } from "date-fns";
import ScheduleCourtForm from "@/components/ScheduleCourtForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ScheduleClinicForm from "@/components/coaches/ScheduleClinicForm";
import { dbService } from "@/lib/db-service";

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
  const [isClinicSchedulingOpen, setIsClinicSchedulingOpen] = useState(false);
  const [selectedClinicData, setSelectedClinicData] = useState<{
    court: any;
    date: Date;
    timeSlot: string;
  } | null>(null);
  const [isAdmin] = useState(false);
  const [timeSlots, setTimeSlots] = useState(() => initialTimeSlots);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const handleScheduleCourt = (court: any) => {
    console.log('SchedulePage: handleScheduleCourt called with:', { 
      court, 
      isAdmin,
      selectedDate: court.selectedDate || selectedDate,
      selectedTime: court.selectedTime
    });
    
    if (isAdmin) {
      const selectedDate = court.selectedDate || selectedDate;
      const selectedTime = court.selectedTime || `${selectedDate.getHours()}:00`;
      
      console.log('SchedulePage: Opening clinic scheduling with:', {
        court,
        date: selectedDate,
        timeSlot: selectedTime
      });

      setSelectedClinicData({
        court,
        date: selectedDate,
        timeSlot: selectedTime
      });
      setIsClinicSchedulingOpen(true);
    } else {
      // Directly set the scheduling court without showing days form
      setSchedulingCourt({
        ...court,
        selectedDate: court.selectedDate || selectedDate,
        selectedTime: court.selectedTime || `${selectedDate.getHours()}:00`
      });
    }
  };

  const handleScheduleClinic = async (date: Date, timeSlots: string[], courtId: string) => {
    console.log('SchedulePage: handleScheduleClinic called with:', { date, timeSlots, courtId });
    // Here you would implement the logic to create a new clinic
    setIsClinicSchedulingOpen(false);
    setSelectedClinicData(null);
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

  // Add useEffect to monitor state changes
  React.useEffect(() => {
    console.log('SchedulePage state updated:', {
      isClinicSchedulingOpen,
      selectedClinicData,
      isAdmin
    });
  }, [isClinicSchedulingOpen, selectedClinicData, isAdmin]);

  useEffect(() => {
    // Load clinics and update time slots
    const loadClinics = () => {
      try {
        console.log('Loading clinics in SchedulePage');
        const updatedClinicSlots = dbService.updateClinicTimeSlots();
        console.log('Updated clinic slots:', updatedClinicSlots);
        
        // Update time slots with clinic slots
        const currentSlots = timeSlots;
        const nonClinicSlots = currentSlots.filter(slot => !slot.id?.startsWith('clinic-'));
        const combinedSlots = [...nonClinicSlots, ...updatedClinicSlots];
        console.log('Combined slots:', combinedSlots);
        setTimeSlots(combinedSlots);
      } catch (error) {
        console.error('Error loading clinics:', error);
      }
    };
    
    loadClinics();
    
    // Listen for time slots updates
    const handleTimeSlotsUpdate = (event: CustomEvent) => {
      console.log('Time slots update event received:', event.detail);
      setTimeSlots(event.detail.timeSlots);
    };
    
    window.addEventListener('timeSlotsUpdated', handleTimeSlotsUpdate as EventListener);
    
    return () => {
      window.removeEventListener('timeSlotsUpdated', handleTimeSlotsUpdate as EventListener);
    };
  }, []);

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
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => {
            // Calculate the date for this day of the week
            const today = new Date();
            const currentDayOfWeek = today.getDay();
            const diff = index - currentDayOfWeek;
            const date = new Date(today);
            date.setDate(today.getDate() + diff);
            
            return (
              <Card
                key={day}
                className="cursor-pointer transition-all hover:shadow-md"
                onClick={() => {
                  setSelectedDate(date);
                  setViewMode("day");
                }}
              >
                <CardContent className={`p-2 text-center bg-gradient-to-br ${DAY_GRADIENTS[index as keyof typeof DAY_GRADIENTS]} text-white rounded-md`}>
                  <div className="text-xs font-medium text-white">
                    {day}
                  </div>
                </CardContent>
              </Card>
            );
          })}
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
                isAdmin={isAdmin}
              />
            </TabsContent>

            <TabsContent value="day" className="mt-0">
              <DayScheduleView
                courts={courtsList}
                timeSlots={timeSlots}
                reservations={reservations}
                onScheduleCourt={handleScheduleCourt}
                onDateSelect={setSelectedDate}
                isAdmin={isAdmin}
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
                selectedDate={schedulingCourt.selectedDate}
                onSubmit={(data) => {
                  console.log('Booking data:', data);
                  // Handle the booking submission here
                  setSchedulingCourt(null);
                }}
                onCancel={() => setSchedulingCourt(null)}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Clinic Scheduling Dialog */}
        {selectedClinicData && (
          <Dialog 
            open={isClinicSchedulingOpen} 
            onOpenChange={(open) => {
              console.log('SchedulePage: Dialog onOpenChange:', open);
              if (!open) {
                setIsClinicSchedulingOpen(false);
                setSelectedClinicData(null);
              }
            }}
          >
            <DialogContent className="max-w-2xl">
              <ScheduleClinicForm
                isOpen={isClinicSchedulingOpen}
                onClose={() => {
                  console.log('SchedulePage: Closing clinic form');
                  setIsClinicSchedulingOpen(false);
                  setSelectedClinicData(null);
                }}
                clinic={{
                  id: 'new-clinic',
                  title: 'New Clinic',
                  description: '',
                  coachId: '', // You'll need to set this based on your requirements
                  price: 0,
                  maxParticipants: 8,
                  skillLevel: 'beginner',
                  duration: 60,
                  schedule: '',
                  date: selectedClinicData.date,
                  startTime: selectedClinicData.timeSlot,
                  endTime: `${parseInt(selectedClinicData.timeSlot.split(':')[0]) + 1}:00`,
                  courtId: selectedClinicData.court.id,
                  enrolled: 0,
                  participants: [],
                  status: 'scheduled'
                }}
                courts={courtsList}
                onSchedule={handleScheduleClinic}
              />
            </DialogContent>
          </Dialog>
        )}
      </main>
      <Footer />
    </div>
  );
} 