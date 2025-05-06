import { useMemo } from 'react';
import { TimeSlot, Reservation, Court } from '@/lib/types';
import { SlotStatus } from '@/components/TimeSlotCell';
import { format } from 'date-fns';

// Helper to create consistent map keys
const createMapKey = (courtId: string, date: string, hour: number): string => {
    return `${courtId}-${date}-${hour}`;
};

export const useSchedulerStatus = (timeSlots: TimeSlot[] = [], reservations: Reservation[] = []) => {

    // Memoize lookup maps for efficiency
    const dataMaps = useMemo(() => {
        // console.log("Recalculating scheduler status maps..."); // Removed log
        const slotMap = new Map<string, TimeSlot>();
        const reservationMap = new Map<string, Reservation>();

        // Populate reservation map (keyed by timeSlotId)
        reservations.forEach(reservation => {
            if (reservation.timeSlotId) {
                reservationMap.set(reservation.timeSlotId, reservation);
            }
        });

        // Populate regular time slot map (keyed by courtId-date-hour)
        // This map now contains generated, special, and clinic slots from the timeSlots prop
        timeSlots.forEach(slot => {
            if (!slot.id) return; // Skip slots without ID
            const hour = parseInt(slot.startTime.split(':')[0]);
            if (!isNaN(hour)) {
                const key = createMapKey(slot.courtId, slot.date, hour);
                slotMap.set(key, slot);
            }
        });

        // Return maps without specialSlotMap
        return { slotMap, reservationMap };

    // Update dependencies
    }, [timeSlots, reservations]);

    // Function to get status for a specific cell
    const getStatus = (court: Court, day: Date, hour: number): SlotStatus => {
        const formattedDate = format(day, "yyyy-MM-dd");
        const key = createMapKey(court.id, formattedDate, hour);

        const slot = dataMaps.slotMap.get(key); // Get the potential slot from the combined map

        // Check the slot found in the combined slotMap
        if (slot) {
            const reservation = slot.id ? dataMaps.reservationMap.get(slot.id) : undefined;
            
            // Clinic slots are identified by clinicDetails and are always unavailable
            if (slot.clinicDetails) {
                 return {
                    available: false,
                    reserved: true,
                    slot: slot, // Pass the slot with clinicDetails
                    reservation: undefined, // Clinics don't have reservations in this model
                    reason: 'Clinic Session',
                 };
            }
            
            // Regular/Special slot availability (handled identically now)
            return {
                available: slot.available,
                reserved: !slot.available || !!reservation,
                slot: slot,
                reservation: reservation,
                reason: reservation ? `Reserved by ${reservation.playerName}` : slot.reason || (slot.available ? 'Available' : 'Reserved'),
            };
        }

        // If no slot found at all for this court/date/hour
        return { available: false, reserved: false, slot: undefined, reservation: undefined, reason: 'Unavailable' };
    };

    return { getStatus };
};