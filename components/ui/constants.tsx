/**
 * UI Constants for consistent styling across the application
 */

// Color constants for court availability
export const COLORS = {
  // Available slots styling
  AVAILABLE: {
    BG: "bg-green-500",
    HOVER: "hover:bg-green-600",
    BORDER: "border-green-400",
    TEXT: "text-white",
    TEXT_SMALL: "text-green-100",
    LABEL: "Available",
  },
  
  // Booked slots styling (by other users)
  BOOKED: {
    BG: "bg-blue-500",
    HOVER: "hover:bg-blue-600",
    BORDER: "border-blue-400",
    TEXT: "text-white",
    TEXT_SMALL: "text-blue-100",
    LABEL: "Booked",
  },
  
  // User's own bookings styling
  MY_BOOKING: {
    BG: "bg-blue-700",
    HOVER: "hover:bg-blue-800",
    BORDER: "border-blue-600",
    TEXT: "text-white",
    TEXT_SMALL: "text-blue-100",
    LABEL: "My Booking",
  },
  
  // Blocked slots styling (admin blocked)
  BLOCKED: {
    BG: "bg-blue-300",
    HOVER: "hover:bg-blue-400", 
    BORDER: "border-blue-400",
    TEXT: "text-white",
    TEXT_SMALL: "text-blue-100",
    LABEL: "Blocked",
  }
}; 