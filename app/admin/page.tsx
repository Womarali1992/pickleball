"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  saveCourts, 
  getCourts, 
  reservations as mockReservations, 
  timeSlots, 
  specialTimeSlots 
} from "@/lib/data";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay, startOfDay, addDays, subDays } from "date-fns";
import { Users, Calendar, Settings, Clock, BarChart3, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import EditCourtForm from "@/components/EditCourtForm";
import ScheduleCourtForm from "@/components/ScheduleCourtForm";
import SchedulerChart from "@/components/SchedulerChart";
import DateDetailModal from "@/components/DateDetailModal";
import DayScheduleView from "@/components/DayScheduleView";
import { dbService } from "@/lib/db-service";

export default function AdminPage() {
  const [editingCourt, setEditingCourt] = useState<any>(null);
  const [schedulingCourt, setSchedulingCourt] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [reservationDate, setReservationDate] = useState<Date>(startOfDay(new Date()));
  const [currentViewDate, setCurrentViewDate] = useState<Date>(startOfDay(new Date()));
  const [courtsList, setCourtsList] = useState(getCourts());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showReservationDetails, setShowReservationDetails] = useState(false);
  const [selectedReservations, setSelectedReservations] = useState<any[]>([]);
  const [reservations, setReservations] = useState(mockReservations);
  const [slotFilter, setSlotFilter] = useState<'all' | 'booked' | 'available'>('all');
  const [activeTab, setActiveTab] = useState<string>("scheduler");
  const [highlightDate, setHighlightDate] = useState<boolean>(false);
  
  // Add an effect to refresh courts and reservations when needed
  useEffect(() => {
    setCourtsList(getCourts());
    
    // Combine mock reservations with custom reservations from dbService
    const customReservations = dbService.getCustomReservations();
    console.log('Custom reservations from dbService:', customReservations);
    
    // Remove duplicates by timeSlotId (prefer custom reservations)
    const combinedReservations = [...mockReservations];
    
    customReservations.forEach(customRes => {
      // Check if we already have this reservation
      const existingIndex = combinedReservations.findIndex(res => 
        res.timeSlotId === customRes.timeSlotId
      );
      
      if (existingIndex >= 0) {
        // Replace existing reservation with custom one
        combinedReservations[existingIndex] = customRes;
      } else {
        // Add new reservation
        combinedReservations.push(customRes);
      }
    });
    
    setReservations(combinedReservations);
  }, []);
  
  const handleEditCourt = (courtData: any) => {
    console.log("Editing court:", courtData);
    // Update the court in the local state
    const updatedCourts = courtsList.map(court => 
      court.id === courtData.id ? courtData : court
    );
    setCourtsList(updatedCourts);
    // Save the updated courts to localStorage
    const saveSuccess = saveCourts(updatedCourts);
    if (!saveSuccess) {
      // If save fails, try again after a short delay
      setTimeout(() => {
        saveCourts(updatedCourts);
      }, 500);
    }
  };

  const handleScheduleCourt = (scheduleData: any) => {
    console.log("Scheduling court:", scheduleData);
    // In a real app, this would update the court's schedule in the database
  };

  const handleDeleteCourt = (courtId: string) => {
    // Remove the court from the local state
    const updatedCourts = courtsList.filter(court => court.id !== courtId);
    setCourtsList(updatedCourts);
    // Save the updated courts to localStorage
    const saveSuccess = saveCourts(updatedCourts);
    if (!saveSuccess) {
      // If save fails, try again after a short delay
      setTimeout(() => {
        saveCourts(updatedCourts);
      }, 500);
    }
    // Close the confirmation dialog
    setShowDeleteConfirm(null);
  };

  // Group reservations by date for easier display
  const reservationsByDate: Record<string, typeof reservations> = {};
  
  reservations.forEach(reservation => {
    const timeSlot = timeSlots.find(ts => ts.id === reservation.timeSlotId);
    if (!timeSlot) return;
    
    if (!reservationsByDate[timeSlot.date]) {
      reservationsByDate[timeSlot.date] = [];
    }
    
    reservationsByDate[timeSlot.date].push(reservation);
  });
  
  // Group ALL time slots by date, not just reservations
  const slotsByDate: Record<string, typeof timeSlots> = {};
  
  timeSlots.forEach(slot => {
    if (!slotsByDate[slot.date]) {
      slotsByDate[slot.date] = [];
    }
    slotsByDate[slot.date].push(slot);
  });
  
  // Sort dates in ascending order
  const sortedDates = Object.keys(slotsByDate).sort();
  
  // Sort time slots within each date by startTime
  Object.keys(slotsByDate).forEach(date => {
    slotsByDate[date].sort((a, b) => {
      return a.startTime.localeCompare(b.startTime);
    });
  });
  
  // Navigate to previous day
  const goToPreviousDay = () => {
    setCurrentViewDate(prevDate => subDays(prevDate, 1));
  };
  
  // Navigate to next day
  const goToNextDay = () => {
    setCurrentViewDate(prevDate => addDays(prevDate, 1));
  };
  
  // Go to today
  const goToToday = () => {
    setCurrentViewDate(startOfDay(new Date()));
  };
  
  // Format current view date
  const formattedViewDate = format(currentViewDate, "yyyy-MM-dd");
  const readableViewDate = format(currentViewDate, "EEEE, MMMM d, yyyy");
  
  // Calendar specific functions
  const navigateMonth = (direction: 'previous' | 'next') => {
    setCurrentMonth(direction === 'previous' 
      ? subMonths(currentMonth, 1) 
      : addMonths(currentMonth, 1)
    );
  };
  
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
  
  // Generate empty cells for days before the first day of the month
  const startingDayOfWeek = getStartingDayOfWeek();
  const emptyCells = Array.from({ length: startingDayOfWeek }, (_, index) => (
    <div key={`empty-${index}`} className="h-24 border border-border/40 bg-background/50"></div>
  ));
  
  // Function to close reservation details dialog
  const closeReservationDetails = () => {
    setShowReservationDetails(false);
    setSelectedReservations([]);
  };

  // Update the setSelectedDate function to populate reservation details
  const handleSelectDate = (dateString: string) => {
    setSelectedDate(dateString);
    
    // Get reservations for the selected date
    const dayReservations = reservationsByDate[dateString] || [];
    
    if (dayReservations.length > 0) {
      // Prepare reservation data with court details
      const detailedReservations = dayReservations.map(reservation => {
        const court = courtsList.find(c => c.id === reservation.courtId);
        const timeSlot = timeSlots.find(ts => ts.id === reservation.timeSlotId);
        return {
          ...reservation,
          courtName: court?.name || 'Unknown Court',
          timeSlot: timeSlot ? `${timeSlot.startTime} - ${timeSlot.endTime}` : 'Unknown Time'
        };
      });
      
      setSelectedReservations(detailedReservations);
      setShowReservationDetails(true);
    }
  };

  // New function to navigate to the reservations tab from calendar view
  const handleCalendarDateClick = (dateString: string) => {
    try {
      // Convert the date string to a Date object
      const date = new Date(dateString);
      navigateToReservationsTab(date);
    } catch (error) {
      console.error("Error navigating to date:", error);
    }
  };

  // Function to navigate to reservations tab with specific date
  const navigateToReservationsTab = (date: Date) => {
    setCurrentViewDate(date);
    setActiveTab("reservations");
    
    // Add highlight effect
    setHighlightDate(true);
    setTimeout(() => {
      setHighlightDate(false);
    }, 2000);
  };

  // Handle date selection from scheduler chart
  const handleSchedulerDateSelect = (date: Date) => {
    navigateToReservationsTab(date);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background/90 to-background/90">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2 text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage courts, reservations, and settings
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Total Courts</p>
                <h3 className="text-3xl font-bold">{courtsList.length}</h3>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <Calendar className="h-8 w-8" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Total Bookings</p>
                <h3 className="text-3xl font-bold">{reservations.length}</h3>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <Clock className="h-8 w-8" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Time Slots</p>
                <h3 className="text-3xl font-bold">{timeSlots.length}</h3>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <BarChart3 className="h-8 w-8" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Users</p>
                <h3 className="text-3xl font-bold">24</h3>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <Users className="h-8 w-8" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="scheduler" className="space-y-6">
          <TabsList className="mb-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border border-border/50">
            <TabsTrigger value="scheduler">Scheduler</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="reservations">Reservations</TabsTrigger>
            <TabsTrigger value="courts">Courts</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="scheduler" className="space-y-6">
            <div className="mb-2 text-sm text-muted-foreground text-center">
              <span className="inline-flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                Click on any date to view detailed time slots
              </span>
            </div>
            <SchedulerChart 
              courts={courtsList} 
              timeSlots={timeSlots} 
              onScheduleCourt={setSchedulingCourt}
              onDateSelect={handleSchedulerDateSelect}
            />
          </TabsContent>
          
          <TabsContent value="calendar" className="space-y-6">
            <div className="mb-2 text-sm text-muted-foreground text-center">
              <span className="inline-flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                Click on any date to view detailed time slots
              </span>
            </div>
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
                        onClick={() => handleCalendarDateClick(dateString)}
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
                            const court = courtsList.find(c => c.id === reservation.courtId);
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
          </TabsContent>
          
          <TabsContent value="reservations" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-foreground">
                Time Slots Overview
              </h2>
              <Button className="bg-primary hover:bg-primary/90">Add Time Slot</Button>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <Button variant="outline" onClick={goToPreviousDay} className="flex items-center gap-1">
                  <ChevronLeft className="h-4 w-4" />
                  Previous Day
                </Button>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={goToToday} className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Today
                  </Button>
                  <h3 className={`text-lg font-semibold ${highlightDate ? 'bg-primary/20 px-3 py-1 rounded-md animate-pulse' : ''}`}>
                    {readableViewDate}
                  </h3>
                </div>
                
                <Button variant="outline" onClick={goToNextDay} className="flex items-center gap-1">
                  Next Day
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Filter controls */}
              <div className="flex items-center justify-center gap-3 my-4 p-3 rounded-md bg-background border">
                <div className="text-sm font-medium">Filter slots:</div>
                <div 
                  className={`px-3 py-1.5 rounded-md flex gap-2 items-center cursor-pointer transition-colors ${
                    slotFilter === 'all' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                  }`}
                  onClick={() => setSlotFilter('all')}
                >
                  <div className="flex">
                    <div className="w-5 h-5 rounded-l-sm bg-blue-200 border border-r-0 border-blue-400"></div>
                    <div className="w-5 h-5 rounded-r-sm bg-green-200 border border-green-400"></div>
                  </div>
                  <span className="font-medium">All</span>
                  <Badge variant="secondary" className="ml-1">
                    {slotsByDate[formattedViewDate]?.filter(slot => slot.courtId && courtsList.some(c => c.id === slot.courtId)).length || 0}
                  </Badge>
                </div>
                
                <div 
                  className={`px-3 py-1.5 rounded-md flex gap-2 items-center cursor-pointer transition-colors ${
                    slotFilter === 'booked' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                  }`}
                  onClick={() => setSlotFilter('booked')}
                >
                  <div className="w-10 h-5 rounded-sm bg-blue-200 border border-blue-400 flex items-center justify-center">
                    <span className="text-xs text-blue-800 font-medium">Booked</span>
                  </div>
                  <span className="font-medium">Booked</span>
                  <Badge variant="secondary" className="ml-1 bg-blue-100 text-blue-800 hover:bg-blue-100">
                    {slotsByDate[formattedViewDate]?.filter(slot => !slot.available && slot.courtId && courtsList.some(c => c.id === slot.courtId)).length || 0}
                  </Badge>
                </div>
                
                <div 
                  className={`px-3 py-1.5 rounded-md flex gap-2 items-center cursor-pointer transition-colors ${
                    slotFilter === 'available' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                  }`}
                  onClick={() => setSlotFilter('available')}
                >
                  <div className="w-10 h-5 rounded-sm bg-green-200 border border-green-400 flex items-center justify-center">
                    <span className="text-xs text-green-800 font-medium">Free</span>
                  </div>
                  <span className="font-medium">Available</span>
                  <Badge variant="secondary" className="ml-1 bg-green-100 text-green-800 hover:bg-green-100">
                    {slotsByDate[formattedViewDate]?.filter(slot => slot.available && slot.courtId && courtsList.some(c => c.id === slot.courtId)).length || 0}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Show only time slots for the selected day */}
            {slotsByDate[formattedViewDate] ? (
              <>
                {/* Check if any courts have matching slots */}
                {courtsList.some(court => {
                  const filteredSlots = slotsByDate[formattedViewDate]
                    .filter(slot => {
                      if (slotFilter === 'all') return slot.courtId === court.id;
                      if (slotFilter === 'booked') return slot.courtId === court.id && !slot.available;
                      if (slotFilter === 'available') return slot.courtId === court.id && slot.available;
                      return false;
                    });
                  return filteredSlots.length > 0;
                }) ? (
                  // Show courts with matching slots
                  courtsList.map((court) => {
                    const courtSlots = slotsByDate[formattedViewDate]
                      .filter((slot) => {
                        if (slotFilter === 'all') return slot.courtId === court.id;
                        if (slotFilter === 'booked') return slot.courtId === court.id && !slot.available;
                        if (slotFilter === 'available') return slot.courtId === court.id && slot.available;
                        return false;
                      });
                    
                    if (courtSlots.length === 0) return null;
                    
                    return (
                      <Card key={court.id} className="border border-input bg-card shadow-sm mb-4">
                        <CardHeader>
                          <CardTitle className="text-2xl font-bold text-foreground">{court.name}</CardTitle>
                          <CardDescription>
                            <Badge
                              variant={court.indoor ? "secondary" : "outline"}
                              className={court.indoor ? "bg-secondary/20" : "border-primary/20"}
                            >
                              {court.indoor ? "Indoor" : "Outdoor"}
                            </Badge>
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {courtSlots.map((slot) => {
                              // Only use the actual reservation data, no placeholders
                              const reservation = reservations.find(r => r.timeSlotId === slot.id);
                              
                              // Debug logging to help identify issues
                              console.log(`Slot ${slot.id} (${slot.date} ${slot.startTime}): available=${slot.available}, has reservation=${!!reservation}`);
                              if (reservation) {
                                console.log(`Real booking for ${slot.id}:`, reservation);
                              }
                              
                              return (
                                <div
                                  key={slot.id}
                                  className={`min-h-[4rem] rounded-sm flex items-center px-4 transition-all duration-300 hover:scale-[1.01] ${
                                    !slot.available
                                      ? "bg-blue-200 text-blue-800"  // Blue for ALL unavailable/booked slots
                                      : "bg-green-200 text-green-800" // Green for available slots
                                  }`}
                                >
                                  {reservation ? (
                                    // Only show REAL reservation details in new layout
                                    <>
                                      <div className="w-1/4">
                                        <p className="font-bold text-blue-900">Reserved by</p>
                                        <p className="text-sm">{reservation.playerName}</p>
                                      </div>
                                      
                                      <div className="w-1/4">
                                        <p className="font-bold text-blue-900">Contact</p>
                                        <p className="text-sm">{reservation.playerEmail}</p>
                                        <p className="text-sm">{reservation.playerPhone}</p>
                                      </div>
                                      
                                      <div className="flex-1 flex justify-center">
                                        <div className="px-4 py-2 bg-blue-300 rounded-md">
                                          <p className="font-medium text-center">
                                            {slot.startTime} - {slot.endTime}
                                          </p>
                                          <p className="text-xs text-center text-blue-800">
                                            {reservation.players} player{reservation.players !== 1 ? 's' : ''}
                                          </p>
                                        </div>
                                      </div>
                                      
                                      <div className="flex-shrink-0">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="ml-2"
                                        >
                                          View
                                        </Button>
                                      </div>
                                    </>
                                  ) : (
                                    // Original layout for available slots
                                    <>
                                      <div className="flex-1">
                                        <p className="font-medium">
                                          {slot.startTime} - {slot.endTime}
                                        </p>
                                        {!slot.available ? (
                                          <p className="text-sm font-medium">No booking details available</p>
                                        ) : (
                                          <p className="text-sm">Available</p>
                                        )}
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="ml-2"
                                      >
                                        {!slot.available ? "View" : "Book"}
                                      </Button>
                                    </>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  // No slots match the current filter
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center">
                        <p className="text-muted-foreground">
                          {slotFilter === 'all' 
                            ? 'No time slots available for this day.' 
                            : slotFilter === 'booked' 
                              ? 'No booked time slots for this day. All slots are available.'
                              : 'No available time slots for this day. All slots are booked.'}
                        </p>
                        {slotFilter !== 'all' && (
                          <Button 
                            variant="outline" 
                            onClick={() => setSlotFilter('all')} 
                            className="mt-4"
                          >
                            Show All Slots
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">
                    No time slots available for this day.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="courts" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Courts Management</CardTitle>
                  <CardDescription>Add, edit, or remove courts in your facility</CardDescription>
                </div>
                <Button onClick={() => setEditingCourt({})}>Add New Court</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {courtsList.map(court => (
                    <Card key={court.id} className="border border-input">
                      <CardContent className="p-4 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-lg">{court.name}</h3>
                            <p className="text-muted-foreground text-sm">
                              {court.indoor ? "Indoor" : "Outdoor"} | {court.location}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" onClick={() => setEditingCourt(court)}>
                              Edit
                            </Button>
                            <Button 
                              variant="destructive" 
                              onClick={() => setShowDeleteConfirm(court.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex flex-col md:flex-row gap-4 mt-2">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium mb-2">Court Layout</h4>
                            <div className={`border border-dashed border-border p-3 rounded-md mb-2 ${
                              court.orientation === 'vertical' 
                              ? 'aspect-[9/20] max-w-[120px]' 
                              : 'aspect-[20/9] max-w-[240px]'
                            }`}>
                              <div className={`w-full h-full bg-muted/30 flex items-center justify-center text-xs text-muted-foreground ${
                                court.orientation === 'vertical' && court.verticalAlignment === 'right'
                                  ? 'justify-end pr-2'
                                  : court.orientation === 'vertical' && court.verticalAlignment === 'left'
                                  ? 'justify-start pl-2'
                                  : 'justify-center'
                              }`}>
                                {court.orientation === 'vertical' 
                                  ? `Portrait (${court.verticalAlignment === 'left' ? 'Left' : 'Right'} Aligned)` 
                                  : 'Landscape'}
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {court.orientation === 'vertical' 
                              ? '9 ft × 20 ft' 
                              : '20 ft × 9 ft'}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium mb-2">Court Placement</h4>
                            <div className="grid grid-cols-3 grid-rows-3 gap-1 w-[120px] h-[120px] mx-auto">
                              {['top-left', 'top-center', 'top-right', 
                                'center-left', 'center', 'center-right', 
                                'bottom-left', 'bottom-center', 'bottom-right'].map((position) => (
                                <div 
                                  key={position} 
                                  className={`border rounded-sm ${
                                    position === court.placement 
                                    ? 'bg-primary/20 border-primary/50' 
                                    : 'border-border/50'
                                  } flex items-center justify-center`}
                                  style={{width: '100%', height: '100%'}}
                                >
                                  {position === court.placement && 
                                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                                  }
                                </div>
                              ))}
                            </div>
                            <div className="text-xs text-muted-foreground text-center mt-1">
                              {court.placement?.replace('-', ' ')}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Court edit dialog */}
            {editingCourt && (
              <Dialog open={!!editingCourt} onOpenChange={open => !open && setEditingCourt(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingCourt.id ? `Edit ${editingCourt.name}` : 'Add New Court'}
                    </DialogTitle>
                  </DialogHeader>
                  <EditCourtForm 
                    court={editingCourt} 
                    isOpen={!!editingCourt}
                    onClose={() => setEditingCourt(null)}
                    onSave={handleEditCourt}
                  />
                </DialogContent>
              </Dialog>
            )}
            
            {/* Court scheduling dialog */}
            {schedulingCourt && (
              <Dialog open={!!schedulingCourt} onOpenChange={open => !open && setSchedulingCourt(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      Schedule {schedulingCourt.name}
                    </DialogTitle>
                  </DialogHeader>
                  <ScheduleCourtForm 
                    court={schedulingCourt} 
                    onSave={(scheduleData) => {
                      handleScheduleCourt(scheduleData);
                      setSchedulingCourt(null);
                    }}
                    onCancel={() => setSchedulingCourt(null)}
                  />
                </DialogContent>
              </Dialog>
            )}
            
            {/* Delete confirmation dialog */}
            {showDeleteConfirm && (
              <Dialog open={!!showDeleteConfirm} onOpenChange={open => !open && setShowDeleteConfirm(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                  </DialogHeader>
                  <p>
                    Are you sure you want to delete this court? This action cannot be undone.
                  </p>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowDeleteConfirm(null)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={() => handleDeleteCourt(showDeleteConfirm)}
                    >
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </TabsContent>
          
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">User management panel will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure application settings</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">System settings panel will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Date detail modal */}
        {selectedDate && (
          <Dialog open={!!selectedDate} onOpenChange={(open) => !open && setSelectedDate(null)}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">
                  {selectedDate ? format(new Date(selectedDate), "EEEE, MMMM d, yyyy") : ""}
                </DialogTitle>
              </DialogHeader>
              
              <div className="py-4">
                <h3 className="text-lg font-semibold mb-4">
                  Reservations ({reservationsByDate[selectedDate || ""] ? reservationsByDate[selectedDate || ""].length : 0})
                </h3>
                
                {reservationsByDate[selectedDate || ""] && reservationsByDate[selectedDate || ""].length > 0 ? (
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {reservationsByDate[selectedDate || ""].map(reservation => {
                      const timeSlot = timeSlots.find(ts => ts.id === reservation.timeSlotId);
                      const court = courtsList.find(c => c.id === reservation.courtId);
                      
                      return (
                        <div 
                          key={reservation.id}
                          className="bg-card/95 border border-border/50 rounded-lg p-4 shadow-sm"
                        >
                          <div className="flex items-center">
                            <div className="w-1/4">
                              <h3 className="font-medium text-lg">{reservation.playerName}</h3>
                              <p className="text-sm text-muted-foreground">{court?.name}</p>
                              <p className="text-sm">
                                <Badge variant="outline" className="mt-1 border-primary/20">
                                  {reservation.players} player{reservation.players !== 1 ? 's' : ''}
                                </Badge>
                              </p>
                            </div>
                            
                            <div className="w-1/4">
                              <h4 className="font-medium mb-1">Contact</h4>
                              <div className="text-sm space-y-1">
                                <p><span className="font-semibold">Email:</span> {reservation.playerEmail}</p>
                                <p><span className="font-semibold">Phone:</span> {reservation.playerPhone}</p>
                              </div>
                            </div>
                            
                            <div className="flex-1 flex justify-center">
                              <div className="px-4 py-3 bg-primary/10 rounded-md text-center">
                                <p className="font-medium text-primary">
                                  {timeSlot?.startTime} - {timeSlot?.endTime}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex-shrink-0">
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="border-primary/20 hover:bg-primary/10">
                                  Edit
                                </Button>
                                <Button variant="outline" size="sm" className="border-destructive/20 hover:bg-destructive/10 hover:text-destructive">
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-card/95 border border-border/50 rounded-lg">
                    <p className="text-muted-foreground">No reservations for this date</p>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button onClick={() => setSelectedDate(null)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Reservation Details Dialog */}
        <Dialog open={showReservationDetails} onOpenChange={setShowReservationDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Reservation Details for {selectedDate ? format(new Date(selectedDate), "MMMM d, yyyy") : ""}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 my-4">
              {selectedReservations.length > 0 ? (
                selectedReservations.map((reservation) => (
                  <div key={reservation.id} className="p-4 border rounded-md bg-card">
                    <div className="flex items-center">
                      <div className="w-1/4">
                        <h3 className="text-lg font-bold mb-2">{reservation.courtName}</h3>
                        <div className="space-y-1">
                          <p className="text-sm"><span className="font-semibold">Name:</span> {reservation.playerName}</p>
                          <p className="text-sm"><span className="font-semibold">Players:</span> {reservation.players}</p>
                        </div>
                      </div>
                      
                      <div className="w-1/4">
                        <h4 className="font-medium mb-2">Contact Info</h4>
                        <div className="space-y-1">
                          <p className="text-sm"><span className="font-semibold">Email:</span> {reservation.playerEmail}</p>
                          <p className="text-sm"><span className="font-semibold">Phone:</span> {reservation.playerPhone}</p>
                          <p className="text-sm"><span className="font-semibold">Status:</span> <span className="capitalize">{reservation.status}</span></p>
                        </div>
                      </div>
                      
                      <div className="flex-1 flex justify-center">
                        <div className="px-5 py-3 bg-primary/10 rounded-md text-center">
                          <p className="font-medium text-primary">{reservation.timeSlot}</p>
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0">
                        <Badge variant="outline" className="capitalize">
                          {reservation.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground">No reservations for this date.</p>
              )}
            </div>
            
            <DialogFooter>
              <Button onClick={closeReservationDetails}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      
      <Footer />
    </div>
  );
} 