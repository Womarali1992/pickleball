"use client";

import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Clock, Users, Mail, Phone, Calendar, Info, Star } from "lucide-react";
import { format } from 'date-fns';
import { Court } from '@/lib/types';
import { COLORS } from "@/lib/constants";
import { SlotStatus } from '@/components/TimeSlotCell'; // Reuse SlotStatus type

interface DayViewTimeSlotProps {
    court: Court;
    hour: number;
    slotStatus: SlotStatus;
    popoverId: string;
    openPopoverId: string | null;
    togglePopover: (id: string) => void;
    onScheduleCourt: (court: Court) => void; // For booking action
    selectedDate: Date; // Needed for popover display
}

const DayViewTimeSlot: React.FC<DayViewTimeSlotProps> = ({
    court,
    hour,
    slotStatus,
    popoverId,
    openPopoverId,
    togglePopover,
    onScheduleCourt,
    selectedDate,
}) => {

    const isClinic = !!slotStatus.slot?.clinicDetails;

    // Determine background class based on status
    let bgClass = "";
    if (isClinic) {
        bgClass = `${COLORS.CLINIC.BG} ${COLORS.CLINIC.TEXT}`;
    // TODO: Add check for MY_BOOKING if needed
    } else if (slotStatus.available && !slotStatus.reserved) {
        bgClass = `${COLORS.AVAILABLE.BG} ${COLORS.AVAILABLE.TEXT}`;
    } else if (slotStatus.reservation) { // Booked by anyone
        bgClass = `${COLORS.BOOKED.BG} ${COLORS.BOOKED.TEXT}`;
    } else { // Blocked or unavailable
        bgClass = `${COLORS.BLOCKED.BG} ${COLORS.BLOCKED.TEXT}`;
    }

    return (
        <Popover open={openPopoverId === popoverId} onOpenChange={() => togglePopover(popoverId)}>
            <PopoverTrigger asChild>
                <div
                    className={`h-16 w-full rounded-md ${bgClass} flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity`}
                    title={slotStatus.reason}
                >
                    <div className="flex items-center justify-between w-full px-4">
                        <span className="text-sm font-medium">
                            {`${hour}:00`}
                        </span>
                        <span className="text-sm font-medium">
                            {isClinic
                                ? (
                                    <div className="flex flex-col items-end">
                                        <span className="truncate max-w-[150px]">{slotStatus.slot?.clinicDetails?.title}</span>
                                        <span className="text-xs text-muted-foreground">with {slotStatus.slot?.clinicDetails?.coachName}</span>
                                    </div>
                                )
                                : slotStatus.available && !slotStatus.reserved
                                    ? "Available"
                                    : slotStatus.reservation
                                        ? "Booked"
                                        : "Blocked"}
                        </span>
                    </div>
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0">
                {isClinic && slotStatus.slot?.clinicDetails ? (
                    // Clinic Popover Content
                    <>
                        <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 p-3 text-white rounded-t">
                            <h4 className="font-bold text-base">{slotStatus.slot.clinicDetails.title}</h4>
                            <p className="text-sm font-medium">with {slotStatus.slot.clinicDetails.coachName}</p>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="text-sm text-muted-foreground">
                                {slotStatus.slot.clinicDetails.description || 'No description.'}
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{slotStatus.slot.startTime} - {slotStatus.slot.endTime}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{format(selectedDate, "MMMM d, yyyy")}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">Max: {slotStatus.slot.clinicDetails.maxParticipants}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Star className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">Level: {slotStatus.slot.clinicDetails.skillLevel}</span>
                                </div>
                            </div>
                            <div className="bg-green-100 rounded p-2 flex justify-between items-center text-green-800">
                                <span className="font-medium">Price</span>
                                <span className="font-bold text-lg">${slotStatus.slot.clinicDetails.price}</span>
                            </div>
                            {/* Add View Details Button if needed */}
                        </div>
                    </>
                ) : slotStatus.reservation ? (
                    // Reservation Popover Content (Simplified example)
                    <div className="p-4 space-y-2">
                        <h4 className="font-semibold">Booking Details</h4>
                        <p>Player: {slotStatus.reservation.playerName}</p>
                        <p>Time: {slotStatus.slot?.startTime}</p>
                        {/* Add more reservation details here */}
                        {/* Add Edit/Cancel buttons? */}
                    </div>
                ) : slotStatus.available ? (
                    // Available Slot Popover Content (Simplified example)
                    <div className="p-4 space-y-2">
                        <h4 className="font-semibold">Available Slot</h4>
                        <p>Time: {slotStatus.slot?.startTime}</p>
                        <Button size="sm" onClick={() => onScheduleCourt(court)}>Book Now</Button>
                    </div>
                ) : (
                    // Blocked Slot Popover Content
                    <div className="p-4">
                        <h4 className="font-semibold">Blocked/Unavailable</h4>
                        <p>{slotStatus.reason}</p>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
};

export default DayViewTimeSlot; 