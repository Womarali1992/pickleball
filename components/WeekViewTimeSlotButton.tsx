"use client";

import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, Users, Star, Info } from "lucide-react";
import { format } from 'date-fns';
import { TimeSlot, Court } from '@/lib/types';
import { COLORS } from "@/lib/constants";
import { SlotStatus } from './TimeSlotCell'; // Reuse SlotStatus type

interface WeekViewTimeSlotButtonProps {
    slot: TimeSlot; // Original slot data for display
    status: SlotStatus; // Full status from hook
    date: Date; // Date for context
    popoverId: string;
    openPopoverId: string | null;
    togglePopover: (id: string) => void;
    handleSlotClick: (slot: TimeSlot, date: Date) => void;
    renderClinicPopover: (slot: TimeSlot, date: Date) => React.ReactNode;
}

const WeekViewTimeSlotButton: React.FC<WeekViewTimeSlotButtonProps> = ({
    slot,
    status,
    date,
    popoverId,
    openPopoverId,
    togglePopover,
    handleSlotClick,
    renderClinicPopover,
}) => {

    const isClinic = !!status.slot?.clinicDetails;

    let bgColor;
    let statusLabel;

    if (isClinic) {
        bgColor = `${COLORS.CLINIC.BG} ${COLORS.CLINIC.HOVER}`;
        statusLabel = COLORS.CLINIC.LABEL;
    // TODO: Add MY_BOOKING check if needed
    } else if (status.available) {
        bgColor = `${COLORS.AVAILABLE.BG} ${COLORS.AVAILABLE.HOVER}`;
        statusLabel = COLORS.AVAILABLE.LABEL;
    } else if (status.reserved) {
        bgColor = status.reservation
            ? `${COLORS.BOOKED.BG} ${COLORS.BOOKED.HOVER}`
            : `${COLORS.BLOCKED.BG} ${COLORS.BLOCKED.HOVER}`;
        statusLabel = status.reservation ? COLORS.BOOKED.LABEL : COLORS.BLOCKED.LABEL;
    } else {
        bgColor = `${COLORS.BLOCKED.BG} ${COLORS.BLOCKED.HOVER}`;
        statusLabel = COLORS.BLOCKED.LABEL;
    }

    const buttonClassName = `w-full whitespace-nowrap rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input hover:text-accent-foreground px-1 py-1 court-slot flex flex-col items-center justify-center ${bgColor} text-white`;

    return (
        <React.Fragment>
            {isClinic ? (
                <Popover open={openPopoverId === popoverId} onOpenChange={() => togglePopover(popoverId)}>
                    <PopoverTrigger asChild>
                        <button className={buttonClassName}>
                            <span className="text-xs font-medium flex items-center">
                                <span>{slot.startTime}</span>
                                <Info className="h-3 w-3 ml-1" />
                            </span>
                            <span className="text-xs text-muted-foreground">{statusLabel}</span>
                        </button>
                    </PopoverTrigger>
                    {/* Pass slot and date to the render function provided by parent */}
                    {renderClinicPopover(slot, date)}
                </Popover>
            ) : (
                <button
                    onClick={() => handleSlotClick(slot, date)}
                    className={buttonClassName}
                    disabled={!status.available} // Disable button if not available
                    title={status.reason}
                >
                    <span className="text-xs font-medium">{slot.startTime}</span>
                    <span className="text-xs text-muted-foreground">{statusLabel}</span>
                </button>
            )}
        </React.Fragment>
    );
};

export default WeekViewTimeSlotButton; 