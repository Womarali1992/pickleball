"use client";

import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Clock, Calendar as CalendarIcon, Info, Users, Mail, Phone, Star, Calendar, DollarSign, User, Target } from "lucide-react";
import { format, parseISO } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Court, TimeSlot } from '@/lib/types';
import { Reservation } from '@/lib/data'; // Assuming Reservation type/data needed
import { COLORS } from '@/lib/constants'; // Import shared COLORS
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { dbService } from '@/lib/db-service';
import { coachDb } from '@/lib/db';

// Define the status object structure (ensure this matches getSlotStatus output)
export interface SlotStatus {
    available: boolean;
    reserved: boolean;
    slot: TimeSlot | null | undefined;
    reservation: Reservation | null | undefined;
    reason?: string;
}

// Define props
interface TimeSlotCellProps {
    court: Court;
    day: Date;
    hour: number;
    status: SlotStatus;
    popoverId: string;
    openPopoverId: string | null;
    togglePopover: (id: string) => void;
    onScheduleCourt: (court: Court) => void;
}

// Helper functions (can be passed as props or imported if moved to utils)
const isUserBooking = (reservation: any) => reservation && reservation.id && ['res1', 'res2', 'res3'].includes(reservation.id); // Example
const formatPhone = (phone: string) => phone; // Example

