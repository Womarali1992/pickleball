/**
 * UI Constants for consistent styling across the application
 */

// Color constants for court availability
export const COLORS = {
  // Available slots styling
  AVAILABLE: {
    BG: "bg-green-200",
    HOVER: "hover:bg-green-300",
    BORDER: "border-green-400",
    TEXT: "text-green-800",
    TEXT_SMALL: "text-green-700",
    LABEL: "Available",
  },
  
  // Booked slots styling (by other users)
  BOOKED: {
    BG: "bg-blue-200",
    HOVER: "hover:bg-blue-300",
    BORDER: "border-blue-400",
    TEXT: "text-blue-800",
    TEXT_SMALL: "text-blue-700",
    LABEL: "Booked",
  },
  
  // User's own bookings styling
  MY_BOOKING: {
    BG: "bg-amber-100",
    HOVER: "hover:bg-amber-200",
    BORDER: "border-amber-400",
    TEXT: "text-amber-800",
    TEXT_SMALL: "text-amber-700",
    LABEL: "My Booking",
  },
  
  // Blocked slots styling (admin blocked)
  BLOCKED: {
    BG: "bg-gray-200",
    HOVER: "hover:bg-gray-300", 
    BORDER: "border-gray-400",
    TEXT: "text-gray-800",
    TEXT_SMALL: "text-gray-700",
    LABEL: "Blocked",
  },

  // Clinic slots styling
  CLINIC: {
    BG: "bg-yellow-500", // Gold background
    HOVER: "hover:bg-yellow-600", // Darker gold on hover
    BORDER: "border-yellow-600", // Gold border
    TEXT: "text-white", // White text for contrast
    TEXT_SMALL: "text-yellow-100", // Light gold for small text
    LABEL: "Clinic",
  }
}; 