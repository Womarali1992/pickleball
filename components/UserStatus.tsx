"use client";

import React from 'react';
import { User } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, User as UserIcon } from 'lucide-react';

interface UserStatusProps {
  user: User;
}

const getSkillLevelColor = (skillLevel?: string) => {
  switch (skillLevel) {
    case 'beginner':
      return 'bg-green-500';
    case 'intermediate':
      return 'bg-blue-500';
    case 'advanced':
      return 'bg-purple-500';
    case 'professional':
      return 'bg-yellow-500';
    default:
      return 'bg-gray-500';
  }
};

const getMembershipBadgeVariant = (status?: string) => {
  switch (status) {
    case 'active':
      return 'success';
    case 'inactive':
      return 'destructive';
    case 'pending':
      return 'warning';
    default:
      return 'secondary';
  }
};

export default function UserStatus({ user }: UserStatusProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <UserIcon className="w-8 h-8 text-primary" />
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 bg-primary text-white rounded-full p-1">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold">{user.name}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-primary/5 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">DUPR Rating</span>
            </div>
            <p className="text-2xl font-bold mt-1">{user.duprRating.toFixed(2)}</p>
          </div>
          
          <div className="bg-primary/5 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Skill Level</span>
            </div>
            <Badge 
              className={`mt-1 ${getSkillLevelColor(user.skillLevel)}`}
            >
              {user.skillLevel || 'Not Set'}
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Membership Status</span>
            <Badge variant={getMembershipBadgeVariant(user.membershipStatus) as any}>
              {user.membershipStatus || 'Not Set'}
            </Badge>
          </div>
          
          {user.phoneNumber && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Phone</span>
              <span className="text-sm font-medium">{user.phoneNumber}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Member Since</span>
            <span className="text-sm font-medium">
              {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 