// Mock data for the pickleball court reservation system
import { format, addDays } from "date-fns";

export type Court = {
  id: string;
  name: string;
  location: string;
  indoor: boolean;
  orientation?: 'horizontal' | 'vertical';
  placement?: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  verticalAlignment?: 'left' | 'right';
};

export type TimeSlot = {
  id: string;
  courtId: string;
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
};

export type Reservation = {
  id: string;
  courtId: string;
  timeSlotId: string;
  playerName: string;
  playerEmail: string;
  playerPhone: string;
  players: number;
  status: 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
};

// Default courts data
const defaultCourts: Court[] = [
  {
    id: "court1",
    name: "Court 1",
    location: "Main Building",
    indoor: true,
    orientation: "horizontal",
    placement: "top-center",
  },
  {
    id: "court2",
    name: "Court 2",
    location: "Main Building",
    indoor: true,
    orientation: "horizontal", 
    placement: "center",
  },
  {
    id: "court3",
    name: "Court 3",
    location: "Outdoor Area",
    indoor: false,
    orientation: "vertical",
    placement: "bottom-left",
    verticalAlignment: "left",
  },
  {
    id: "court4",
    name: "Court 4",
    location: "Outdoor Area",
    indoor: false,
    orientation: "vertical",
    placement: "bottom-right",
    verticalAlignment: "right",
  },
];

// Load courts from localStorage or use defaults
export const loadCourts = (): Court[] => {
  if (typeof window !== 'undefined') {
    const savedCourts = localStorage.getItem('pickleball-courts');
    if (savedCourts) {
      try {
        return JSON.parse(savedCourts);
      } catch (e) {
        console.error('Error loading courts from localStorage:', e);
        return defaultCourts;
      }
    }
  }
  return defaultCourts;
};

// Save courts to localStorage
export const saveCourts = (updatedCourts: Court[]): boolean => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('pickleball-courts', JSON.stringify(updatedCourts));
      console.log('Courts saved successfully:', updatedCourts);
      return true;
    } catch (e) {
      console.error('Error saving courts to localStorage:', e);
      return false;
    }
  }
  return false;
};

// Courts - now using the loading function as a function rather than a variable
export const getCourts = (): Court[] => {
  return typeof window !== 'undefined' ? loadCourts() : defaultCourts;
};

// Special time slots (manually defined)
export const specialTimeSlots: TimeSlot[] = [
  // Add custom time slot for April 25, 2025 at 9:00 AM
  {
    id: "future-slot-2025-04-25-9am",
    courtId: "court1",
    date: "2025-04-25",
    startTime: "9:00",
    endTime: "10:00",
    available: false, // Not available because it's reserved
  }
];

// Helper function to generate time slots
function generateTimeSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const startDate = new Date(); // Today's date
  const hours = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
  
  console.log("Generating time slots starting from:", format(startDate, "yyyy-MM-dd"));
  
  // For each of the next 7 days
  for (let day = 0; day < 7; day++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + day);
    const dateString = formatDate(currentDate);
    
    console.log(`Generating slots for date: ${dateString}`);
    
    // For each court
    getCourts().forEach(court => {
      // For each hour
      hours.forEach((hour, index) => {
        const endHour = hours[index + 1] || "19:00";
        
        // Create a predictable ID for the slot
        const slotId = `slot${day}${court.id.replace("court", "")}${hour.replace(":", "")}`;
        
        // FORCE most slots to be available - only specific slots will be unavailable
        // Fixed slot for 9:00 AM today on Court 1 to be booked by John Smith
        const isJohnSmithSlot = day === 0 && hour === "09:00" && court.id === "court1";
        
        // Reserve a few slots programmatically - all others are available
        const isReserved = isJohnSmithSlot || 
                          (court.id === "court2" && hour === "14:00") || 
                          (court.id === "court3" && hour === "17:00") ||
                          (day === 2 && court.id === "court4");
        
        slots.push({
          id: slotId,
          courtId: court.id,
          date: dateString,
          startTime: hour,
          endTime: endHour,
          available: !isReserved, // Most slots will be available
        });
        
        // Log sample slot for debugging
        if (day === 0 && hour === "09:00" && court.id === "court1") {
          console.log("Today's 9:00 AM Court 1 slot ID:", slotId);
          console.log("Is this slot available?", !isReserved);
        }
      });
    });
  }
  
  console.log(`Total time slots generated: ${slots.length}`);
  return slots;
}

