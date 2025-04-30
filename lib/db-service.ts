// This file simulates a database service for reservations
import { Court, Reservation, TimeSlot, specialTimeSlots, specialReservations } from './data';

// In-memory "database" for our app
class ReservationDB {
  private static instance: ReservationDB;
  private customTimeSlots: TimeSlot[] = [...specialTimeSlots];
  private customReservations: Reservation[] = [...specialReservations];

  private constructor() {
    // Load any stored data from localStorage if in browser
    this.loadFromStorage();
  }

  public static getInstance(): ReservationDB {
    if (!ReservationDB.instance) {
      ReservationDB.instance = new ReservationDB();
    }
    return ReservationDB.instance;
  }

  // Persist to localStorage if in browser environment
  private saveToStorage() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('customTimeSlots', JSON.stringify(this.customTimeSlots));
        localStorage.setItem('customReservations', JSON.stringify(this.customReservations));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
  }

  // Load from localStorage if in browser environment
  private loadFromStorage() {
    if (typeof window !== 'undefined') {
      try {
        const storedSlots = localStorage.getItem('customTimeSlots');
        const storedReservations = localStorage.getItem('customReservations');
        
        if (storedSlots) {
          this.customTimeSlots = JSON.parse(storedSlots);
        }
        
        if (storedReservations) {
          this.customReservations = JSON.parse(storedReservations);
        }
      } catch (error) {
        console.error('Error loading from localStorage:', error);
      }
    }
  }

  // Get all custom time slots
  public getCustomTimeSlots(): TimeSlot[] {
    return this.customTimeSlots;
  }

  // Get all custom reservations
  public getCustomReservations(): Reservation[] {
    return this.customReservations;
  }

  // Add a custom time slot
  public addTimeSlot(slot: TimeSlot): TimeSlot {
    this.customTimeSlots.push(slot);
    this.saveToStorage();
    return slot;
  }

  // Add a reservation
  public addReservation(reservation: Reservation): Reservation {
    this.customReservations.push(reservation);
    this.saveToStorage();
    return reservation;
  }

  // Get time slots for a specific date
  public getTimeSlotsForDate(date: string): TimeSlot[] {
    return this.customTimeSlots.filter(slot => slot.date === date);
  }

  // Get reservations for a specific date
  public getReservationsForDate(date: string, timeSlots: TimeSlot[]): Reservation[] {
    const slotIds = timeSlots.map(slot => slot.id);
    return this.customReservations.filter(res => 
      slotIds.includes(res.timeSlotId)
    );
  }
}

export const dbService = ReservationDB.getInstance(); 