"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { reservations, getCourts, timeSlots, saveCourts } from "@/lib/data";
import { format } from "date-fns";
import EditCourtForm from "@/components/EditCourtForm";
import ScheduleCourtForm from "@/components/ScheduleCourtForm";
import SchedulerChart from "@/components/SchedulerChart";
import { Clock, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

// Define hardcoded colors to replace COLORS import
const SLOT_COLORS = {
  AVAILABLE: {
    BG: "bg-green-500 hover:bg-green-600",
    TEXT: "text-white",
    LABEL: "Available"
  },
  BOOKED: {
    BG: "bg-blue-500 hover:bg-blue-600",
    TEXT: "text-white",
    LABEL: "Booked"
  },
  MY_BOOKING: {
    BG: "bg-blue-700 hover:bg-blue-800",
    TEXT: "text-white",
    LABEL: "Your Booking"
  }
};

export default function ReservationsPage() {
  const [editingCourt, setEditingCourt] = useState<any>(null);
  const [schedulingCourt, setSchedulingCourt] = useState<any>(null);
  const [courtsList, setCourtsList] = useState(getCourts());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  // Filter reservations that belong to the current user
  // In a real app, you would check against the logged in user ID
  // For demo purposes, we'll pretend all reservations belong to the current user
  const userReservations = reservations;
  
  // Group reservations by date for display
  const reservationsByDate = userReservations.reduce((acc, reservation) => {
    const timeSlot = timeSlots.find(ts => ts.id === reservation.timeSlotId);
    if (!timeSlot) return acc;
    
    if (!acc[timeSlot.date]) {
      acc[timeSlot.date] = [];
    }
    
    acc[timeSlot.date].push({
      ...reservation,
      timeSlot
    });
    
    return acc;
  }, {} as Record<string, Array<typeof reservations[0] & { timeSlot: typeof timeSlots[0] }>>);
  
  // Sort dates in ascending order
  const sortedDates = Object.keys(reservationsByDate).sort();

  const handleEditCourt = (courtData: any) => {
    console.log("Editing court:", courtData);
    // Update the court in the local state
    const updatedCourts = courtsList.map(court => 
      court.id === courtData.id ? courtData : court
    );
    setCourtsList(updatedCourts);
    // Save the updated courts to localStorage
    saveCourts(updatedCourts);
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
    saveCourts(updatedCourts);
    // Close the confirmation dialog
    setShowDeleteConfirm(null);
  };

  // Group ALL time slots by date, not just reservations
  const slotsByDate: Record<string, typeof timeSlots> = {};
  
  timeSlots.forEach(slot => {
    if (!slotsByDate[slot.date]) {
      slotsByDate[slot.date] = [];
    }
    slotsByDate[slot.date].push(slot);
  });
  
  // Sort dates in ascending order
  const sortedDatesSlots = Object.keys(slotsByDate).sort();
  
  // Sort time slots within each date by startTime
  Object.keys(slotsByDate).forEach(date => {
    slotsByDate[date].sort((a, b) => {
      return a.startTime.localeCompare(b.startTime);
    });
  });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background/90 to-background/90">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2 text-foreground">
            Reservations | Reservation Dashboard
          </h1>
          <p className="text-muted-foreground">
            View and manage your court reservations.
          </p>
        </div>
        
        <Tabs defaultValue="my-reservations" className="space-y-6">
          <TabsList className="mb-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border border-border/50">
            <TabsTrigger value="my-reservations">My Reservations</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-reservations" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-foreground">
                My Reservations
              </h2>
              <Button className="bg-primary hover:bg-primary/90">Book New Court</Button>
            </div>
            
            {sortedDates.length > 0 ? (
              sortedDates.map(date => (
                <Card key={date} className="border border-input bg-card shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-foreground">
                      {format(new Date(date), "EEEE, MMMM d, yyyy")}
                    </CardTitle>
                    <CardDescription>
                      Your scheduled court reservations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {reservationsByDate[date].map(reservation => {
                        const court = getCourts().find(c => c.id === reservation.timeSlot.courtId);
                        
                        return (
                          <div 
                            key={reservation.id}
                            className={`${SLOT_COLORS.BOOKED.BG} ${SLOT_COLORS.BOOKED.TEXT} min-h-[4rem] rounded-sm flex items-center px-4 transition-all duration-300 hover:scale-[1.01]`}
                          >
                            <div className="flex items-center justify-between w-full gap-4">
                              <div className="min-w-[150px]">
                                <span className="font-semibold text-base">
                                  {court?.name || 'Unknown Court'}
                                </span>
                                <div className="text-sm text-amber-700">
                                  ({reservation.players} player{reservation.players !== 1 ? 's' : ''})
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 flex-1 justify-center">
                                <Clock className="h-5 w-5" />
                                <span className="text-lg font-semibold whitespace-nowrap">
                                  {reservation.timeSlot.startTime} - {reservation.timeSlot.endTime}
                                </span>
                              </div>

                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="border-amber-500 text-amber-800 hover:bg-amber-100">
                                  Edit
                                </Button>
                                <Button size="sm" variant="destructive">
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border border-input bg-card shadow-sm">
                <CardContent className="py-8 text-center">
                  <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-xl font-medium mb-2">No Reservations Found</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    You don't have any court reservations yet. Book a court to get started!
                  </p>
                  <Button className="bg-primary hover:bg-primary/90">Book a Court</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="upcoming" className="space-y-6">
            <Card className="border border-border/50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-lg shadow-primary/5">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Upcoming Reservations
                </CardTitle>
                <CardDescription>
                  Your future court bookings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-muted-foreground text-sm">
                  This tab will show your upcoming reservations.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="border border-border/50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-lg shadow-primary/5">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Reservation History
                </CardTitle>
                <CardDescription>
                  Your past court bookings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-muted-foreground text-sm">
                  This tab will show your past reservations history.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card className="border border-border/50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-lg shadow-primary/5">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Reservation Settings
                </CardTitle>
                <CardDescription>
                  Configure your reservation preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-muted-foreground text-sm">
                  Reservation settings will be available in a future update.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />

      {/* Court Edit Dialog */}
      {editingCourt && (
        <EditCourtForm
          court={editingCourt}
          isOpen={!!editingCourt}
          onClose={() => setEditingCourt(null)}
          onSave={handleEditCourt}
        />
      )}

      {/* Court Schedule Dialog */}
      {schedulingCourt && (
        <ScheduleCourtForm
          court={schedulingCourt}
          isOpen={!!schedulingCourt}
          onClose={() => setSchedulingCourt(null)}
          onSave={handleScheduleCourt}
        />
      )}

      {/* Delete Court Confirmation */}
      {showDeleteConfirm && (
        <Dialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
          <DialogContent className="sm:max-w-[425px] border border-border/50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-lg shadow-primary/5">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-destructive">
                Delete Court
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-muted-foreground">
                Are you sure you want to delete this court? This action cannot be undone.
              </p>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowDeleteConfirm(null)}
                className="border-border/50"
              >
                Cancel
              </Button>
              <Button 
                type="button"
                variant="destructive"
                onClick={() => handleDeleteCourt(showDeleteConfirm)}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 