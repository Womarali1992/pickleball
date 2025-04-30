"use client";

import { useState } from "react";
import { TimeSlot } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { createReservation } from "@/lib/api";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

// Court configuration
const COURT_CONFIG = {
  "court1": { orientation: "horizontal", name: "Court 1" },
  "court2": { orientation: "vertical", verticalAlignment: "left", name: "Court 2" },
  "court3": { orientation: "vertical", verticalAlignment: "right", name: "Court 3" },
};

interface ReservationFormProps {
  selectedTimeSlot: TimeSlot;
  onCancel: () => void;
  onComplete: (reservationId: string) => void;
}

export default function ReservationForm({
  selectedTimeSlot,
  onCancel,
  onComplete,
}: ReservationFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
  }>({});

  const validateForm = () => {
    const newErrors: { name?: string; email?: string; phone?: string } = {};
    let valid = true;

    if (!name.trim()) {
      newErrors.name = "Name is required";
      valid = false;
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
      valid = false;
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const reservation = await createReservation({
        timeSlot: selectedTimeSlot,
        playerName: name,
        playerEmail: email,
        playerPhone: phone,
      });
      
      onComplete(reservation.id);
    } catch (error) {
      console.error("Error creating reservation:", error);
      alert("Failed to create reservation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format the date for display
  const formattedDate = selectedTimeSlot.date ? 
    format(new Date(selectedTimeSlot.date), "MMMM dd, yyyy") : 
    selectedTimeSlot.date;

  // Get court orientation information
  const getCourtOrientationInfo = () => {
    const courtConfig = COURT_CONFIG[selectedTimeSlot.courtId as keyof typeof COURT_CONFIG];
    if (!courtConfig) return "Standard";
    
    if (courtConfig.orientation === 'vertical') {
      return `Vertical ${courtConfig.verticalAlignment === 'left' ? '(Left)' : '(Right)'}`;
    }
    return "Horizontal";
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Reserve Your Court</h2>
      
      <div className="mb-6 p-4 bg-muted/50 rounded-md">
        <h3 className="font-medium mb-2">Selected Time Slot:</h3>
        <div className="flex items-center justify-between mb-1">
          <p className="text-muted-foreground">
            <span className="font-semibold">{selectedTimeSlot.courtName}</span>
          </p>
          <Badge variant="secondary" className="text-xs">
            {getCourtOrientationInfo()}
          </Badge>
        </div>
        <p className="text-muted-foreground mb-1">
          Date: <span className="font-semibold">{formattedDate}</span>
        </p>
        <p className="text-muted-foreground">
          Time: <span className="font-semibold">{selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}</span>
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="john@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.phone ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="(123) 456-7890"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
            )}
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Reserving..." : "Complete Reservation"}
          </Button>
        </div>
      </form>
    </div>
  );
} 