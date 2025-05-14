import { User, Coach, Clinic } from './types';

// In-memory database for demo purposes
// In a real application, you would use a proper database like PostgreSQL, MongoDB, etc.
let users: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    duprRating: 4.25,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    phoneNumber: '+1234567890',
    skillLevel: 'intermediate',
    membershipStatus: 'active',
    preferredCourts: ['Court 1', 'Court 2']
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    duprRating: 4.75,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    phoneNumber: '+1987654321',
    skillLevel: 'advanced',
    membershipStatus: 'active',
    preferredCourts: ['Court 3']
  }
];

// // Use localStorage for coaches
// let coaches: Coach[] = []; // Keep this for server-side rendering baseline

// Storage keys
const COACHES_STORAGE_KEY = 'pickleball_coaches';
const CLINICS_STORAGE_KEY = 'pickleball_clinics';

// Helper functions for coach data persistence
const loadCoachesFromStorage = (): Coach[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const storedCoaches = localStorage.getItem(COACHES_STORAGE_KEY);
    if (!storedCoaches) return [];
    
    // Parse and ensure dates are properly handled
    return JSON.parse(storedCoaches).map((coach: any) => ({
      ...coach,
      createdAt: coach.createdAt ? new Date(coach.createdAt) : new Date(),
      updatedAt: coach.updatedAt ? new Date(coach.updatedAt) : new Date(),
      // Ensure specialties is always an array
      specialties: Array.isArray(coach.specialties) ? coach.specialties : []
    }));
  } catch (error) {
    console.error('Error loading coaches from localStorage:', error);
    return [];
  }
};

const saveCoachesToStorage = (coaches: Coach[]): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    localStorage.setItem(COACHES_STORAGE_KEY, JSON.stringify(coaches));
    return true;
  } catch (error) {
    console.error('Error saving coaches to localStorage:', error);
    return false;
  }
};

// Helper functions for clinic data persistence
const loadClinicsFromStorage = (): Clinic[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const storedClinics = localStorage.getItem(CLINICS_STORAGE_KEY);
    console.log('Loading clinics from storage:', storedClinics);
    
    // Initialize with default clinics if none exist
    if (!storedClinics) {
      const defaultClinics = [
        {
          id: 'clinic-1',
          title: 'Beginner Workshop',
          description: 'Introduction to pickleball basics',
          coachId: 'coach-1',
          price: 30,
          maxParticipants: 8,
          skillLevel: 'beginner',
          duration: '1',
          schedule: 'Every Monday',
          date: new Date(),
          startTime: '09:00',
          endTime: '10:00',
          courtId: 'court1',
          enrolled: 0,
          participants: [],
          status: 'scheduled',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      console.log('Initializing with default clinics:', defaultClinics);
      saveClinicToStorage(defaultClinics);
      return defaultClinics;
    }
    
    // Parse and ensure dates are properly handled
    const clinics = JSON.parse(storedClinics).map((clinic: any) => ({
      ...clinic,
      date: clinic.date ? new Date(clinic.date) : new Date(),
      createdAt: clinic.createdAt ? new Date(clinic.createdAt) : new Date(),
      updatedAt: clinic.updatedAt ? new Date(clinic.updatedAt) : new Date(),
      // Ensure participants is always an array
      participants: Array.isArray(clinic.participants) ? clinic.participants : []
    }));
    console.log('Parsed clinics:', clinics);
    return clinics;
  } catch (error) {
    console.error('Error loading clinics from localStorage:', error);
    return [];
  }
};

const saveClinicToStorage = (clinics: Clinic[]): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    console.log('Saving clinics to storage:', clinics);
    localStorage.setItem(CLINICS_STORAGE_KEY, JSON.stringify(clinics));
    
    // Update the window timeSlots with clinic slots
    if (typeof window !== 'undefined') {
      const currentSlots = (window as any).timeSlots || [];
      const nonClinicSlots = currentSlots.filter((slot: any) => !slot.id?.startsWith('clinic-'));
      const clinicSlots = clinics.map(clinic => ({
        id: `clinic-${clinic.id}`,
        courtId: clinic.courtId,
        courtName: `Clinic: ${clinic.title}`,
        date: typeof clinic.date === 'string' ? clinic.date : clinic.date.toISOString().split('T')[0],
        startTime: clinic.startTime,
        endTime: clinic.endTime,
        available: false,
        type: 'clinic',
        clinicId: clinic.id,
        clinicDetails: {
          coachId: clinic.coachId,
          coachName: coachDb.getCoachById(clinic.coachId)?.name || 'Unknown Coach',
          title: clinic.title,
          description: clinic.description,
          price: clinic.price,
          skillLevel: clinic.skillLevel,
          maxParticipants: clinic.maxParticipants,
          status: clinic.status,
          enrolled: clinic.enrolled || 0,
          participants: clinic.participants || []
        }
      }));
      (window as any).timeSlots = [...nonClinicSlots, ...clinicSlots];
      console.log('Updated window.timeSlots:', (window as any).timeSlots);
      
      // Trigger update event
      window.dispatchEvent(new CustomEvent('timeSlotsUpdated', {
        detail: { timeSlots: (window as any).timeSlots }
      }));
    }
    
    return true;
  } catch (error) {
    console.error('Error saving clinics to localStorage:', error);
    return false;
  }
};