// Generate time slots first
const generatedTimeSlots = generateTimeSlots();

// Generate current date for consistent date handling
const currentDate = new Date();
const currentDateString = formatDate(currentDate);

// Add a today's reservation that explicitly matches a time slot
export const todayReservation: Reservation = {
  id: "today-res-1",
  courtId: "court1",
  timeSlotId: `slot0${"court1".replace("court", "")}${"09:00".replace(":", "")}`, // Should match today's 9AM Court 1 slot
  playerName: "TODAY TEST BOOKING",
  playerEmail: "today@example.com",
  playerPhone: "(555) 111-2222",
  players: 2,
  status: "confirmed",
  createdAt: new Date().toISOString(),
};

// Remove any conflicting slots (same court, same date, same time)
const filteredTimeSlots = generatedTimeSlots.filter(slot => {
  // Check if this slot conflicts with any special slot
  return !specialTimeSlots.some(specialSlot => 
    specialSlot.courtId === slot.courtId && 
    specialSlot.date === slot.date && 
    (specialSlot.startTime === slot.startTime || 
     parseInt(specialSlot.startTime) === parseInt(slot.startTime))
  );
});

// Combine normal and special time slots
export const timeSlots: TimeSlot[] = [
  ...filteredTimeSlots,
  ...specialTimeSlots
];

// Special reservations (manually defined)
export const specialReservations: Reservation[] = [
  // Add reservation for April 25, 2025
  {
    id: "future-res-2025",
    courtId: "court1",
    timeSlotId: "future-slot-2025-04-25-9am",
    playerName: "Future Booking",
    playerEmail: "future@example.com",
    playerPhone: "(555) 999-9999",
    players: 2,
    status: "confirmed",
    createdAt: "2024-04-01T08:30:00Z",
  }
];

// Combine all reservations
export const reservations: Reservation[] = [
  // Add today's reservation
  todayReservation,
  
  // Add existing sample reservations
  {
    id: "res1",
    courtId: "court1",
    timeSlotId: "slot01", // 9am today on court1
    playerName: "John Smith",
    playerEmail: "john@example.com",
    playerPhone: "(555) 123-4567",
    players: 4,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  },
  {
    id: "res2",
    courtId: "court2",
    timeSlotId: "slot5",
    playerName: "Sarah Johnson",
    playerEmail: "sarah@example.com",
    playerPhone: "(555) 987-6543",
    players: 2,
    status: "confirmed",
    createdAt: "2023-12-01T11:30:00Z",
  },
  {
    id: "res3",
    courtId: "court3",
    timeSlotId: "slot10",
    playerName: "Michael Brown",
    playerEmail: "michael@example.com",
    playerPhone: "(555) 456-7890",
    players: 4,
    status: "confirmed",
    createdAt: "2023-12-02T09:15:00Z",
  },
  {
    id: "res4",
    courtId: "court1",
    timeSlotId: "slot15",
    playerName: "Emma Wilson",
    playerEmail: "emma@example.com",
    playerPhone: "(555) 234-5678",
    players: 3,
    status: "confirmed",
    createdAt: "2023-12-03T14:20:00Z",
  },
  {
    id: "res5",
    courtId: "court2",
    timeSlotId: "slot20",
    playerName: "David Lee",
    playerEmail: "david@example.com",
    playerPhone: "(555) 876-5432",
    players: 2,
    status: "confirmed",
    createdAt: "2023-12-04T08:45:00Z",
  },
  {
    id: "res6",
    courtId: "court4",
    timeSlotId: "slot25",
    playerName: "Jennifer Garcia",
    playerEmail: "jennifer@example.com",
    playerPhone: "(555) 345-6789",
    players: 4,
    status: "confirmed",
    createdAt: "2023-12-05T15:30:00Z",
  },
  ...specialReservations  // Add the special reservations
];

// Users
export const users: User[] = [
  {
    id: "user1",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
  },
  {
    id: "user2",
    name: "John Smith",
    email: "john@example.com",
    role: "user",
  },
  {
    id: "user3",
    name: "Jane Doe",
    email: "jane@example.com",
    role: "user",
  },
];

// Helper function to format date as YYYY-MM-DD
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
} 