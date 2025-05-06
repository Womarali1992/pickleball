// This file simulates a database service for reservations
import { Court, Reservation, TimeSlot } from './data';
import { coachDb } from './db';
import { Clinic } from './types';

// Local storage keys for reservations and clinics
const CUSTOM_RESERVATIONS_KEY = 'custom-reservations';
const CLINIC_SLOTS_KEY = 'clinic-slots';

// Helper for localStorage access
const getItem = (key: string) => {
  if (typeof window === 'undefined') return null;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return null;
  }
};

const setItem = (key: string, value: any) => {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
    return false;
  }
};

// Singleton DB service instance
class ReservationDB {
  private static instance: ReservationDB;
  private customReservations: Reservation[] = [];
  private clinicSlots: TimeSlot[] = [];
  
  private constructor() {
    // Load data from localStorage
    this.loadFromStorage();
    
    // Add some test clinics if none exist
    if (this.clinicSlots.length === 0) {
      this.addTestClinics();
    }
  }
  
  public static getInstance(): ReservationDB {
    if (!ReservationDB.instance) {
      ReservationDB.instance = new ReservationDB();
    }
    return ReservationDB.instance;
  }
  
  private loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        const reservations = getItem(CUSTOM_RESERVATIONS_KEY);
        if (reservations) this.customReservations = reservations;
        
        const clinicSlots = getItem(CLINIC_SLOTS_KEY);
        if (clinicSlots) this.clinicSlots = clinicSlots;
        
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
      }
    }
  }
  
  // Add test clinic data for development
  private addTestClinics(): void {
    // Create a few test clinics for different days and courts
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    const testClinics: TimeSlot[] = [
      {
        id: "test-clinic-1",
        courtId: "court1",
        courtName: "Clinic: Beginner Workshop",
        date: this.formatDate(today),
        startTime: "14:00",
        endTime: "16:00",
        available: false
      },
      {
        id: "test-clinic-2",
        courtId: "court2",
        courtName: "Clinic: Advanced Techniques",
        date: this.formatDate(tomorrow),
        startTime: "10:00",
        endTime: "12:00",
        available: false
      },
      {
        id: "test-clinic-3",
        courtId: "court3",
        courtName: "Clinic: Youth Training",
        date: this.formatDate(today),
        startTime: "16:00",
        endTime: "18:00",
        available: false
      }
    ];
    
    this.clinicSlots = testClinics;
    setItem(CLINIC_SLOTS_KEY, this.clinicSlots);
  }
  
  // Helper to format date as YYYY-MM-DD
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
  
  public getCustomReservations(): Reservation[] {
    return this.customReservations;
  }
  
  public addCustomReservation(reservation: Reservation): boolean {
    this.customReservations.push(reservation);
    return setItem(CUSTOM_RESERVATIONS_KEY, this.customReservations);
  }
  
  public getClinicTimeSlots(): TimeSlot[] {
    return this.clinicSlots;
  }
  
  public updateClinicTimeSlots(): TimeSlot[] {
    try {
      // Get all clinics from the coach database
      const allClinics: Clinic[] = [];
      const coaches = coachDb.getAllCoaches();
      
      // For each coach, get their clinics
      coaches.forEach(coach => {
        const coachClinics = coachDb.getClinicsByCoachId(coach.id);
        if (coachClinics && coachClinics.length > 0) {
          // Only include scheduled clinics
          const scheduledClinics = coachClinics.filter(clinic => clinic.status === 'scheduled');
          allClinics.push(...scheduledClinics);
        }
      });
      
      // Convert clinics to time slots (marked as unavailable)
      this.clinicSlots = allClinics.map(clinic => {
        // Generate a unique ID for the clinic slot
        const slotId = `clinic-${clinic.id}`;
        
        // Format date as string (YYYY-MM-DD)
        const dateStr = typeof clinic.date === 'string' 
          ? clinic.date 
          : clinic.date instanceof Date 
            ? clinic.date.toISOString().split('T')[0] 
            : new Date(clinic.date).toISOString().split('T')[0];

        // Get coach details
        const coach = coachDb.getCoachById(clinic.coachId);
        const coachName = coach ? coach.name : 'Unknown Coach';

        return {
          id: slotId,
          courtId: clinic.courtId,
          courtName: `Clinic: ${clinic.title}`,
          date: dateStr,
          startTime: clinic.startTime,
          endTime: clinic.endTime,
          available: false, // Clinics block the court
          type: 'clinic', // Mark as clinic type
          clinicId: clinic.id, // Include clinic ID
          clinicDetails: { // Populate clinic details
            coachId: clinic.coachId,
            coachName: coachName,
            title: clinic.title,
            description: clinic.description,
            price: clinic.price,
            skillLevel: clinic.skillLevel,
            maxParticipants: clinic.maxParticipants,
            status: clinic.status,
            enrolled: clinic.enrolled || 0,
            participants: clinic.participants || []
          }
        };
      });
      
      // Save to localStorage
      setItem(CLINIC_SLOTS_KEY, this.clinicSlots);
      
      // Update the window timeSlots with clinic slots
      if (typeof window !== 'undefined') {
        const currentSlots = (window as any).timeSlots || [];
        const nonClinicSlots = currentSlots.filter((slot: any) => !slot.id?.startsWith('clinic-'));
        (window as any).timeSlots = [...nonClinicSlots, ...this.clinicSlots];
        
        // Trigger update event
        window.dispatchEvent(new CustomEvent('timeSlotsUpdated', {
          detail: { timeSlots: (window as any).timeSlots }
        }));
      }
      
      return this.clinicSlots;
    } catch (error) {
      console.error('Error updating clinic time slots:', error);
      return [];
    }
  }
  
  public clearAllCustomData(): boolean {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(CUSTOM_RESERVATIONS_KEY);
        localStorage.removeItem(CLINIC_SLOTS_KEY);
        this.customReservations = [];
        this.clinicSlots = [];
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error clearing custom data:', error);
      return false;
    }
  }
}

// Export the singleton instance
export const dbService = ReservationDB.getInstance(); 