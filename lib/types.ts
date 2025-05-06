export interface TimeSlot {
  id?: string;
  courtId: string;
  courtName?: string;
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
  reason?: string;
  clinicDetails?: {
    coachId: string;
    coachName: string;
    title: string;
    description?: string;
    price: number;
    skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'all';
    maxParticipants: number;
  };
}

export interface Court {
  id: string;
  name: string;
  location: string;
  indoor: boolean;
  orientation: 'horizontal' | 'vertical';
  placement?: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  verticalAlignment?: 'left' | 'right';
}

export interface Reservation {
  id: string;
  courtId: string;
  timeSlotId: string;
  playerName: string;
  playerEmail: string;
  playerPhone: string;
  players: number;
  status: 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  duprRating: number;
  createdAt: Date;
  updatedAt: Date;
  phoneNumber?: string;
  profileImage?: string;
  skillLevel?: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  preferredCourts?: string[];
  membershipStatus?: 'active' | 'inactive' | 'pending';
}

export interface Coach {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  bio?: string;
  specialties: string[];
  rating: number;
  profileImage?: string;
  availability?: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[];
  status: 'active' | 'inactive' | 'pending';
  certifications?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Clinic {
  id: string;
  coachId: string;
  title: string;
  description?: string;
  date: Date;
  startTime: string;
  endTime: string;
  courtId: string;
  maxParticipants: number;
  enrolled: number;
  price: number;
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'all';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  participants?: string[]; // User IDs of participants
  createdAt: Date;
  updatedAt: Date;
} 