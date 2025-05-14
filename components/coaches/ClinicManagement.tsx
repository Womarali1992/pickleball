'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { Plus, Edit2, Trash2, Users, Clock, DollarSign } from "lucide-react";
import { coachDb } from '@/lib/db';
import { Coach, Clinic } from '@/lib/types';
import { format } from 'date-fns';

interface ClinicManagementProps {
  coaches: Coach[];
  onUpdate: () => void;
}

export default function ClinicManagement({ coaches, onUpdate }: ClinicManagementProps) {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  
  const [newClinic, setNewClinic] = useState<Partial<Clinic>>({
    title: '',
    description: '',
    coachId: '',
    price: 0,
    maxParticipants: 8,
    skillLevel: 'beginner',
    duration: '1',
    schedule: '',
    date: new Date(),
    startTime: '09:00',
    endTime: '10:00',
    courtId: '',
    enrolled: 0,
    participants: [],
    status: 'scheduled'
  });

  useEffect(() => {
    if (coaches && coaches.length > 0) {
      loadClinics();
    }
  }, [coaches]);

  const loadClinics = () => {
    if (!coaches || coaches.length === 0) return;
    
    const allClinics = coaches.flatMap(coach => 
      coachDb.getClinicsByCoachId(coach.id)
    );
    setClinics(allClinics);
  };

  const calculateEndTime = (startTime: string, durationHours: string) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const durationInHours = parseInt(durationHours);
    
    let endHours = hours + durationInHours;
    if (endHours > 23) endHours = 23;
    
    return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const handleAddClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newClinic.coachId) {
      alert('Please select a coach');
      return;
    }

    try {
      const clinicData: Partial<Clinic> = {
        ...newClinic,
        id: `clinic-${Date.now()}`,
        enrolled: 0,
        participants: [],
        date: new Date(),
        endTime: calculateEndTime(newClinic.startTime || '09:00', newClinic.duration || '1'),
        courtId: 'court1',
        status: 'scheduled',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const success = coachDb.createClinic(clinicData as Clinic);
      
      if (success) {
        setIsAddDialogOpen(false);
        setNewClinic({
          title: '',
          description: '',
          coachId: '',
          price: 0,
          maxParticipants: 8,
          skillLevel: 'beginner',
          duration: '1',
          schedule: '',
          date: new Date(),
          startTime: '09:00',
          endTime: '10:00',
          courtId: '',
          enrolled: 0,
          participants: [],
          status: 'scheduled'
        });
        loadClinics();
        onUpdate();
      } else {
        alert('Failed to add clinic');
      }
    } catch (error) {
      console.error('Error adding clinic:', error);
      alert('Failed to add clinic');
    }
  };

  const handleEditClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClinic) return;

    try {
      const success = coachDb.updateClinic(selectedClinic.id, selectedClinic);
      
      if (success) {
        setIsEditDialogOpen(false);
        setSelectedClinic(null);
        loadClinics();
        onUpdate();
      } else {
        alert('Failed to update clinic');
      }
    } catch (error) {
      console.error('Error updating clinic:', error);
      alert('Failed to update clinic');
    }
  };

  const handleDeleteClinic = async (clinicId: string) => {
    if (!confirm('Are you sure you want to delete this clinic?')) return;

    try {
      const success = coachDb.deleteClinic(clinicId);
      
      if (success) {
        loadClinics();
        onUpdate();
      } else {
        alert('Failed to delete clinic');
      }
    } catch (error) {
      console.error('Error deleting clinic:', error);
      alert('Failed to delete clinic');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Clinics Management</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Clinic
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Coach</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clinics.map((clinic) => (
                <TableRow key={clinic.id}>
                  <TableCell className="font-medium">{clinic.title}</TableCell>
                  <TableCell>
                    {coaches.find(c => c.id === clinic.coachId)?.name || 'Unknown Coach'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      clinic.skillLevel === 'beginner' ? 'default' :
                      clinic.skillLevel === 'intermediate' ? 'secondary' : 'destructive'
                    }>
                      {clinic.skillLevel}
                    </Badge>
                  </TableCell>
                  <TableCell>{clinic.schedule}</TableCell>
                  <TableCell>
                    {clinic.enrolled || 0}/{clinic.maxParticipants}
                  </TableCell>
                  <TableCell>${clinic.price}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedClinic(clinic);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClinic(clinic.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Clinic Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Clinic</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddClinic} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newClinic.title}
                onChange={(e) => setNewClinic(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newClinic.description}
                onChange={(e) => setNewClinic(prev => ({ ...prev, description: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coach">Coach</Label>
              <Select
                value={newClinic.coachId}
                onValueChange={(value) => setNewClinic(prev => ({ ...prev, coachId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a coach" />
                </SelectTrigger>
                <SelectContent>
                  {coaches && coaches.length > 0 ? (
                    coaches.map((coach) => (
                      <SelectItem key={coach.id} value={coach.id}>
                        {coach.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>No coaches available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="skillLevel">Skill Level</Label>
              <Select
                value={newClinic.skillLevel}
                onValueChange={(value) => setNewClinic(prev => ({ ...prev, skillLevel: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select skill level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                value={newClinic.price}
                onChange={(e) => setNewClinic(prev => ({ ...prev, price: Number(e.target.value) }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxParticipants">Max Participants</Label>
              <Input
                id="maxParticipants"
                type="number"
                value={newClinic.maxParticipants}
                onChange={(e) => setNewClinic(prev => ({ ...prev, maxParticipants: Number(e.target.value) }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (Hours)</Label>
              <Select
                value={newClinic.duration}
                onValueChange={(value) => {
                  setNewClinic(prev => ({
                    ...prev,
                    duration: value,
                    endTime: calculateEndTime(prev.startTime || '09:00', value)
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Hour</SelectItem>
                  <SelectItem value="2">2 Hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={newClinic.startTime}
                onChange={(e) => {
                  const newStartTime = e.target.value;
                  setNewClinic(prev => ({
                    ...prev,
                    startTime: newStartTime,
                    endTime: calculateEndTime(newStartTime, prev.duration || '1')
                  }));
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schedule">Schedule</Label>
              <Input
                id="schedule"
                value={newClinic.schedule}
                onChange={(e) => setNewClinic(prev => ({ ...prev, schedule: e.target.value }))}
                placeholder="e.g., Every Monday 6-8 PM"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={newClinic.date ? format(new Date(newClinic.date), 'yyyy-MM-dd') : ''}
                onChange={(e) => setNewClinic(prev => ({ ...prev, date: new Date(e.target.value) }))}
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit">Add Clinic</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Clinic Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Clinic</DialogTitle>
          </DialogHeader>
          {selectedClinic && (
            <form onSubmit={handleEditClinic} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={selectedClinic.title}
                  onChange={(e) => setSelectedClinic(prev => prev ? { ...prev, title: e.target.value } : null)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={selectedClinic.description}
                  onChange={(e) => setSelectedClinic(prev => prev ? { ...prev, description: e.target.value } : null)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-coach">Coach</Label>
                <Select
                  value={selectedClinic.coachId}
                  onValueChange={(value) => setSelectedClinic(prev => prev ? { ...prev, coachId: value } : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a coach" />
                  </SelectTrigger>
                  <SelectContent>
                    {coaches.map((coach) => (
                      <SelectItem key={coach.id} value={coach.id}>
                        {coach.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-skillLevel">Skill Level</Label>
                <Select
                  value={selectedClinic.skillLevel}
                  onValueChange={(value) => setSelectedClinic(prev => prev ? { ...prev, skillLevel: value } : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select skill level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price ($)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={selectedClinic.price}
                  onChange={(e) => setSelectedClinic(prev => prev ? { ...prev, price: Number(e.target.value) } : null)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-maxParticipants">Max Participants</Label>
                <Input
                  id="edit-maxParticipants"
                  type="number"
                  value={selectedClinic.maxParticipants}
                  onChange={(e) => setSelectedClinic(prev => prev ? { ...prev, maxParticipants: Number(e.target.value) } : null)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-duration">Duration</Label>
                <Input
                  id="edit-duration"
                  value={selectedClinic.duration}
                  onChange={(e) => setSelectedClinic(prev => prev ? { ...prev, duration: e.target.value } : null)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-schedule">Schedule</Label>
                <Input
                  id="edit-schedule"
                  value={selectedClinic.schedule}
                  onChange={(e) => setSelectedClinic(prev => prev ? { ...prev, schedule: e.target.value } : null)}
                  placeholder="e.g., Every Monday 6-8 PM"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={selectedClinic.date ? format(new Date(selectedClinic.date), 'yyyy-MM-dd') : ''}
                  onChange={(e) => setSelectedClinic(prev => prev ? { ...prev, date: new Date(e.target.value) } : null)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-startTime">Start Time</Label>
                <Input
                  id="edit-startTime"
                  type="time"
                  value={selectedClinic.startTime}
                  onChange={(e) => setSelectedClinic(prev => prev ? { ...prev, startTime: e.target.value } : null)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-endTime">End Time</Label>
                <Input
                  id="edit-endTime"
                  type="time"
                  value={selectedClinic.endTime}
                  onChange={(e) => setSelectedClinic(prev => prev ? { ...prev, endTime: e.target.value } : null)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-court">Court</Label>
                <Select
                  value={selectedClinic.courtId}
                  onValueChange={(value) => setSelectedClinic(prev => prev ? { ...prev, courtId: value } : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a court" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="court1">Court 1</SelectItem>
                    <SelectItem value="court2">Court 2</SelectItem>
                    <SelectItem value="court3">Court 3</SelectItem>
                    <SelectItem value="court4">Court 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 