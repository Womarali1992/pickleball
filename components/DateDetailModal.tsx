"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { reservations, getCourts, timeSlots } from "@/lib/data";

interface DateDetailModalProps {
  open: boolean;
  date: string;
  onClose: () => void;
}

export default function DateDetailModal({
  open,
  date,
  onClose,
}: DateDetailModalProps) {
  if (!open) return null;

  // Filter reservations for the selected date
  const dateReservations = reservations.filter(reservation => {
    const timeSlot = timeSlots.find(ts => ts.id === reservation.timeSlotId);
    return timeSlot && timeSlot.date === date;
  });

  // Sort reservations by time
  const sortedReservations = [...dateReservations].sort((a, b) => {
    const timeSlotA = timeSlots.find(ts => ts.id === a.timeSlotId);
    const timeSlotB = timeSlots.find(ts => ts.id === b.timeSlotId);
    
    if (!timeSlotA || !timeSlotB) return 0;
    return timeSlotA.startTime.localeCompare(timeSlotB.startTime);
  });

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-auto">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            {format(new Date(date), "EEEE, MMMM d, yyyy")}
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-10 w-10 rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Reservations ({sortedReservations.length})
          </h2>

          {sortedReservations.length > 0 ? (
            <div className="space-y-4">
              {sortedReservations.map(reservation => {
                const timeSlot = timeSlots.find(ts => ts.id === reservation.timeSlotId);
                const court = getCourts().find(c => c.id === reservation.courtId);
                
                return (
                  <div 
                    key={reservation.id}
                    className="bg-card/95 border border-border/50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-lg">{reservation.playerName}</h3>
                          <Badge variant="outline" className="border-primary/20">
                            {reservation.players} player{reservation.players !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {reservation.playerEmail} • {reservation.playerPhone}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-right">
                          <div className="font-medium text-base">{court?.name}</div>
                          <div className="text-muted-foreground">
                            {timeSlot?.startTime} - {timeSlot?.endTime}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="border-primary/20 hover:bg-primary/10">
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" className="border-destructive/20 hover:bg-destructive/10 hover:text-destructive">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-card/95 border border-border/50 rounded-lg">
              <p className="text-muted-foreground">No reservations for this date</p>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose} className="bg-primary/90 hover:bg-primary/80">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
} 