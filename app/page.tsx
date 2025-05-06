"use client";

import { useState } from "react";
import Footer from "@/components/Footer";
import CourtCalendar from "@/components/CourtCalendar";
import DaySelector from "@/components/DaySelector";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ReservationForm from "@/components/ReservationForm";
import ConfirmationModal from "@/components/ConfirmationModal";
import { TimeSlot } from "@/lib/types";

export default function Index() {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [confirmedReservationId, setConfirmedReservationId] = useState<string | null>(null);
  const [calendarKey, setCalendarKey] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleSelectTimeSlot = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot);
  };

  const handleCancelReservation = () => {
    setSelectedTimeSlot(null);
  };

  const handleCompleteReservation = (reservationId: string) => {
    setSelectedTimeSlot(null);
    setConfirmedReservationId(reservationId);
    setCalendarKey(prev => prev + 1);
  };

  const handleCloseConfirmation = () => {
    setConfirmedReservationId(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Book Court | Home
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Browse available courts, select your preferred time, and secure your spot in just a few clicks.
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Select Date</h2>
          <DaySelector 
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </div>
        
        <CourtCalendar 
          key={calendarKey} 
          onSelectTimeSlot={handleSelectTimeSlot}
          selectedDate={selectedDate}
        />
        
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
      </main>
      
      <Footer />
      
      <ConfirmationModal
        open={confirmedReservationId !== null}
        onClose={handleCloseConfirmation}
        reservationId={confirmedReservationId || ""}
      />
    </div>
  );
} 