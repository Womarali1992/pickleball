"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { userDb } from '@/lib/db';
import { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit2, Trash2, Star } from 'lucide-react';

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [newUser, setNewUser] = useState<Partial<User>>({
    name: '',
    email: '',
    duprRating: 0,
    phoneNumber: '',
    skillLevel: 'beginner',
    membershipStatus: 'pending',
  });

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('Loading users...');
        const allUsers = userDb.getAllUsers();
        console.log('Loaded users:', allUsers);
        setUsers(allUsers);
      } catch (err) {
        console.error('Error loading users:', err);
        setError('Failed to load users. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  console.log('Filtered users:', filteredUsers);

  const handleAddUser = () => {
    const createdUser = userDb.createUser(newUser as Omit<User, 'id' | 'createdAt' | 'updatedAt'>);
    if (createdUser) {
      setUsers([...users, createdUser]);
      setIsAddDialogOpen(false);
      setNewUser({
        name: '',
        email: '',
        duprRating: 0,
        phoneNumber: '',
        skillLevel: 'beginner',
        membershipStatus: 'pending',
      });
    }
  };

  const handleEditUser = () => {
    if (editingUser) {
      const updatedUser = userDb.updateUser(editingUser.id, editingUser);
      if (updatedUser) {
        setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
        setIsEditDialogOpen(false);
        setEditingUser(null);
      }
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const success = userDb.deleteUser(userId);
      if (success) {
        setUsers(users.filter(u => u.id !== userId));
      }
    }
  };

  const getSkillLevelColor = (skillLevel?: string) => {
    switch (skillLevel) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-blue-500';
      case 'advanced': return 'bg-purple-500';
      case 'professional': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-center mb-2">User Management</h1>
          <p className="text-muted-foreground text-center">
            Manage user accounts and permissions
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading users...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-destructive">{error}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label>Name</label>
                      <Input
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label>Email</label>
                      <Input
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label>DUPR Rating</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newUser.duprRating}
                        onChange={(e) => setNewUser({ ...newUser, duprRating: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label>Phone Number</label>
                      <Input
                        value={newUser.phoneNumber}
                        onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label>Skill Level</label>
                      <Select
                        value={newUser.skillLevel}
                        onValueChange={(value) => setNewUser({ ...newUser, skillLevel: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select skill level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                          <SelectItem value="professional">Professional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label>Membership Status</label>
                      <Select
                        value={newUser.membershipStatus}
                        onValueChange={(value) => setNewUser({ ...newUser, membershipStatus: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleAddUser} className="w-full">
                      Add User
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>DUPR Rating</TableHead>
                    <TableHead>Skill Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <p className="text-muted-foreground">No users found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            {user.duprRating.toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getSkillLevelColor(user.skillLevel)}>
                            {user.skillLevel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.membershipStatus === 'active' ? 'success' : 'secondary'}>
                            {user.membershipStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingUser(user)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit User</DialogTitle>
                                </DialogHeader>
                                {editingUser && (
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <label>Name</label>
                                      <Input
                                        value={editingUser.name}
                                        onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <label>Email</label>
                                      <Input
                                        type="email"
                                        value={editingUser.email}
                                        onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <label>DUPR Rating</label>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        value={editingUser.duprRating}
                                        onChange={(e) => setEditingUser({ ...editingUser, duprRating: parseFloat(e.target.value) })}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <label>Skill Level</label>
                                      <Select
                                        value={editingUser.skillLevel}
                                        onValueChange={(value) => setEditingUser({ ...editingUser, skillLevel: value as any })}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select skill level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="beginner">Beginner</SelectItem>
                                          <SelectItem value="intermediate">Intermediate</SelectItem>
                                          <SelectItem value="advanced">Advanced</SelectItem>
                                          <SelectItem value="professional">Professional</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-2">
                                      <label>Membership Status</label>
                                      <Select
                                        value={editingUser.membershipStatus}
                                        onValueChange={(value) => setEditingUser({ ...editingUser, membershipStatus: value as any })}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="active">Active</SelectItem>
                                          <SelectItem value="inactive">Inactive</SelectItem>
                                          <SelectItem value="pending">Pending</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <Button onClick={handleEditUser} className="w-full">
                                      Save Changes
                                    </Button>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
} 