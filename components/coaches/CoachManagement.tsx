"use client";

import React, { useState, useEffect } from "react";
import { Coach, Clinic, Court } from "@/lib/types";
import { coachDb } from "@/lib/db";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Plus, Search, Star, Edit, Trash2, Calendar, Users, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfWeek, addDays } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import ScheduleClinicForm from "./ScheduleClinicForm";

// Define gradient classes for each day of the week
const DAY_GRADIENTS = {
  0: "from-blue-500/80 to-blue-600/80", // Sunday
  1: "from-purple-500/80 to-purple-600/80", // Monday
  2: "from-pink-500/80 to-pink-600/80", // Tuesday
  3: "from-orange-500/80 to-orange-600/80", // Wednesday
  4: "from-green-500/80 to-green-600/80", // Thursday
  5: "from-red-500/80 to-red-600/80", // Friday
  6: "from-indigo-500/80 to-indigo-600/80", // Saturday
} as const;

interface CoachManagementProps {
  courts: Court[];
  onCreateClinic?: (clinic: Clinic) => void;
}

const CoachManagement: React.FC<CoachManagementProps> = ({ 
  courts, 
  onCreateClinic 
}) => {
  // State for coaches
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // State for coach modal
  const [isCoachModalOpen, setIsCoachModalOpen] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [editingCoach, setEditingCoach] = useState<Partial<Coach>>({
    name: "",
    email: "",
    phoneNumber: "",
    bio: "",
    specialties: [],
    status: "active"
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Coach, string>>>({});
  
  // State for clinic modal
  const [isClinicModalOpen, setIsClinicModalOpen] = useState(false);
  const [editingClinic, setEditingClinic] = useState<Partial<Clinic>>({
    title: "",
    description: "",
    maxParticipants: 8,
    price: 25,
    skillLevel: "all",
    duration: 60, // Duration in minutes
  });
  const [clinicErrors, setClinicErrors] = useState<Partial<Record<keyof Clinic, string>>>({});
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date()));
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  
  // State for delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  // State for displaying clinics
  const [coachClinics, setCoachClinics] = useState<Record<string, Clinic[]>>({});
  const [isLoadingClinics, setIsLoadingClinics] = useState(false);
  
  // Add new state for scheduling modal
  const [isSchedulingModalOpen, setIsSchedulingModalOpen] = useState(false);
  const [selectedClinicForScheduling, setSelectedClinicForScheduling] = useState<Clinic | null>(null);
  
  // Get unique time slots without dates for selection
  const timeOptions = Array.from(
    new Set(
      timeSlots.map(slot => `${slot.startTime}-${slot.endTime}`)
    )
  );

  const handlePreviousWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, -7));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, 7));
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(currentWeekStart, i);
    return {
      date,
      dayName: format(date, "EEE"),
      dayNumber: format(date, "d"),
      isToday: format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd"),
      isSelected: editingClinic.date && format(date, "yyyy-MM-dd") === format(editingClinic.date, "yyyy-MM-dd"),
      dayOfWeek: date.getDay()
    };
  });

  const toggleTimeSlot = (timeSlot: string) => {
    setSelectedTimeSlots(prev => 
      prev.includes(timeSlot) 
        ? prev.filter(t => t !== timeSlot) 
        : [...prev, timeSlot]
    );
  };
  
  // Load coaches on component mount
  useEffect(() => {
    loadCoaches();
  }, []);
  
  // Load coaches function
  const loadCoaches = () => {
    setIsLoading(true);
    try {
      const allCoaches = coachDb.getAllCoaches();
      setCoaches(allCoaches);
    } catch (error) {
      console.error("Error loading coaches:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load clinics for a coach
  const loadClinicsForCoach = (coachId: string) => {
    if (coachClinics[coachId]) return; // Already loaded
    
    setIsLoadingClinics(true);
    try {
      const clinics = coachDb.getClinicsByCoachId(coachId);
      setCoachClinics(prev => ({
        ...prev,
        [coachId]: clinics
      }));
    } catch (error) {
      console.error(`Error loading clinics for coach ${coachId}:`, error);
    } finally {
      setIsLoadingClinics(false);
    }
  };
  
  // Filter coaches based on search query
  const filteredCoaches = coaches.filter(coach => 
    coach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coach.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (coach.phoneNumber && coach.phoneNumber.includes(searchQuery))
  );
  
  // Handle opening coach modal for creating/editing
  const openCoachModal = (coach: Coach | null = null) => {
    setSelectedCoach(coach);
    setErrors({});
    
    if (coach) {
      setEditingCoach({
        name: coach.name,
        email: coach.email,
        phoneNumber: coach.phoneNumber || "",
        bio: coach.bio || "",
        specialties: coach.specialties || [],
        status: coach.status
      });
    } else {
      setEditingCoach({
        name: "",
        email: "",
        phoneNumber: "",
        bio: "",
        specialties: [],
        status: "active"
      });
    }
    
    setIsCoachModalOpen(true);
  };
  
  // Handle opening clinic modal
  const openClinicModal = (coach: Coach) => {
    setSelectedCoach(coach);
    setClinicErrors({});
    
    setEditingClinic({
      title: "",
      description: "",
      maxParticipants: 8,
      price: 25,
      skillLevel: "all",
      duration: 60, // Duration in minutes
    });
    
    setIsClinicModalOpen(true);
  };
  
  // Handle form field changes for coach
  const handleCoachFieldChange = (field: keyof Coach, value: any) => {
    setEditingCoach(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };
  
  // Handle form field changes for clinic
  const handleClinicFieldChange = (field: keyof Clinic, value: any) => {
    setEditingClinic(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (clinicErrors[field]) {
      setClinicErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };
  
  // Validate coach form
  const validateCoachForm = (): boolean => {
    const newErrors: Partial<Record<keyof Coach, string>> = {};
    
    if (!editingCoach.name) {
      newErrors.name = "Name is required";
    }
    
    if (!editingCoach.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(editingCoach.email)) {
      newErrors.email = "Email format is invalid";
    }
    
    if (editingCoach.phoneNumber && !/^\+?[0-9()-\s]+$/.test(editingCoach.phoneNumber)) {
      newErrors.phoneNumber = "Phone number format is invalid";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Validate clinic form
  const validateClinicForm = (): boolean => {
    const newErrors: Partial<Record<keyof Clinic, string>> = {};
    
    if (!editingClinic.title) {
      newErrors.title = "Title is required";
    }
    
    if (!editingClinic.maxParticipants || editingClinic.maxParticipants <= 0) {
      newErrors.maxParticipants = "Max participants must be a positive number";
    }
    
    if (editingClinic.price === undefined || editingClinic.price < 0) {
      newErrors.price = "Price must be a non-negative number";
    }
    
    if (!editingClinic.duration || editingClinic.duration < 30) {
      newErrors.duration = "Duration must be at least 30 minutes";
    }
    
    setClinicErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle coach save
  const handleSaveCoach = () => {
    if (!validateCoachForm()) return;
    
    try {
      if (selectedCoach) {
        // Update existing coach
        const updatedCoach = coachDb.updateCoach(selectedCoach.id, editingCoach);
        if (updatedCoach) {
          setCoaches(prev => prev.map(c => c.id === updatedCoach.id ? updatedCoach : c));
          toast({
            title: "Coach updated",
            description: `${updatedCoach.name}'s profile has been updated successfully.`,
          });
        } else {
          toast({
            title: "Update failed",
            description: "Could not update coach. Please try again.",
            variant: "destructive"
          });
        }
      } else {
        // Create new coach
        const newCoach = coachDb.createCoach(editingCoach as Omit<Coach, 'id' | 'createdAt' | 'updatedAt'>);
        if (newCoach) {
          setCoaches(prev => [...prev, newCoach]);
          toast({
            title: "Coach added",
            description: `${newCoach.name} has been added as a coach.`,
          });
        } else {
          toast({
            title: "Creation failed",
            description: "Could not create new coach. Please try again.",
            variant: "destructive"
          });
        }
      }
      
      setIsCoachModalOpen(false);
    } catch (error) {
      console.error("Error saving coach:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Handle clinic save
  const handleSaveClinic = () => {
    if (!validateClinicForm() || !selectedCoach) return;
    
    try {
      const clinicData = {
        ...editingClinic,
        coachId: selectedCoach.id,
        status: "template", // Mark as template instead of scheduled
        date: new Date(), // Required field but not used for templates
        startTime: "00:00", // Required field but not used for templates
        endTime: "00:00", // Required field but not used for templates
        courtId: "", // Will be set during scheduling
        enrolled: 0,
        participants: [],
      } as Omit<Clinic, 'id' | 'createdAt' | 'updatedAt'>;
      
      const newClinic = coachDb.createClinic(clinicData);
      
      if (newClinic) {
        // Update local state
        setCoachClinics(prev => ({
          ...prev,
          [selectedCoach.id]: [...(prev[selectedCoach.id] || []), newClinic]
        }));
        
        // Notify parent component if needed
        if (onCreateClinic) {
          onCreateClinic(newClinic);
        }
        
        toast({
          title: "Clinic template created",
          description: `${newClinic.title} has been created successfully. You can now schedule instances of this clinic.`,
        });
        
        setIsClinicModalOpen(false);
        // Open scheduling modal for the newly created clinic
        setSelectedClinicForScheduling(newClinic);
        setIsSchedulingModalOpen(true);
      } else {
        toast({
          title: "Creation failed",
          description: "Could not create clinic template. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error creating clinic template:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Handle coach delete
  const handleDeleteCoach = (coachId: string) => {
    try {
      const success = coachDb.deleteCoach(coachId);
      
      if (success) {
        setCoaches(prev => prev.filter(c => c.id !== coachId));
        // Also remove any clinics for this coach
        const updatedClinicsByCoach = { ...coachClinics };
        delete updatedClinicsByCoach[coachId];
        setCoachClinics(updatedClinicsByCoach);
        
        toast({
          title: "Coach removed",
          description: "The coach has been removed successfully.",
        });
      } else {
        toast({
          title: "Deletion failed",
          description: "Could not delete coach. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error deleting coach:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setShowDeleteConfirm(null);
    }
  };
  
  // Handle clinic delete
  const handleDeleteClinic = (clinicId: string, coachId: string) => {
    try {
      const success = coachDb.deleteClinic(clinicId);
      
      if (success) {
        setCoachClinics(prev => ({
          ...prev,
          [coachId]: prev[coachId].filter(c => c.id !== clinicId)
        }));
        
        toast({
          title: "Clinic removed",
          description: "The clinic has been removed successfully.",
        });
      } else {
        toast({
          title: "Deletion failed",
          description: "Could not delete clinic. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error deleting clinic:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Format specialties as comma-separated string
  const formatSpecialties = (specialties: string[] | undefined): string => {
    if (!specialties || specialties.length === 0) return "None";
    return specialties.join(", ");
  };
  
  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active": return "success";
      case "inactive": return "destructive";
      case "pending": return "warning";
      default: return "secondary";
    }
  };
  
  // Add new handler for scheduling
  const handleScheduleClinic = async (date: Date, timeSlots: string[], courtId: string) => {
    if (!selectedClinicForScheduling) return;

    try {
      // Create a new clinic instance for each time slot
      const clinicInstances = timeSlots.map(timeSlot => {
        const [startTime, endTime] = timeSlot.split('-');
        return {
          ...selectedClinicForScheduling,
          id: `clinic-${Date.now()}-${timeSlot}`,
          date: date,
          startTime,
          endTime,
          courtId,
          status: 'scheduled',
          createdAt: new Date(),
          updatedAt: new Date()
        } as Clinic;
      });

      // Save each clinic instance
      const success = clinicInstances.every(clinic => coachDb.createClinic(clinic));
      
      if (success) {
        toast({
          title: "Clinic Scheduled",
          description: `Successfully scheduled ${clinicInstances.length} instance(s) of ${selectedClinicForScheduling.title}`,
        });
        loadClinicsForCoach(selectedClinicForScheduling.coachId);
      } else {
        toast({
          title: "Scheduling Failed",
          description: "Failed to schedule some clinic instances. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error scheduling clinic:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while scheduling the clinic.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with search and add */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search coaches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <Button onClick={() => openCoachModal()} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Coach
        </Button>
      </div>
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
        </div>
      )}
      
      {/* Empty state */}
      {!isLoading && coaches.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <div className="mx-auto rounded-full bg-muted w-12 h-12 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Coaches Found</h3>
            <p className="text-muted-foreground mb-4">
              Get started by adding your first coach to the system.
            </p>
            <Button onClick={() => openCoachModal()}>Add Your First Coach</Button>
          </CardContent>
        </Card>
      )}
      
      {/* No search results */}
      {!isLoading && coaches.length > 0 && filteredCoaches.length === 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No results found</AlertTitle>
          <AlertDescription>
            No coaches match your search query "{searchQuery}". Try a different search term.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Coach grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCoaches.map((coach) => (
          <Card key={coach.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{coach.name}</CardTitle>
                  <CardDescription className="mt-1">{coach.email}</CardDescription>
                </div>
                <Badge variant={getStatusBadgeVariant(coach.status)}>
                  {coach.status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="pb-2">
              <div className="space-y-3">
                {coach.phoneNumber && (
                  <div className="text-sm">
                    <span className="font-medium">Phone:</span> {coach.phoneNumber}
                  </div>
                )}
                
                <div className="text-sm">
                  <span className="font-medium">Rating:</span>{' '}
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                    {coach.rating.toFixed(1)}/5
                  </span>
                </div>
                
                <div className="text-sm">
                  <span className="font-medium">Specialties:</span>{' '}
                  <span className="text-muted-foreground">
                    {formatSpecialties(coach.specialties)}
                  </span>
                </div>
                
                {coach.bio && (
                  <div className="text-sm mt-2">
                    <span className="font-medium block mb-1">Bio:</span>
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {coach.bio}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Clinics section */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">Clinics</h4>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2"
                    onClick={() => loadClinicsForCoach(coach.id)}
                  >
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    {coachClinics[coach.id] ? 'Refresh' : 'Load'} Clinics
                  </Button>
                </div>
                
                {isLoadingClinics && (
                  <div className="flex justify-center py-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-primary"></div>
                  </div>
                )}
                
                {!isLoadingClinics && coachClinics[coach.id]?.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {coachClinics[coach.id].map(clinic => (
                      <div key={clinic.id} className="border rounded-md p-2 text-xs flex justify-between">
                        <div>
                          <div className="font-medium">{clinic.title}</div>
                          <div className="text-muted-foreground">
                            {format(new Date(clinic.date), "MMM d, yyyy")} • {clinic.startTime}-{clinic.endTime}
                          </div>
                          <div className="mt-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Users className="h-3 w-3" />
                              <span>{clinic.enrolled || 0} / {clinic.maxParticipants} participants</span>
                            </div>
                            {clinic.participants && clinic.participants.length > 0 && (
                              <div className="mt-1 pl-5">
                                {clinic.participants.map((participant, index) => (
                                  <div key={participant.id || index} className="text-xs text-muted-foreground">
                                    • {participant.name} ({participant.email})
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0"
                            onClick={() => {
                              setSelectedClinicForScheduling(clinic);
                              setIsSchedulingModalOpen(true);
                            }}
                          >
                            <Calendar className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0"
                            onClick={() => handleDeleteClinic(clinic.id, coach.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  coachClinics[coach.id] && (
                    <div className="text-xs text-muted-foreground text-center py-2">
                      No clinics scheduled
                    </div>
                  )
                )}
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between pt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => openClinicModal(coach)}
              >
                <Calendar className="h-4 w-4 mr-1" />
                Add Clinic
              </Button>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openCoachModal(coach)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => setShowDeleteConfirm(coach.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {/* Coach Modal */}
      <Dialog open={isCoachModalOpen} onOpenChange={setIsCoachModalOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-2xl font-bold">
              {selectedCoach ? 'Edit Coach' : 'Add New Coach'}
            </DialogTitle>
            <DialogDescription>
              {selectedCoach 
                ? 'Update coach information in the system.'
                : 'Complete the form below to add a new coach.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="block text-sm font-medium mb-1">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={editingCoach.name || ''}
                  onChange={(e) => handleCoachFieldChange('name', e.target.value)}
                  placeholder="Enter coach name"
                  className={`w-full px-3 py-2 border-2 border-primary/30 focus-visible:ring-primary rounded-md ${
                    errors.name ? "border-red-500" : ""
                  }`}
                />
                {errors.name && (
                  <p className="text-xs text-destructive mt-1">{errors.name}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={editingCoach.email || ''}
                  onChange={(e) => handleCoachFieldChange('email', e.target.value)}
                  placeholder="Enter coach email"
                  className={`w-full px-3 py-2 border-2 border-primary/30 focus-visible:ring-primary rounded-md ${
                    errors.email ? "border-red-500" : ""
                  }`}
                />
                {errors.email && (
                  <p className="text-xs text-destructive mt-1">{errors.email}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="block text-sm font-medium mb-1">Phone Number</Label>
                <Input
                  id="phone"
                  value={editingCoach.phoneNumber || ''}
                  onChange={(e) => handleCoachFieldChange('phoneNumber', e.target.value)}
                  placeholder="Enter phone number"
                  className={`w-full px-3 py-2 border-2 border-primary/30 focus-visible:ring-primary rounded-md ${
                    errors.phoneNumber ? "border-red-500" : ""
                  }`}
                />
                {errors.phoneNumber && (
                  <p className="text-xs text-destructive mt-1">{errors.phoneNumber}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="specialties" className="block text-sm font-medium mb-1">Specialties</Label>
                <Input
                  id="specialties"
                  value={(editingCoach.specialties || []).join(', ')}
                  onChange={(e) => handleCoachFieldChange(
                    'specialties', 
                    e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  )}
                  placeholder="Enter specialties (comma-separated)"
                  className="w-full px-3 py-2 border-2 border-primary/30 focus-visible:ring-primary rounded-md"
                />
                <p className="text-xs text-muted-foreground">
                  Separate specialties with commas (e.g., "Beginner Lessons, Serving Technique")
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio" className="block text-sm font-medium mb-1">Bio</Label>
                <Textarea
                  id="bio"
                  value={editingCoach.bio || ''}
                  onChange={(e) => handleCoachFieldChange('bio', e.target.value)}
                  placeholder="Enter coach bio"
                  className="resize-none h-24 border-2 border-primary/30 focus-visible:ring-primary"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status" className="block text-sm font-medium mb-1">Status</Label>
                <Select
                  value={editingCoach.status}
                  onValueChange={(value) => handleCoachFieldChange('status', value)}
                >
                  <SelectTrigger className="border-2 border-primary/30 focus-visible:ring-primary">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-6 flex justify-end space-x-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCoachModalOpen(false)}
              className="border-2 border-primary/30 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleSaveCoach}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {selectedCoach ? 'Update Coach' : 'Add Coach'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Clinic Modal */}
      <Dialog open={isClinicModalOpen} onOpenChange={setIsClinicModalOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-2xl font-bold">Create Clinic Template</DialogTitle>
            <DialogDescription>
              Create a reusable clinic template that can be scheduled multiple times.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Clinic Info Card */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-green-500/10 rounded-md border-2 border-primary/20">
              <h3 className="font-medium mb-2">Clinic Details:</h3>
              <div className="flex items-center justify-between mb-1">
                <p className="text-muted-foreground">
                  <span className="font-semibold">Coach: {selectedCoach?.name}</span>
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="block text-sm font-medium mb-1">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={editingClinic.title || ''}
                  onChange={(e) => handleClinicFieldChange('title', e.target.value)}
                  placeholder="Enter clinic title"
                  className={`w-full px-3 py-2 border-2 border-primary/30 focus-visible:ring-primary rounded-md ${
                    clinicErrors.title ? "border-red-500" : ""
                  }`}
                />
                {clinicErrors.title && (
                  <p className="text-xs text-destructive mt-1">{clinicErrors.title}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="block text-sm font-medium mb-1">Description</Label>
                <Textarea
                  id="description"
                  value={editingClinic.description || ''}
                  onChange={(e) => handleClinicFieldChange('description', e.target.value)}
                  placeholder="Enter clinic description"
                  className="resize-none h-20 border-2 border-primary/30 focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skillLevel" className="block text-sm font-medium mb-1">Skill Level</Label>
                <Select
                  value={editingClinic.skillLevel || 'all'}
                  onValueChange={(value) => handleClinicFieldChange('skillLevel', value)}
                >
                  <SelectTrigger className="border-2 border-primary/30 focus-visible:ring-primary">
                    <SelectValue placeholder="Select skill level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="all">All Levels</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration" className="block text-sm font-medium mb-1">
                  Duration (min) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="duration"
                  type="number"
                  min="30"
                  step="30"
                  value={editingClinic.duration || ''}
                  onChange={(e) => handleClinicFieldChange(
                    'duration', 
                    parseInt(e.target.value) || 60
                  )}
                  className="border-2 border-primary/30 focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxParticipants" className="block text-sm font-medium mb-1">
                  Max Participants <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  min="1"
                  value={editingClinic.maxParticipants || ''}
                  onChange={(e) => handleClinicFieldChange(
                    'maxParticipants', 
                    parseInt(e.target.value) || 0
                  )}
                  className={`border-2 border-primary/30 focus-visible:ring-primary ${
                    clinicErrors.maxParticipants ? "border-red-500" : ""
                  }`}
                />
                {clinicErrors.maxParticipants && (
                  <p className="text-xs text-destructive mt-1">{clinicErrors.maxParticipants}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="block text-sm font-medium mb-1">
                  Price ($) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editingClinic.price || ''}
                  onChange={(e) => handleClinicFieldChange(
                    'price', 
                    parseFloat(e.target.value) || 0
                  )}
                  className={`border-2 border-primary/30 focus-visible:ring-primary ${
                    clinicErrors.price ? "border-red-500" : ""
                  }`}
                />
                {clinicErrors.price && (
                  <p className="text-xs text-destructive mt-1">{clinicErrors.price}</p>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-6 flex justify-end space-x-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsClinicModalOpen(false)}
              className="border-2 border-primary/30 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleSaveClinic}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Create Clinic Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete confirmation dialog */}
      <Dialog open={!!showDeleteConfirm} onOpenChange={(open) => !open && setShowDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl font-bold">Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this coach? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Alert variant="destructive" className="border-2 border-destructive/30">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                Deleting this coach will also remove all associated clinics.
              </AlertDescription>
            </Alert>
          </div>
          
          <DialogFooter className="mt-4 flex justify-end space-x-4 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(null)}
              className="border-2 border-primary/30 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => showDeleteConfirm && handleDeleteCoach(showDeleteConfirm)}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Schedule Clinic Modal */}
      {selectedClinicForScheduling && (
        <ScheduleClinicForm
          isOpen={isSchedulingModalOpen}
          onClose={() => {
            setIsSchedulingModalOpen(false);
            setSelectedClinicForScheduling(null);
          }}
          clinic={selectedClinicForScheduling}
          courts={courts}
          onSchedule={handleScheduleClinic}
        />
      )}
    </div>
  );
};

export default CoachManagement; 