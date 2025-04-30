"use client";

import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CourtCard from "@/components/CourtCard";
import { getCourts } from "@/lib/data";
import { format } from "date-fns";

// Mock time slots data with many time slots for demonstration
const mockTimeSlots = [
  // Court 1 time slots
  {
    id: "slot010900",
    courtId: "court1",
    date: "2025-04-26",
    startTime: "09:00",
    endTime: "10:00",
    available: false,
  },
  {
    id: "slot011000",
    courtId: "court1",
    date: "2025-04-26",
    startTime: "10:00",
    endTime: "11:00",
    available: false,
  },
  {
    id: "slot011100",
    courtId: "court1",
    date: "2025-04-26",
    startTime: "11:00",
    endTime: "12:00",
    available: false,
  },
  {
    id: "slot011200",
    courtId: "court1",
    date: "2025-04-26",
    startTime: "12:00",
    endTime: "13:00",
    available: false,
  },
  {
    id: "slot011300",
    courtId: "court1",
    date: "2025-04-26",
    startTime: "13:00",
    endTime: "14:00",
    available: false,
  },
  {
    id: "slot011400",
    courtId: "court1",
    date: "2025-04-26",
    startTime: "14:00",
    endTime: "15:00",
    available: false,
  },
  {
    id: "slot011500",
    courtId: "court1",
    date: "2025-04-26",
    startTime: "15:00",
    endTime: "16:00",
    available: true,
  },
  {
    id: "slot011600",
    courtId: "court1",
    date: "2025-04-26",
    startTime: "16:00",
    endTime: "17:00",
    available: true,
  },
  {
    id: "slot011700",
    courtId: "court1",
    date: "2025-04-26",
    startTime: "17:00",
    endTime: "18:00",
    available: true,
  },
  {
    id: "slot011800",
    courtId: "court1",
    date: "2025-04-26",
    startTime: "18:00",
    endTime: "19:00",
    available: true,
  },
];

export default function CourtDemoPage() {
  const courts = getCourts();
  const courtOne = courts.find(court => court.id === "court1") || courts[0];

  const handleSelectTimeSlot = (timeSlot: any) => {
    console.log("Selected time slot:", timeSlot);
    alert(`Selected time slot: ${timeSlot.startTime} - ${timeSlot.endTime}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Court Booking Demo</h1>
          <p className="text-muted-foreground">
            Horizontal court display with 20x11 aspect ratio
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Date: {format(new Date(), "MMMM d, yyyy")}</h2>
          
          {/* Court card with 20x11 aspect ratio */}
          <CourtCard 
            court={courtOne}
            timeSlots={mockTimeSlots}
            onSelectTimeSlot={handleSelectTimeSlot}
            aspectRatio="aspect-[20/11]"
          />
        </div>
      </main>
      <Footer />
    </div>
  );
} 