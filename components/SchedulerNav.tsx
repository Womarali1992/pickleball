"use client";

import React, { useState } from 'react';
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Search } from "lucide-react";
import { format } from 'date-fns';

interface SchedulerNavProps {
    currentDate: Date;
    onPreviousDay: () => void;
    onNextDay: () => void;
    onToday: () => void;
    onSetSpecificDate: (date: Date | undefined) => void;
    title?: string;
}

const SchedulerNav: React.FC<SchedulerNavProps> = ({
    currentDate,
    onPreviousDay,
    onNextDay,
    onToday,
    onSetSpecificDate,
    title = "Schedule | Court Schedule", // Default title
}) => {
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [searchDate, setSearchDate] = useState<string>("");

    // Handle manual date input search
    const handleSearchDate = () => {
        try {
            const date = new Date(searchDate + 'T00:00:00'); // Try parsing YYYY-MM-DD
            if (isNaN(date.getTime())) {
                throw new Error("Invalid date");
            }
            onSetSpecificDate(date);
            setSearchDate(""); // Clear input after search
        } catch (error) {
            console.error("Invalid date format. Please use YYYY-MM-DD");
            // TODO: Add user feedback for invalid date format
        }
    };

    // Handle keyboard events for date input
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearchDate();
        }
    };

    // Handler for calendar selection
    const handleCalendarSelect = (date: Date | undefined) => {
        onSetSpecificDate(date);
        setCalendarOpen(false); // Close popover on selection
    };

    return (
        <>
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0 pb-2">
                <CardTitle className="text-lg md:text-xl font-bold text-foreground">
                    {title}
                </CardTitle>
                <div className="flex items-center space-x-1 sm:space-x-2 flex-wrap gap-y-1">
                    <Button variant="outline" size="sm" onClick={onPreviousDay}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={onToday}>
                        Today
                    </Button>
                    <Button variant="outline" size="sm" onClick={onNextDay}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>

                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                Calendar
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                mode="single"
                                selected={currentDate}
                                onSelect={handleCalendarSelect} // Use specific handler
                                initialFocus
                                fromYear={2024} // Consider making these dynamic or props
                                toYear={2030}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </CardHeader>
            
            {/* Date search form and current date display moved outside header for potentially better layout control */}
            <div className="px-1 md:px-4 pt-2 pb-4 space-y-3">
                <div className="flex gap-2">
                    <Input
                        placeholder="Go to date (YYYY-MM-DD)"
                        value={searchDate}
                        onChange={(e) => setSearchDate(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="h-9"
                    />
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleSearchDate}
                        className="whitespace-nowrap"
                    >
                        <Search className="h-4 w-4 mr-1" />
                        Go
                    </Button>
                </div>

                <div className="text-center">
                    <h3 className="text-lg font-semibold">
                        {format(currentDate, "EEEE, MMMM d, yyyy")}
                    </h3>
                </div>
            </div>
        </>
    );
};

export default SchedulerNav; 