"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { format, addDays, startOfWeek } from "date-fns";
import { timeSlots } from "@/lib/data";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ScheduleCourtFormProps {
  court: {
    id: string;
    name: string;
  };
  selectedDate?: Date;
  onSubmit: (scheduleData: any) => void;
  onCancel: () => void;
}

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

const ScheduleCourtForm = ({ court, selectedDate: initialDate, onSubmit, onCancel }: ScheduleCourtFormProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialDate || new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(selectedDate || new Date()));
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  
  // Update selected date when prop changes
  useEffect(() => {
    if (initialDate) {
      setSelectedDate(initialDate);
      setCurrentWeekStart(startOfWeek(initialDate));
    }
  }, [initialDate]);
  
  // Get unique time slots without dates for selection
  const timeOptions = Array.from(
    new Set(
      timeSlots.map(slot => `${slot.startTime}-${slot.endTime}`)
    )
  );

  const handlePreviousWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, -7));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, 7));
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(currentWeekStart, i);
    return {
      date,
      dayName: format(date, "EEE"),
      dayNumber: format(date, "d"),
      isToday: format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd"),
      isSelected: selectedDate && format(date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd"),
      dayOfWeek: date.getDay()
    };
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate) {
      alert("Please select a date");
      return;
    }
    
    if (!name || !email) {
      alert("Please fill in your name and email");
      return;
    }
    
    const scheduleData = {
      courtId: court.id,
      date: format(selectedDate, "yyyy-MM-dd"),
      availableTimeSlots,
      name,
      email
    };
    
    onSubmit(scheduleData);
  };
  
  const toggleTimeSlot = (timeSlot: string) => {
    setAvailableTimeSlots(prev => 
      prev.includes(timeSlot) 
        ? prev.filter(t => t !== timeSlot) 
        : [...prev, timeSlot]
    );
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border-2 border-primary/20 shadow-lg bg-gradient-to-br from-background via-background/95 to-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Schedule {court.name}
          </h2>
          
          {/* Day Selector Section */}
          <div className="space-y-3 mb-6">
            <Label className="text-sm font-medium">Select Date</Label>
            <div className="bg-gradient-to-br from-background/50 via-background/40 to-background/30 rounded-lg p-4 border-2 border-primary/20">
              <div className="flex items-center justify-between mb-4">
                <Button 
                  variant="outline" 
                  onClick={handlePreviousWeek}
                  className="border-2 border-primary/30 hover:bg-primary/10"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" /> Previous Week
                </Button>
                <h2 className="text-sm font-medium text-foreground/80">
                  {format(currentWeekStart, "MMMM d")} - {format(addDays(currentWeekStart, 6), "MMMM d, yyyy")}
                </h2>
                <Button 
                  variant="outline" 
                  onClick={handleNextWeek}
                  className="border-2 border-primary/30 hover:bg-primary/10"
                >
                  Next Week <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {weekDays.map(({ date, dayName, dayNumber, isToday, isSelected, dayOfWeek }) => (
                  <Card
                    key={format(date, "yyyy-MM-dd")}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedDate(date)}
                  >
                    <CardContent className={`p-2 text-center bg-gradient-to-br ${DAY_GRADIENTS[dayOfWeek as keyof typeof DAY_GRADIENTS]} text-white rounded-md`}>
                      <div className={`text-xs font-medium ${isToday ? "text-white" : "text-white/90"}`}>
                        {dayName}
                      </div>
                      <div className={`text-lg font-bold ${isToday ? "text-white" : "text-white/90"}`}>
                        {dayNumber}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
          
          {/* Time Slots Section */}
          <div className="space-y-3 mb-6">
            <Label className="text-sm font-medium">Available Time Slots</Label>
            <div className="grid grid-cols-2 gap-3 bg-gradient-to-br from-background/50 via-background/40 to-background/30 rounded-lg p-4 border-2 border-primary/20">
              {timeOptions.map(timeSlot => (
                <div key={timeSlot} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`time-${timeSlot}`}
                    checked={availableTimeSlots.includes(timeSlot)}
                    onCheckedChange={() => toggleTimeSlot(timeSlot)}
                    className="border-2 border-primary/50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                  />
                  <Label 
                    htmlFor={`time-${timeSlot}`} 
                    className="cursor-pointer text-sm font-medium"
                  >
                    {timeSlot}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Booking Information */}
          <div className="space-y-4 pt-4 border-t-2 border-primary/20">
            <h3 className="font-medium text-foreground/80">Booking Information</h3>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  className="border-2 border-primary/30 focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="border-2 border-primary/30 focus-visible:ring-primary"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="border-2 border-primary/30 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={!selectedDate || availableTimeSlots.length === 0 || !name || !email}
            >
              Save Schedule
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default ScheduleCourtForm; 