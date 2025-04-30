"use client";

import { useState } from "react";
import { format, addDays, startOfWeek } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DaySelectorProps {
  onSelectDate: (date: Date) => void;
  selectedDate?: Date;
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

export default function DaySelector({ onSelectDate, selectedDate = new Date() }: DaySelectorProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(selectedDate));

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

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" onClick={handlePreviousWeek}>
          <ChevronLeft className="h-4 w-4 mr-2" /> Previous Week
        </Button>
        <h2 className="text-xl font-semibold">
          {format(currentWeekStart, "MMMM d")} - {format(addDays(currentWeekStart, 6), "MMMM d, yyyy")}
        </h2>
        <Button variant="outline" onClick={handleNextWeek}>
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
            onClick={() => onSelectDate(date)}
          >
            <CardContent className={`p-4 text-center bg-gradient-to-br ${DAY_GRADIENTS[dayOfWeek as keyof typeof DAY_GRADIENTS]} text-white`}>
              <div className={`text-sm font-medium ${isToday ? "text-white" : "text-white/90"}`}>
                {dayName}
              </div>
              <div className={`text-2xl font-bold ${isToday ? "text-white" : "text-white/90"}`}>
                {dayNumber}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 