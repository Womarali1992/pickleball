import { TimeSlot, Reservation } from './types';
import { getCourts, timeSlots as mockTimeSlots } from './data';
import { dbService } from './db-service';

// Get available courts
export async function getCourtsApi() {
  return getCourts();
}

// Get available time slots
export async function getTimeSlots(date?: string): Promise<TimeSlot[]> {
  console.log(`Getting time slots for date: ${date || 'all'}`);
  
  const slots = mockTimeSlots
    .filter(slot => !date || slot.date === date)
    .map(slot => {
      const court = getCourts().find(c => c.id === slot.courtId);
      return {
        id: slot.id,
        courtId: slot.courtId,
        courtName: court?.name || 'Unknown Court',
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        available: slot.available
      };
    });
  
  console.log(`Found ${slots.length} time slots for ${date || 'all dates'}`);
  return slots;
}

// Create a new reservation
export async function createReservation(data: {
  timeSlot: TimeSlot;
  playerName: string;
  playerEmail: string;
  playerPhone: string;
}): Promise<Reservation> {
  // Update the time slot to be unavailable
  const slotIndex = mockTimeSlots.findIndex(slot => slot.id === data.timeSlot.id);
  if (slotIndex !== -1) {
    mockTimeSlots[slotIndex].available = false;
    console.log(`Updated slot ${data.timeSlot.id} availability to false`);
  }
  
  const reservation: Reservation = {
    id: `RES-${Math.floor(Math.random() * 10000)}`,
    courtId: data.timeSlot.courtId,
    timeSlotId: data.timeSlot.id,
    playerName: data.playerName,
    playerEmail: data.playerEmail,
    playerPhone: data.playerPhone,
    players: 2,
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };
  
  // Save the reservation using dbService
  try {
    console.log('Saving reservation with user info:', {
      name: data.playerName,
      email: data.playerEmail,
      phone: data.playerPhone
    });
    const savedReservation = dbService.addReservation(reservation);
    return savedReservation;
  } catch (error) {
    console.error('Error saving reservation:', error);
    return reservation; // Fallback to return the unsaved reservation
  }
} 