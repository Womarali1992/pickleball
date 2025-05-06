"use client";

import React from 'react';
import { Court, TimeSlot, Reservation } from '@/lib/types';
import { Badge } from "@/components/ui/badge";
import DayViewTimeSlot from './DayViewTimeSlot';
import { SlotStatus } from './TimeSlotCell'; // Reuse SlotStatus type

interface DayViewCourtCardProps {
    court: Court;
    selectedDate: Date;
    hours: number[]; // Array of hours to display (e.g., [8, 9, ..., 21])
    getStatus: (court: Court, day: Date, hour: number) => SlotStatus; // Function from useSchedulerStatus hook
    openPopoverId: string | null;
    togglePopover: (id: string) => void;
    onScheduleCourt: (court: Court) => void;
}

const DayViewCourtCard: React.FC<DayViewCourtCardProps> = ({
    court,
    selectedDate,
    hours,
    getStatus,
    openPopoverId,
    togglePopover,
    onScheduleCourt,
}) => {
    return (
        <div
            key={court.id}
            className="border rounded-lg shadow-sm overflow-hidden bg-card"
        >
            <div className="bg-muted p-3 font-medium border-b flex justify-between items-center">
                <span>{court.name}</span>
                <Badge variant="outline" className="text-xs border-border">
                    {court.indoor ? 'Indoor' : 'Outdoor'}
                </Badge>
            </div>
            <div className="p-3">
                <div className="space-y-2">
                    {hours.map(hour => {
                        const slotStatus = getStatus(court, selectedDate, hour);
                        // Popover ID needs court, date, and hour to be unique across cards/days if view changes
                        // Let's stick to court-hour for simplicity within DayView for now.
                        const popoverId = `${court.id}-${hour}`;
                        
                        return (
                            <DayViewTimeSlot
                                key={popoverId} // Use popoverId as key
                                court={court}
                                hour={hour}
                                slotStatus={slotStatus}
                                popoverId={popoverId}
                                openPopoverId={openPopoverId}
                                togglePopover={togglePopover}
                                onScheduleCourt={onScheduleCourt}
                                selectedDate={selectedDate}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default DayViewCourtCard; 