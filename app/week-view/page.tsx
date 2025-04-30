"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WeekViewCourt from "@/components/WeekViewCourt";
import { getCourts } from "@/lib/data";
import { format, addDays, startOfWeek } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Mock time slots data for the week
const generateMockTimeSlots = (courtId: string, startDate: Date) => {
  const weekStart = startOfWeek(startDate, { weekStartsOn: 1 });
  const slots = [];
  
  // Generate slots for each day of the week
  for (let day = 0; day < 7; day++) {
    const date = format(addDays(weekStart, day), "yyyy-MM-dd");
    
    // Generate time slots for each day (9am to 7pm)
    for (let hour = 9; hour < 19; hour++) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
      
      // Randomly determine availability (more available later in the week)
      const isAvailable = Math.random() > 0.7 + (0.3 * (6-day)/6);
      
      slots.push({
        id: `slot-${courtId}-${date}-${startTime}`,
        courtId,
        date,
        startTime,
        endTime,
        available: isAvailable,
      });
    }
  }
  
  return slots;
};

export default function WeekViewPage() {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 }) // Start on Monday
  );
  
  const courts = getCourts();
  
  const handlePreviousWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, -7));
  };
  
  const handleNextWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, 7));
  };
  
  const handleSelectTimeSlot = (timeSlot: any, date: Date) => {
    console.log("Selected time slot:", timeSlot, "on", format(date, "EEEE, MMMM d"));
    alert(`Selected time slot: ${timeSlot.startTime} - ${timeSlot.endTime} on ${format(date, "EEEE, MMMM d")}`);
  };

  // Format week range for display
  const weekEndDate = addDays(currentWeekStart, 6);
  const weekRangeDisplay = `${format(currentWeekStart, "MMM d")} - ${format(weekEndDate, "MMM d, yyyy")}`;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Week View</h1>
          <p className="text-muted-foreground">
            7-day court booking schedule
          </p>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" onClick={handlePreviousWeek}>
            <ChevronLeft className="h-4 w-4 mr-2" /> Previous Week
          </Button>
          <h2 className="text-xl font-semibold">{weekRangeDisplay}</h2>
          <Button variant="outline" onClick={handleNextWeek}>
            Next Week <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        <div className="space-y-8">
          {courts.map(court => (
            <WeekViewCourt 
              key={court.id}
              court={court}
              timeSlots={generateMockTimeSlots(court.id, currentWeekStart)}
              onSelectTimeSlot={handleSelectTimeSlot}
              startDate={currentWeekStart}
              aspectRatio="aspect-[22/10]"
            />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
} 