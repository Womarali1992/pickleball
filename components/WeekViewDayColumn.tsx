"use client";

import React from 'react';
import { TimeSlot, Court } from '@/lib/types';
import { SlotStatus } from './TimeSlotCell'; // Reuse SlotStatus type
import WeekViewTimeSlotButton from './WeekViewTimeSlotButton';

interface FormattedDateInfo {
    date: Date;
    displayDate: string;
    formattedDate: string;
}

interface WeekViewDayColumnProps {
    dayInfo: FormattedDateInfo;
    slotsForDay: TimeSlot[];
    court: Court; // Needed for getStatus
    getStatus: (court: Court, day: Date, hour: number) => SlotStatus;
    openPopoverId: string | null;
    togglePopover: (id: string) => void;
    handleSlotClick: (slot: TimeSlot, date: Date) => void;
    renderClinicPopover: (slot: TimeSlot, date: Date) => React.ReactNode;
}

const WeekViewDayColumn: React.FC<WeekViewDayColumnProps> = ({
    dayInfo,
    slotsForDay,
    court,
    getStatus,
    openPopoverId,
    togglePopover,
    handleSlotClick,
    renderClinicPopover
}) => {
    return (
        <div className="flex flex-col border-r last:border-r-0">
            {/* Day header */}
            <div className="bg-gray-100/80 p-3 text-center border-b border-gray-200">
                <div className="text-sm font-semibold text-gray-700">{dayInfo.displayDate}</div>
            </div>
            
            {/* Time slots for the day */}
            <div className="flex-1 overflow-y-auto p-2">
                {slotsForDay.length > 0 ? (
                    <div className="space-y-2">
                        {slotsForDay.map((slot) => {
                            const hour = parseInt(slot.startTime.split(':')[0]);
                            const status = getStatus(court, dayInfo.date, hour);
                            const slotId = slot.id || `${slot.courtId}-${slot.date}-${slot.startTime}`;

                            return (
                                <WeekViewTimeSlotButton 
                                    key={slotId}
                                    slot={slot}
                                    status={status}
                                    date={dayInfo.date}
                                    popoverId={slotId}
                                    openPopoverId={openPopoverId}
                                    togglePopover={togglePopover}
                                    handleSlotClick={handleSlotClick}
                                    renderClinicPopover={renderClinicPopover}
                                />
                            );
                        })}
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                        No slots
                    </div>
                )}
            </div>
        </div>
    );
};

export default WeekViewDayColumn; 