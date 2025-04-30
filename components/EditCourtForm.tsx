"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EditCourtFormProps {
  court: {
    id: string;
    name: string;
    location: string;
    indoor: boolean;
    orientation?: 'horizontal' | 'vertical';
    placement?: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    verticalAlignment?: 'left' | 'right';
  };
  isOpen: boolean;
  onClose: () => void;
  onSave: (courtData: any) => void;
}

const EditCourtForm = ({ court, isOpen, onClose, onSave }: EditCourtFormProps) => {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    location: "",
    indoor: false,
    orientation: "horizontal" as 'horizontal' | 'vertical',
    placement: "center" as 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right',
    verticalAlignment: "left" as 'left' | 'right',
  });
  
  useEffect(() => {
    if (court) {
      setFormData({
        id: court.id,
        name: court.name,
        location: court.location,
        indoor: court.indoor,
        orientation: court.orientation || "horizontal",
        placement: court.placement || "center",
        verticalAlignment: court.verticalAlignment || "left",
      });
    }
  }, [court]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      indoor: checked,
    }));
  };

  const handleOrientationChange = (value: 'horizontal' | 'vertical') => {
    setFormData(prev => ({
      ...prev,
      orientation: value,
    }));
  };

  const handlePlacementChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      placement: value as any,
    }));
  };

  const handleVerticalAlignmentChange = (value: 'left' | 'right') => {
    setFormData(prev => ({
      ...prev,
      verticalAlignment: value,
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] border border-border/50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-lg shadow-primary/5">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Edit Court
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Court Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter court name"
              className="border-border/50 focus-visible:ring-primary"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter court location"
              className="border-border/50 focus-visible:ring-primary"
              required
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="indoor" className="cursor-pointer">Indoor Court</Label>
            <Switch
              id="indoor"
              checked={formData.indoor}
              onCheckedChange={handleSwitchChange}
            />
          </div>

          <div className="space-y-2">
            <Label>Court Orientation</Label>
            <RadioGroup 
              value={formData.orientation} 
              onValueChange={handleOrientationChange}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="horizontal" id="horizontal" />
                <Label htmlFor="horizontal">Horizontal (Landscape)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="vertical" id="vertical" />
                <Label htmlFor="vertical">Vertical (Portrait)</Label>
              </div>
            </RadioGroup>
          </div>

          {formData.orientation === "vertical" && (
            <div className="space-y-2">
              <Label>Vertical Alignment</Label>
              <RadioGroup 
                value={formData.verticalAlignment} 
                onValueChange={handleVerticalAlignmentChange}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="left" id="left-align" />
                  <Label htmlFor="left-align">Left</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="right" id="right-align" />
                  <Label htmlFor="right-align">Right</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="placement">Court Placement</Label>
            <Select 
              value={formData.placement} 
              onValueChange={handlePlacementChange}
            >
              <SelectTrigger id="placement" className="w-full">
                <SelectValue placeholder="Select placement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top-left">Top Left</SelectItem>
                <SelectItem value="top-center">Top Center</SelectItem>
                <SelectItem value="top-right">Top Right</SelectItem>
                <SelectItem value="center-left">Center Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="center-right">Center Right</SelectItem>
                <SelectItem value="bottom-left">Bottom Left</SelectItem>
                <SelectItem value="bottom-center">Bottom Center</SelectItem>
                <SelectItem value="bottom-right">Bottom Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-primary hover:bg-primary/90"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCourtForm; 