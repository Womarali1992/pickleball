"use client";

import React, { useState } from "react";
import { format, startOfWeek, addDays } from "date-fns";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Clinic, Court } from "@/lib/types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

// Define gradient classes for each day of the week
const DAY_GRADIENTS = {
  0: "from-blue-500/80 to-blue-600/80", // Sunday
  1: "from-purple-500/80 to-purple-600/80", // Monday
  2: "from-pink-500/80 to-pink-600/80", // Tuesday
  3: "from-orange-500/80 to-orange-600/80", // Wednesday
  4: "from-green-500/80 to-green-600/80", // Thursday
  5: "from-red-500/80 to-red-600/80", // Friday
  6: "from-indigo-500/80 to-indigo-600/80", // Saturday
} as const;

interface ScheduleClinicFormProps {
  isOpen: boolean;
  onClose: () => void;
  clinic: Clinic;
  onSchedule: (date: Date, timeSlots: string[], courtId: string) => void;
  courts: Court[];
}

const ScheduleClinicForm: React.FC<ScheduleClinicFormProps> = ({
  isOpen,
  onClose,
  clinic,
  onSchedule,
  courts
}) => {
  const { toast } = useToast();
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [selectedCourtId, setSelectedCourtId] = useState<string>(courts[0]?.id || "");

  // Generate time slots based on clinic duration
  const generateTimeSlots = () => {
    const slots: string[] = [];
    const startHour = 9; // 9 AM
    const endHour = 21; // 9 PM
    const duration = clinic.duration || 60;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += duration) {
        const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const endMinute = (minute + duration) % 60;
        const endHour = hour + Math.floor((minute + duration) / 60);
        const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
        slots.push(`${startTime}-${endTime}`);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

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

  const toggleTimeSlot = (timeSlot: string) => {
    setSelectedTimeSlots(prev => 
      prev.includes(timeSlot) 
        ? prev.filter(t => t !== timeSlot) 
        : [...prev, timeSlot]
    );
  };

  const handleSchedule = () => {
    if (!selectedDate || selectedTimeSlots.length === 0 || !selectedCourtId) {
      toast({
        title: "Missing Information",
        description: "Please select a date, court, and at least one time slot.",
        variant: "destructive"
      });
      return;
    }

    onSchedule(selectedDate, selectedTimeSlots, selectedCourtId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-2xl font-bold">Schedule Clinic</DialogTitle>
          <DialogDescription>
            Schedule instances of "{clinic.title}" for the selected week.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Date Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Select Date</Label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousWeek}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextWeek}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map(({ date, dayName, dayNumber, isToday, isSelected, dayOfWeek }) => (
                <Card
                  key={date.toISOString()}
                  className={`cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedDate(date)}
                >
                  <CardContent className={`p-2 text-center bg-gradient-to-br ${DAY_GRADIENTS[dayOfWeek as keyof typeof DAY_GRADIENTS]}`}>
                    <div className="text-xs font-medium text-white/90">{dayName}</div>
                    <div className={`text-lg font-bold ${isToday ? 'text-white' : 'text-white/80'}`}>
                      {dayNumber}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          {/* Time Slots */}
          {selectedDate && (
            <div className="space-y-3">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium">
                      Available Time Slots for {format(selectedDate, "MMMM d, yyyy")}
                    </Label>
                    {selectedCourtId && (
                      <Badge variant="secondary" className="ml-2">
                        Court {courts.find(c => c.id === selectedCourtId)?.name}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <Tabs 
                  value={selectedCourtId} 
                  onValueChange={setSelectedCourtId}
                  className="w-full"
                >
                  <TabsList className="w-full grid grid-cols-3">
                    {courts.map((court) => (
                      <TabsTrigger 
                        key={court.id} 
                        value={court.id}
                        className="text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      >
                        Court {court.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-gradient-to-br from-background/50 via-background/40 to-background/30 rounded-lg p-4 border-2 border-primary/20">
                {timeSlots.map(timeSlot => (
                  <div key={timeSlot} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`time-${timeSlot}`}
                      checked={selectedTimeSlots.includes(timeSlot)}
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
          )}
        </div>
        
        <DialogFooter className="mt-6 flex justify-end space-x-4 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-2 border-primary/30 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSchedule}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={!selectedDate || selectedTimeSlots.length === 0 || !selectedCourtId}
          >
            Schedule Clinic
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleClinicForm; 