'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";

interface Coach {
  id: string;
  name: string;
  expertise: string[];
  bio: string;
}

interface Clinic {
  id: string;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  price: number;
  coaches: Coach[];
  schedule: string;
  maxParticipants: number;
  days: string[];
  times: string[];
}

// Mock data - replace with actual data from your backend
const mockClinics: Clinic[] = [
  {
    id: '1',
    title: 'Beginner Pickleball Fundamentals',
    description: 'Learn the basics of pickleball including proper grip, stance, and fundamental shots.',
    level: 'Beginner',
    duration: '2 hours',
    price: 50,
    coaches: [
      {
        id: '1',
        name: 'John Smith',
        expertise: ['Beginner Training', 'Technique'],
        bio: 'Certified pickleball instructor with 5 years of experience.'
      }
    ],
    schedule: 'Every Monday 6-8 PM',
    maxParticipants: 8,
    days: ['Monday'],
    times: ['6:00 PM - 8:00 PM']
  },
  {
    id: '2',
    title: 'Advanced Strategy Workshop',
    description: 'Master advanced strategies and techniques for competitive play.',
    level: 'Advanced',
    duration: '3 hours',
    price: 75,
    coaches: [
      {
        id: '2',
        name: 'Sarah Johnson',
        expertise: ['Advanced Strategy', 'Competition'],
        bio: 'Former professional player with 10 years of coaching experience.'
      }
    ],
    schedule: 'Every Wednesday 7-10 PM',
    maxParticipants: 6,
    days: ['Wednesday'],
    times: ['7:00 PM - 10:00 PM']
  }
];

// Define gradient classes for each day of the week
const DAY_GRADIENTS = {
  'Sunday': "from-blue-600 to-blue-500",
  'Monday': "from-blue-500 to-blue-400",
  'Tuesday': "from-blue-400 to-blue-300",
  'Wednesday': "from-blue-300 to-green-300",
  'Thursday': "from-green-300 to-green-400",
  'Friday': "from-green-400 to-green-500",
  'Saturday': "from-green-500 to-green-600",
} as const;

export default function ClinicsPage() {
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);

  const handleTimeClick = (clinic: Clinic, time: string) => {
    setSelectedClinic(clinic);
    setSelectedTime(time);
    setIsBookingDialogOpen(true);
  };

  const handleBookClinic = async () => {
    try {
      // Here you would implement the actual booking logic
      // For now, we'll just show a success message
      toast({
        title: "Success!",
        description: `You have successfully booked ${selectedClinic?.title} for ${selectedTime}`,
      });
      setIsBookingDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to book the clinic. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Pickleball Clinics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockClinics.map((clinic) => (
          <Card key={clinic.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{clinic.title}</CardTitle>
                <Badge variant={clinic.level === 'Beginner' ? 'default' : clinic.level === 'Intermediate' ? 'secondary' : 'destructive'}>
                  {clinic.level}
                </Badge>
              </div>
              <CardDescription>{clinic.schedule}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{clinic.description}</p>
              <div className="space-y-2">
                <p><strong>Duration:</strong> {clinic.duration}</p>
                <p><strong>Price:</strong> ${clinic.price}</p>
                <p><strong>Max Participants:</strong> {clinic.maxParticipants}</p>
              </div>
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Coaches:</h3>
                <div className="space-y-2">
                  {clinic.coaches.map((coach) => (
                    <div key={coach.id} className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-medium">{coach.name}</p>
                      <p className="text-sm text-gray-600">{coach.bio}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {coach.expertise.map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Schedule:</h3>
                <div className="flex flex-wrap gap-2">
                  {clinic.days.map((day) => (
                    <div 
                      key={day} 
                      className={`p-2 text-center bg-gradient-to-br ${DAY_GRADIENTS[day as keyof typeof DAY_GRADIENTS]} text-white rounded-md`}
                    >
                      <div className="text-xs font-medium text-white">{day}</div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {clinic.times.map((time) => (
                    <Button
                      key={time}
                      variant="outline"
                      className="p-2 text-center bg-gradient-to-r from-yellow-500 to-yellow-400 text-white rounded-md hover:from-yellow-600 hover:to-yellow-500 transition-all border-0"
                      onClick={() => handleTimeClick(clinic, time)}
                    >
                      <div className="text-xs font-medium text-white">{time}</div>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book Clinic</DialogTitle>
            <DialogDescription>
              You are about to book the following clinic:
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <h3 className="font-semibold text-lg">{selectedClinic?.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{selectedClinic?.description}</p>
            <div className="mt-4 space-y-2">
              <p><strong>Time:</strong> {selectedTime}</p>
              <p><strong>Duration:</strong> {selectedClinic?.duration}</p>
              <p><strong>Price:</strong> ${selectedClinic?.price}</p>
              <p><strong>Level:</strong> {selectedClinic?.level}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBookClinic}>
              Confirm Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 