// Generate a unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
};

// Coach database operations
export const coachDb = {
  // Get all coaches with proper client/server handling
  getAllCoaches: (): Coach[] => {
    return loadCoachesFromStorage();
  },

  // Get coach by ID with null safety
  getCoachById: (id: string): Coach | null => {
    if (!id) return null;
    const coaches = loadCoachesFromStorage();
    return coaches.find(coach => coach.id === id) || null;
  },

  // Get coach by email with null safety
  getCoachByEmail: (email: string): Coach | null => {
    if (!email) return null;
    const coaches = loadCoachesFromStorage();
    return coaches.find(coach => coach.email.toLowerCase() === email.toLowerCase()) || null;
  },

  // Create new coach with validation
  createCoach: (coachData: Omit<Coach, 'id' | 'createdAt' | 'updatedAt'>): Coach | null => {
    // Basic validation
    if (!coachData.name || !coachData.email) {
      console.error('Coach name and email are required');
      return null;
    }
    
    const coaches = loadCoachesFromStorage();
    
    // Check for duplicate email
    if (coaches.some(c => c.email.toLowerCase() === coachData.email.toLowerCase())) {
      console.error('A coach with this email already exists');
      return null;
    }
    
    const newCoach: Coach = {
      ...coachData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      rating: coachData.rating ?? 0,
      status: coachData.status ?? 'active',
      specialties: Array.isArray(coachData.specialties) ? coachData.specialties : []
    };
    
    const updatedCoaches = [...coaches, newCoach];
    const success = saveCoachesToStorage(updatedCoaches);
    
    return success ? newCoach : null;
  },

  // Update coach with validation
  updateCoach: (id: string, coachData: Partial<Coach>): Coach | null => {
    if (!id) return null;
    
    const coaches = loadCoachesFromStorage();
    const coachIndex = coaches.findIndex(coach => coach.id === id);
    
    if (coachIndex === -1) {
      console.error(`Coach with ID ${id} not found`);
      return null;
    }
    
    // If email is being updated, check for duplicates
    if (coachData.email && 
        coachData.email !== coaches[coachIndex].email && 
        coaches.some(c => c.id !== id && c.email.toLowerCase() === coachData.email!.toLowerCase())) {
      console.error('A coach with this email already exists');
      return null;
    }
    
    const updatedCoach: Coach = {
      ...coaches[coachIndex],
      ...coachData,
      updatedAt: new Date(),
      // Ensure specialties is always an array if provided
      specialties: coachData.specialties ? 
        (Array.isArray(coachData.specialties) ? coachData.specialties : []) : 
        coaches[coachIndex].specialties
    };
    
    const updatedCoaches = [...coaches];
    updatedCoaches[coachIndex] = updatedCoach;
    
    const success = saveCoachesToStorage(updatedCoaches);
    return success ? updatedCoach : null;
  },

  // Delete coach
  deleteCoach: (id: string): boolean => {
    if (!id) return false;
    
    const coaches = loadCoachesFromStorage();
    const updatedCoaches = coaches.filter(coach => coach.id !== id);
    
    // If nothing was filtered out, coach wasn't found
    if (updatedCoaches.length === coaches.length) {
      console.error(`Coach with ID ${id} not found`);
      return false;
    }
    
    return saveCoachesToStorage(updatedCoaches);
  },
  
  // Get clinics for coach
  getClinicsByCoachId: (coachId: string): Clinic[] => {
    if (!coachId) return [];
    const clinics = loadClinicsFromStorage();
    return clinics.filter(clinic => clinic.coachId === coachId);
  },
  
  // Create clinic
  createClinic: (clinicData: Omit<Clinic, 'id' | 'createdAt' | 'updatedAt'>): Clinic | null => {
    if (!clinicData.coachId || !clinicData.title || !clinicData.date || !clinicData.courtId) {
      console.error('Coach ID, title, date and court ID are required for a clinic');
      return null;
    }
    
    const clinics = loadClinicsFromStorage();
    
    const newClinic: Clinic = {
      ...clinicData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      enrolled: clinicData.enrolled || 0,
      status: clinicData.status || 'scheduled'
    };
    
    const updatedClinics = [...clinics, newClinic];
    const success = saveClinicToStorage(updatedClinics);
    
    return success ? newClinic : null;
  },
  
  // Update clinic
  updateClinic: (id: string, clinicData: Partial<Clinic>): Clinic | null => {
    if (!id) return null;
    
    const clinics = loadClinicsFromStorage();
    const clinicIndex = clinics.findIndex(clinic => clinic.id === id);
    
    if (clinicIndex === -1) {
      console.error(`Clinic with ID ${id} not found`);
      return null;
    }
    
    const updatedClinic: Clinic = {
      ...clinics[clinicIndex],
      ...clinicData,
      updatedAt: new Date()
    };
    
    const updatedClinics = [...clinics];
    updatedClinics[clinicIndex] = updatedClinic;
    
    const success = saveClinicToStorage(updatedClinics);
    return success ? updatedClinic : null;
  },
  
  // Delete clinic
  deleteClinic: (id: string): boolean => {
    if (!id) return false;
    
    const clinics = loadClinicsFromStorage();
    const updatedClinics = clinics.filter(clinic => clinic.id !== id);
    
    if (updatedClinics.length === clinics.length) {
      console.error(`Clinic with ID ${id} not found`);
      return false;
    }
    
    return saveClinicToStorage(updatedClinics);
  }
};

// User database operations
export const userDb = {
  // Get all users
  getAllUsers: () => users,

  // Get user by ID
  getUserById: (id: string) => users.find(user => user.id === id),

  // Get user by email
  getUserByEmail: (email: string) => users.find(user => user.email === email),

  // Create new user
  createUser: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newUser: User = {
      ...userData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    users.push(newUser);
    return newUser;
  },

  // Update user
  updateUser: (id: string, userData: Partial<User>) => {
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) return null;

    const updatedUser = {
      ...users[userIndex],
      ...userData,
      updatedAt: new Date()
    };
    users[userIndex] = updatedUser;
    return updatedUser;
  },

  // Delete user
  deleteUser: (id: string) => {
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) return false;
    users.splice(userIndex, 1);
    return true;
  },

  // Update DUPR rating
  updateDuprRating: (id: string, newRating: number) => {
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) return null;

    const updatedUser = {
      ...users[userIndex],
      duprRating: newRating,
      updatedAt: new Date()
    };
    users[userIndex] = updatedUser;
    return updatedUser;
  }
}; 