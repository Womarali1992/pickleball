"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  saveCourts, 
  getCourts,
  loadCourts,
  defaultCourts,
  reservations as mockReservations, 
  generateTimeSlots,
  specialTimeSlots 
} from "@/lib/data";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay, startOfDay, addDays, subDays } from "date-fns";
import { Users, Calendar, Settings, Clock, BarChart3, ChevronLeft, ChevronRight, Search, Plus, Star, Edit2, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import EditCourtForm from "@/components/EditCourtForm";
import ScheduleCourtForm from "@/components/ScheduleCourtForm";
import SchedulerChart from "@/components/SchedulerChart";
import DateDetailModal from "@/components/DateDetailModal";
import DayScheduleView from "@/components/DayScheduleView";
import { dbService } from "@/lib/db-service";
import { Table, TableHeader, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { userDb } from '@/lib/db';
import { User, Court, Reservation, Coach, Clinic, TimeSlot } from '@/lib/types';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { coachDb } from '@/lib/db';
import CoachManagement from "@/components/coaches/CoachManagement";
import ClinicManagement from "@/components/coaches/ClinicManagement";

export default function AdminPage() {
  const [editingCourt, setEditingCourt] = useState<any>(null);
  const [schedulingCourt, setSchedulingCourt] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [reservationDate, setReservationDate] = useState<Date>(startOfDay(new Date()));
  const [currentViewDate, setCurrentViewDate] = useState<Date>(startOfDay(new Date()));
  const [courtsList, setCourtsList] = useState(defaultCourts);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showReservationDetails, setShowReservationDetails] = useState(false);
  const [selectedReservations, setSelectedReservations] = useState<any[]>([]);
  const [reservations, setReservations] = useState(mockReservations);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [slotsByDate, setSlotsByDate] = useState<Record<string, TimeSlot[]>>({});
  const [slotFilter, setSlotFilter] = useState<'all' | 'booked' | 'available'>('all');
  const [activeTab, setActiveTab] = useState<string>("scheduler");
  const [highlightDate, setHighlightDate] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<Partial<User>>({
    name: '',
    email: '',
    duprRating: 0,
    phoneNumber: '',
    skillLevel: 'beginner',
    membershipStatus: 'pending',
  });
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [isCoachModalOpen, setIsCoachModalOpen] = useState(false);
  const [isClinicModalOpen, setIsClinicModalOpen] = useState(false);
  const [newCoach, setNewCoach] = useState<Partial<Coach>>({
    name: '',
    email: '',
    phoneNumber: '',
    bio: '',
    specialties: []
  });
  const [showAddCoachModal, setShowAddCoachModal] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    const loadedCourts = loadCourts();
    setCourtsList(loadedCourts);
    
    // Initialize some default coaches if none exist
    const allCoaches = coachDb.getAllCoaches();
    console.log('Initial load of coaches:', allCoaches);
    if (allCoaches.length === 0) {
      // Add some default coaches
      const defaultCoaches = [
        {
          id: 'coach-1',
          name: 'John Smith',
          email: 'john.smith@example.com',
          phoneNumber: '555-0123',
          bio: 'Professional pickleball coach with 10 years of experience',
          specialties: ['Beginner Training', 'Advanced Strategy'],
          rating: 4.8,
          status: 'active'
        },
        {
          id: 'coach-2',
          name: 'Sarah Johnson',
          email: 'sarah.j@example.com',
          phoneNumber: '555-0124',
          bio: 'Former tennis pro turned pickleball enthusiast and coach',
          specialties: ['Tournament Prep', 'Youth Training'],
          rating: 4.9,
          status: 'active'
        }
      ];

      defaultCoaches.forEach(coach => {
        console.log('Creating default coach:', coach);
        coachDb.createCoach(coach);
      });
      
      // Add some default clinics
      const defaultClinics = [
        {
          id: 'clinic-1',
          title: 'Beginner Workshop',
          description: 'Introduction to pickleball basics',
          coachId: 'coach-1',
          price: 30,
          maxParticipants: 8,
          skillLevel: 'beginner',
          duration: '1',
          schedule: 'Every Monday',
          date: new Date(),
          startTime: '09:00',
          endTime: '10:00',
          courtId: 'court1',
          enrolled: 0,
          participants: [],
          status: 'scheduled'
        }
      ];

      defaultClinics.forEach(clinic => {
        console.log('Creating default clinic:', clinic);
        coachDb.createClinic(clinic);
      });
      
      // Reload coaches after adding defaults
      const updatedCoaches = coachDb.getAllCoaches();
      console.log('Coaches after adding defaults:', updatedCoaches);
      setCoaches(updatedCoaches);
    } else {
      setCoaches(allCoaches);
    }
    
    // Update time slots with clinic slots
    const updatedClinicSlots = dbService.updateClinicTimeSlots();
    console.log('Updated clinic slots:', updatedClinicSlots);
    
    const generatedTimeSlots = generateTimeSlots(loadedCourts);
    const nonClinicSlots = generatedTimeSlots.filter(slot => !slot.id?.startsWith('clinic-'));
    const combinedSlots = [...nonClinicSlots, ...updatedClinicSlots];
    console.log('Combined slots:', combinedSlots);
    setTimeSlots(combinedSlots);
    
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
  
  useEffect(() => {
    const newSlotsByDate: Record<string, TimeSlot[]> = {};
    
    timeSlots.forEach(slot => {
      if (!newSlotsByDate[slot.date]) {
        newSlotsByDate[slot.date] = [];
      }
      newSlotsByDate[slot.date].push(slot);
    });
    
    Object.keys(newSlotsByDate).forEach(date => {
      newSlotsByDate[date].sort((a, b) => {
        return a.startTime.localeCompare(b.startTime);
      });
    });
    
    setSlotsByDate(newSlotsByDate);
  }, [timeSlots]);

  useEffect(() => {
    const customReservations = dbService.getCustomReservations();
    console.log('Custom reservations from dbService:', customReservations);
    
    const combinedReservations = [...mockReservations];
    
    customReservations.forEach(customRes => {
      const existingIndex = combinedReservations.findIndex(res => 
        res.timeSlotId === customRes.timeSlotId
      );
      
      if (existingIndex >= 0) {
        combinedReservations[existingIndex] = customRes;
      } else {
        combinedReservations.push(customRes);
      }
    });
    
    setReservations(combinedReservations);
  }, []);
  
  useEffect(() => {
    const loadUsers = () => {
      const allUsers = userDb.getAllUsers();
      setUsers(allUsers);
    };
    loadUsers();
  }, []);
  
  useEffect(() => {
    const loadCoaches = () => {
      const allCoaches = coachDb.getAllCoaches();
      setCoaches(allCoaches);
    };
    loadCoaches();
  }, []);
  
  const handleEditCourt = (courtData: any) => {
    console.log("Editing court:", courtData);
    const updatedCourts = courtsList.map(court => 
      court.id === courtData.id ? courtData : court
    );
    setCourtsList(updatedCourts);
    const saveSuccess = saveCourts(updatedCourts);
    if (!saveSuccess) {
      setTimeout(() => {
        saveCourts(updatedCourts);
      }, 500);
    }
    
    const generatedTimeSlots = generateTimeSlots(updatedCourts);
    
    const filteredTimeSlots = generatedTimeSlots.filter(slot => {
      return !specialTimeSlots.some(specialSlot => 
        specialSlot.courtId === slot.courtId && 
        specialSlot.date === slot.date && 
        (specialSlot.startTime === slot.startTime || 
         parseInt(specialSlot.startTime) === parseInt(slot.startTime))
      );
    });
    
    const combinedTimeSlots = [
      ...filteredTimeSlots,
      ...specialTimeSlots
    ];
    
    setTimeSlots(combinedTimeSlots);
  };

  const handleScheduleCourt = (scheduleData: any) => {
    console.log("Scheduling court:", scheduleData);
  };

  const handleDeleteCourt = (courtId: string) => {
    const updatedCourts = courtsList.filter(court => court.id !== courtId);
    setCourtsList(updatedCourts);
    const saveSuccess = saveCourts(updatedCourts);
    if (!saveSuccess) {
      setTimeout(() => {
        saveCourts(updatedCourts);
      }, 500);
    }
    setShowDeleteConfirm(null);
    
    const generatedTimeSlots = generateTimeSlots(updatedCourts);
    
    const filteredTimeSlots = generatedTimeSlots.filter(slot => {
      return !specialTimeSlots.some(specialSlot => 
        specialSlot.courtId === slot.courtId && 
        specialSlot.date === slot.date && 
        (specialSlot.startTime === slot.startTime || 
         parseInt(specialSlot.startTime) === parseInt(slot.startTime))
      );
    });
    
    const combinedTimeSlots = [
      ...filteredTimeSlots,
      ...specialTimeSlots
    ];
    
    setTimeSlots(combinedTimeSlots);
  };

  const reservationsByDate: Record<string, typeof reservations> = {};
  
  reservations.forEach(reservation => {
    const timeSlot = timeSlots.find(ts => ts.id === reservation.timeSlotId);
    if (!timeSlot) return;
    
    if (!reservationsByDate[timeSlot.date]) {
      reservationsByDate[timeSlot.date] = [];
    }
    
    reservationsByDate[timeSlot.date].push(reservation);
  });
  
  const sortedDates = Object.keys(slotsByDate).sort();
  
  const goToPreviousDay = () => {
    setCurrentViewDate(prevDate => subDays(prevDate, 1));
  };
  
  const goToNextDay = () => {
    setCurrentViewDate(prevDate => addDays(prevDate, 1));
  };
  
  const goToToday = () => {
    setCurrentViewDate(startOfDay(new Date()));
  };
  
  const formattedViewDate = format(currentViewDate, "yyyy-MM-dd");
  const readableViewDate = format(currentViewDate, "EEEE, MMMM d, yyyy");
  
  const navigateMonth = (direction: 'previous' | 'next') => {
    setCurrentMonth(direction === 'previous' 
      ? subMonths(currentMonth, 1) 
      : addMonths(currentMonth, 1)
    );
  };
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const getStartingDayOfWeek = () => {
    return getDay(monthStart);
  };
  
  const monthReservations = reservations.filter(reservation => {
    const timeSlot = timeSlots.find(ts => ts.id === reservation.timeSlotId);
    if (!timeSlot) return false;
    
    const reservationDate = new Date(timeSlot.date);
    return reservationDate >= monthStart && reservationDate <= monthEnd;
  });
  
  const startingDayOfWeek = getStartingDayOfWeek();
  const emptyCells = Array.from({ length: startingDayOfWeek }, (_, index) => (
    <div key={`empty-${index}`} className="h-24 border border-border/40 bg-background/50"></div>
  ));
  
  const closeReservationDetails = () => {
    setShowReservationDetails(false);
    setSelectedReservations([]);
  };

  const handleSelectDate = (dateString: string) => {
    setSelectedDate(dateString);
    
    const dayReservations = reservationsByDate[dateString] || [];
    
    if (dayReservations.length > 0) {
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

  const handleCalendarDateClick = (dateString: string) => {
    try {
      const date = new Date(dateString);
      navigateToReservationsTab(date);
    } catch (error) {
      console.error("Error navigating to date:", error);
    }
  };

  const navigateToReservationsTab = (date: Date) => {
    setCurrentViewDate(date);
    setActiveTab("reservations");
    
    setHighlightDate(true);
    setTimeout(() => {
      setHighlightDate(false);
    }, 2000);
  };

  const handleSchedulerDateSelect = (date: Date) => {
    navigateToReservationsTab(date);
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddUser = () => {
    const createdUser = userDb.createUser(newUser as Omit<User, 'id' | 'createdAt' | 'updatedAt'>);
    if (createdUser) {
      setUsers([...users, createdUser]);
      setIsAddDialogOpen(false);
      setNewUser({
        name: '',
        email: '',
        duprRating: 0,
        phoneNumber: '',
        skillLevel: 'beginner',
        membershipStatus: 'pending',
      });
    }
  };

  const handleEditUser = () => {
    if (editingUser) {
      const updatedUser = userDb.updateUser(editingUser.id, editingUser);
      if (updatedUser) {
        setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
        setIsEditDialogOpen(false);
        setEditingUser(null);
      }
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const success = userDb.deleteUser(userId);
      if (success) {
        setUsers(users.filter(u => u.id !== userId));
      }
    }
  };

  const getSkillLevelColor = (skillLevel?: string) => {
    switch (skillLevel) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-blue-500';
      case 'advanced': return 'bg-purple-500';
      case 'professional': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const handleAddCoach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoach.name || !newCoach.email) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const coach = coachDb.createCoach({
        name: newCoach.name,
        email: newCoach.email,
        phoneNumber: newCoach.phoneNumber,
        bio: newCoach.bio,
        specialties: newCoach.specialties || [],
        rating: 0,
        status: 'active'
      });

      setCoaches([...coaches, coach]);
      setNewCoach({
        name: '',
        email: '',
        phoneNumber: '',
        bio: '',
        specialties: []
      });
      setShowAddCoachModal(false);
    } catch (error) {
      console.error('Error adding coach:', error);
      alert('Failed to add coach. Please try again.');
    }
  };

  if (timeSlots.length === 0 && !isClient) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">Loading admin panel...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mx-auto"></div>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background/90 to-background/90">
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
                <h3 className="text-3xl font-bold">{isClient ? courtsList.length : defaultCourts.length}</h3>
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
                <h3 className="text-3xl font-bold">{isClient ? reservations.length : mockReservations.length}</h3>
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
                <h3 className="text-3xl font-bold">{isClient ? timeSlots.length : '--'}</h3>
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
                <h3 className="text-3xl font-bold">
                  {isClient ? users.length : 0}
                </h3>
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
            <TabsTrigger value="coaches">Coaches</TabsTrigger>
            <TabsTrigger value="clinics">Clinics</TabsTrigger>
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
                
                <div className="grid grid-cols-7 gap-1">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center font-medium py-2 text-sm">
                      {day}
                    </div>
                  ))}
                  
                  {emptyCells}
                  
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

            {slotsByDate[formattedViewDate] ? (
              <>
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
                              const reservation = reservations.find(r => r.timeSlotId === slot.id);
                              
                              console.log(`Slot ${slot.id} (${slot.date} ${slot.startTime}): available=${slot.available}, has reservation=${!!reservation}`);
                              if (reservation) {
                                console.log(`Real booking for ${slot.id}:`, reservation);
                              }
                              
                              return (
                                <div
                                  key={slot.id}
                                  className={`min-h-[4rem] rounded-sm flex items-center px-4 transition-all duration-300 hover:scale-[1.01] ${
                                    !slot.available
                                      ? "bg-blue-200 text-blue-800"
                                      : "bg-green-200 text-green-800"
                                  }`}
                                >
                                  {reservation ? (
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
            
            {editingCourt && (
              <Dialog open={!!editingCourt} onOpenChange={open => !open && setEditingCourt(null)}>
                <DialogContent className="sm:max-w-[425px] border border-border/50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-lg shadow-primary/5">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
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
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="relative w-64">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Add User
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New User</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <label>Name</label>
                            <Input
                              value={newUser.name}
                              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <label>Email</label>
                            <Input
                              type="email"
                              value={newUser.email}
                              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <label>DUPR Rating</label>
                            <Input
                              type="number"
                              step="0.01"
                              value={newUser.duprRating}
                              onChange={(e) => setNewUser({ ...newUser, duprRating: parseFloat(e.target.value) })}
                            />
                          </div>
                          <div className="space-y-2">
                            <label>Phone Number</label>
                            <Input
                              value={newUser.phoneNumber}
                              onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <label>Skill Level</label>
                            <Select
                              value={newUser.skillLevel}
                              onValueChange={(value) => setNewUser({ ...newUser, skillLevel: value as any })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select skill level" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="beginner">Beginner</SelectItem>
                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                <SelectItem value="advanced">Advanced</SelectItem>
                                <SelectItem value="professional">Professional</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <label>Membership Status</label>
                            <Select
                              value={newUser.membershipStatus}
                              onValueChange={(value) => setNewUser({ ...newUser, membershipStatus: value as any })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button onClick={handleAddUser} className="w-full">
                            Add User
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>DUPR Rating</TableHead>
                          <TableHead>Skill Level</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8">
                              <p className="text-muted-foreground">No users found</p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredUsers.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.name}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                                  {user.duprRating?.toFixed(2) || 'N/A'}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={getSkillLevelColor(user.skillLevel)}>
                                  {user.skillLevel || 'Not Set'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={user.membershipStatus === 'active' ? 'success' : 'secondary'}>
                                  {user.membershipStatus || 'Not Set'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setEditingUser(user)}
                                      >
                                        <Edit2 className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Edit User</DialogTitle>
                                      </DialogHeader>
                                      {editingUser && (
                                        <div className="space-y-4 py-4">
                                          <div className="space-y-2">
                                            <label>Name</label>
                                            <Input
                                              value={editingUser.name}
                                              onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                                            />
                                          </div>
                                          <div className="space-y-2">
                                            <label>Email</label>
                                            <Input
                                              type="email"
                                              value={editingUser.email}
                                              onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                            />
                                          </div>
                                          <div className="space-y-2">
                                            <label>DUPR Rating</label>
                                            <Input
                                              type="number"
                                              step="0.01"
                                              value={editingUser.duprRating}
                                              onChange={(e) => setEditingUser({ ...editingUser, duprRating: parseFloat(e.target.value) })}
                                            />
                                          </div>
                                          <div className="space-y-2">
                                            <label>Skill Level</label>
                                            <Select
                                              value={editingUser.skillLevel}
                                              onValueChange={(value) => setEditingUser({ ...editingUser, skillLevel: value as any })}
                                            >
                                              <SelectTrigger>
                                                <SelectValue placeholder="Select skill level" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="beginner">Beginner</SelectItem>
                                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                                <SelectItem value="advanced">Advanced</SelectItem>
                                                <SelectItem value="professional">Professional</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <div className="space-y-2">
                                            <label>Membership Status</label>
                                            <Select
                                              value={editingUser.membershipStatus}
                                              onValueChange={(value) => setEditingUser({ ...editingUser, membershipStatus: value as any })}
                                            >
                                              <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                                <SelectItem value="pending">Pending</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <Button onClick={handleEditUser} className="w-full">
                                            Save Changes
                                          </Button>
                                        </div>
                                      )}
                                    </DialogContent>
                                  </Dialog>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteUser(user.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="coaches" className="space-y-4">
            <CoachManagement onUpdate={() => {
              const allCoaches = coachDb.getAllCoaches();
              setCoaches(allCoaches);
            }} />
          </TabsContent>
          
          <TabsContent value="clinics" className="space-y-4">
            {console.log('Rendering ClinicManagement with coaches:', coaches)}
            <ClinicManagement 
              coaches={coaches}
              onUpdate={() => {
                const allCoaches = coachDb.getAllCoaches();
                console.log('Updated coaches:', allCoaches);
                setCoaches(allCoaches);
              }}
            />
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
                              <h4 className="font-medium mb-2">Contact</h4>
                              <div className="space-y-1">
                                <p className="text-sm"><span className="font-semibold">Email:</span> {reservation.playerEmail}</p>
                                <p className="text-sm"><span className="font-semibold">Phone:</span> {reservation.playerPhone}</p>
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