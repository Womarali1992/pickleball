"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Clock, User, Mail, Phone, FileText } from "lucide-react";

interface ScheduleCourtFormProps {
  court: {
    id: string;
    name: string;
    selectedTime?: string;
  };
  selectedDate: Date;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const ScheduleCourtForm = ({ court, selectedDate, onSubmit, onCancel }: ScheduleCourtFormProps) => {
  const [selectedDateState] = useState<Date>(selectedDate);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(court.selectedTime || null);
  const [bookingInfo, setBookingInfo] = useState({
    playerName: '',
    email: '',
    phone: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTimeSlot) {
      alert('Please select a time slot');
      return;
    }
    onSubmit({
      date: selectedDateState,
      timeSlot: selectedTimeSlot,
      ...bookingInfo
    });
  };

  return (
    <div className="space-y-6">
      <DialogHeader className="border-b pb-4">
        <DialogTitle className="text-2xl font-bold">Book Court {court.name}</DialogTitle>
        <DialogDescription>
          Reserve your court for {format(selectedDateState, "MMMM d, yyyy")}
        </DialogDescription>
      </DialogHeader>

      <Card className="border-2 border-primary/20 shadow-lg bg-gradient-to-br from-background via-background/95 to-background/90">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center space-x-2 text-primary">
            <Clock className="h-5 w-5" />
            <span className="font-medium">{court.selectedTime}</span>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6">
          <div className="space-y-2">
            <Label htmlFor="playerName" className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Player Name
            </Label>
            <Input
              id="playerName"
              value={bookingInfo.playerName}
              onChange={(e) => setBookingInfo({ ...bookingInfo, playerName: e.target.value })}
              className="border-2 border-primary/30 focus-visible:ring-primary"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={bookingInfo.email}
              onChange={(e) => setBookingInfo({ ...bookingInfo, email: e.target.value })}
              className="border-2 border-primary/30 focus-visible:ring-primary"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              value={bookingInfo.phone}
              onChange={(e) => setBookingInfo({ ...bookingInfo, phone: e.target.value })}
              className="border-2 border-primary/30 focus-visible:ring-primary"
              placeholder="Enter your phone number"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Additional Notes
            </Label>
            <Textarea
              id="notes"
              value={bookingInfo.notes}
              onChange={(e) => setBookingInfo({ ...bookingInfo, notes: e.target.value })}
              className="h-20 border-2 border-primary/30 focus-visible:ring-primary"
              placeholder="Any special requests or notes"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-2 border-primary/30 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Confirm Booking
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ScheduleCourtForm; 