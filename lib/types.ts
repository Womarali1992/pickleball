export interface TimeSlot {
  id?: string;
  courtId: string;
  courtName?: string;
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
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