export default function TimeSlotCell({
    court,
    day,
    hour,
    status,
    popoverId,
    openPopoverId,
    togglePopover,
    onScheduleCourt,
}: TimeSlotCellProps) {
    const [bookingInfo, setBookingInfo] = useState({
        name: '',
        email: '',
        phone: ''
    });

    const handleBookingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!status.slot?.clinicDetails) return;

        try {
            // Get the clinic ID from the slot
            const clinicId = status.slot.clinicId;
            if (!clinicId) {
                throw new Error('Clinic ID not found');
            }

            // Get the current clinic
            const currentClinic = coachDb.getClinicsByCoachId(status.slot.clinicDetails.coachId)
                .find(c => c.id === clinicId);

            if (!currentClinic) {
                throw new Error('Clinic not found');
            }

            // Create a new participant object
            const newParticipant = {
                id: `participant-${Date.now()}`,
                name: bookingInfo.name,
                email: bookingInfo.email,
                phone: bookingInfo.phone,
                status: 'confirmed',
                enrolledAt: new Date().toISOString()
            };

            // Update the clinic with new participant
            const updatedClinic = coachDb.updateClinic(clinicId, {
                enrolled: (currentClinic.enrolled || 0) + 1,
                participants: [
                    ...(currentClinic.participants || []),
                    newParticipant
                ]
            });

            if (!updatedClinic) {
                throw new Error('Failed to update clinic');
            }

            // Update the time slot to reflect the new booking
            const updatedSlot = {
                ...status.slot,
                clinicDetails: {
                    ...status.slot.clinicDetails,
                    enrolled: updatedClinic.enrolled,
                    participants: updatedClinic.participants
                }
            };

            // Update the time slot in the booking system
            window.timeSlots = window.timeSlots.map(slot => 
                slot.id === status.slot?.id ? updatedSlot : slot
            );

            // Update clinic slots in the database
            const { dbService } = await import('@/lib/db-service');
            await dbService.updateClinicTimeSlots();

            // Force a refresh of the clinic data
            const updatedClinics = coachDb.getClinicsByCoachId(status.slot.clinicDetails.coachId);
            const refreshedClinic = updatedClinics.find(c => c.id === clinicId);
            
            if (refreshedClinic) {
                // Update the slot again with the refreshed data
                const refreshedSlot = {
                    ...status.slot,
                    clinicDetails: {
                        ...status.slot.clinicDetails,
                        enrolled: refreshedClinic.enrolled,
                        participants: refreshedClinic.participants
                    }
                };

                window.timeSlots = window.timeSlots.map(slot => 
                    slot.id === status.slot?.id ? refreshedSlot : slot
                );

                // Trigger a custom event to notify other components
                window.dispatchEvent(new CustomEvent('timeSlotsUpdated', {
                    detail: { timeSlots: window.timeSlots }
                }));
            }

            // Close the popover and show success message
            togglePopover(popoverId);
            alert('Successfully booked the clinic!');
        } catch (error) {
            console.error('Error booking clinic:', error);
            alert('Failed to book the clinic. Please try again.');
        }
    };

    // Determine background class based on status
    const getCellBackground = (status: SlotStatus) => {
        // Use courtName from slot to identify clinics (adjust if needed)
        if (status.slot?.courtName?.startsWith('Clinic:')) {
            return `${COLORS.CLINIC.BG} ${COLORS.CLINIC.TEXT}`;
        }
        if (status.reservation && isUserBooking(status.reservation)) {
            return `${COLORS.MY_BOOKING.BG} ${COLORS.MY_BOOKING.TEXT}`;
        } else if (status.available) {
            return `${COLORS.AVAILABLE.BG} ${COLORS.AVAILABLE.TEXT}`;
        } else if (status.reserved) {
            // This covers both explicitly reserved and slots marked !available without a specific reservation
            return `${COLORS.BOOKED.BG} ${COLORS.BOOKED.TEXT}`;
        } else {
            // Fallback for truly unavailable/blocked slots
            return `${COLORS.BLOCKED.BG} ${COLORS.BLOCKED.TEXT}`;
        }
    };

    const bgClass = getCellBackground(status);
    const cellClass = "h-6 rounded-sm flex items-center px-1 text-xs court-slot w-full"; // Ensure full width
    // Use courtName from slot to identify clinics (adjust if needed)
    const isClinic = status.slot?.clinicDetails;

    if (isClinic && status.slot?.clinicDetails) {
        const clinicDetails = status.slot.clinicDetails;

        return (
            <Popover open={openPopoverId === popoverId} onOpenChange={() => togglePopover(popoverId)}>
                <PopoverTrigger asChild>
                    <div className={`${cellClass} cursor-pointer justify-between px-2 ${bgClass}`}>
                        <div className="flex items-center overflow-hidden whitespace-nowrap">
                            <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{clinicDetails.title}</span>
                        </div>
                        <Info className="h-3 w-3 flex-shrink-0" />
                    </div>
                </PopoverTrigger>
                <PopoverContent className="w-80 bg-white border shadow-lg">
                    <div className="space-y-4">
                        <div className="border-b pb-3">
                            <h4 className="font-semibold text-lg">{clinicDetails.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{clinicDetails.description}</p>
                        </div>
                        
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Coach</span>
                                <span className="text-sm">{clinicDetails.coachName}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Date</span>
                                <span className="text-sm">{format(new Date(status.slot.date), 'MMM d, yyyy')}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Time</span>
                                <span className="text-sm">{status.slot.startTime} - {status.slot.endTime}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Price</span>
                                <span className="text-sm">${clinicDetails.price}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Participants</span>
                                <span className="text-sm">{clinicDetails.enrolled || 0}/{clinicDetails.maxParticipants}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Skill Level</span>
                                <span className="text-sm capitalize">{clinicDetails.skillLevel}</span>
                            </div>
                        </div>

                        <form onSubmit={handleBookingSubmit} className="space-y-3 pt-3 border-t">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={bookingInfo.name}
                                    onChange={(e) => setBookingInfo(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Your name"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={bookingInfo.email}
                                    onChange={(e) => setBookingInfo(prev => ({ ...prev, email: e.target.value }))}
                                    placeholder="Your email"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={bookingInfo.phone}
                                    onChange={(e) => setBookingInfo(prev => ({ ...prev, phone: e.target.value }))}
                                    placeholder="Your phone number"
                                    required
                                />
                            </div>
                            <Button 
                                type="submit"
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                                Book This Clinic
                            </Button>
                        </form>
                    </div>
                </PopoverContent>
            </Popover>
        );
    } else if (status.reservation) {
        return (
            <Popover open={openPopoverId === popoverId} onOpenChange={() => togglePopover(popoverId)}>
                <PopoverTrigger asChild>
                    <div className={`${cellClass} cursor-pointer justify-between px-2 ${bgClass}`}>
                         <div className="flex items-center overflow-hidden whitespace-nowrap">
                             <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                             <span className="truncate">{`${hour}:00`}</span>
                         </div>
                         <Info className="h-3 w-3 flex-shrink-0" />
                    </div>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-4">
                    <div className="space-y-3">
                        <div className="border-b pb-2">
                            <h4 className="font-semibold text-sm">Booking Details</h4>
                        </div>
                        <div className="flex items-start space-x-2">
                            <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                                <div className="font-medium text-sm">{status.reservation.playerName}</div>
                                <div className="text-xs text-muted-foreground">
                                    {status.reservation.players} player{status.reservation.players !== 1 ? 's' : ''}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm truncate">{status.reservation.playerEmail}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{formatPhone(status.reservation.playerPhone)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                             <CalendarIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                             <div className="text-sm">
                                 {/* Ensure createdAt is valid before parsing */}
                                 {status.reservation.createdAt && typeof status.reservation.createdAt === 'string' ? (
                                     <>
                                         <span>{format(parseISO(status.reservation.createdAt), "MMM d, yyyy")}</span>
                                         <Badge className="ml-2 text-xs" variant={
                                             status.reservation.status === "confirmed" ? "success" :
                                             status.reservation.status === "completed" ? "default" : "destructive"
                                         }>
                                             {status.reservation.status}
                                         </Badge>
                                     </>
                                 ) : (
                                     <span>Invalid Date</span> // Handle case where date is not a string
                                 )}
                             </div>
                         </div>
                        <div className="flex justify-end space-x-2 pt-2">
                            {/* TODO: Implement Edit/Cancel functionality */}
                            <Button size="sm" variant="outline">Edit</Button>
                            <Button size="sm" variant="destructive">Cancel</Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        );
    } else { // Available or Blocked/Unavailable slot
        const isClickable = status.available;
        return (
            <div
                className={`${cellClass} ${bgClass} ${isClickable ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed'}`}
                onClick={() => isClickable && onScheduleCourt(court)}
                title={status.reason || (isClickable ? 'Available' : 'Unavailable')}
            >
                 <div className="flex items-center overflow-hidden whitespace-nowrap">
                     <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                     <span className="truncate">{`${hour}:00`}</span>
                 </div>
            </div>
        );
    }
} 