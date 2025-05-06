'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    maxParticipants: 8
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
    maxParticipants: 6
  }
];

export default function ClinicsPage() {
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);

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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 