import { User } from './types';

// In-memory database for demo purposes
// In a real application, you would use a proper database like PostgreSQL, MongoDB, etc.
let users: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    duprRating: 4.25,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    phoneNumber: '+1234567890',
    skillLevel: 'intermediate',
    membershipStatus: 'active',
    preferredCourts: ['Court 1', 'Court 2']
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    duprRating: 4.75,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    phoneNumber: '+1987654321',
    skillLevel: 'advanced',
    membershipStatus: 'active',
    preferredCourts: ['Court 3']
  }
];

export const userDb = {
  // Get all users
  getAllUsers: () => users,

  // Get user by ID
  getUserById: (id: string) => users.find(user => user.id === id),

  // Get user by email
  getUserByEmail: (email: string) => users.find(user => user.email === email),

  // Create new user
  createUser: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newUser: User = {
      ...userData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    users.push(newUser);
    return newUser;
  },

  // Update user
  updateUser: (id: string, userData: Partial<User>) => {
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) return null;

    const updatedUser = {
      ...users[userIndex],
      ...userData,
      updatedAt: new Date()
    };
    users[userIndex] = updatedUser;
    return updatedUser;
  },

  // Delete user
  deleteUser: (id: string) => {
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) return false;
    users.splice(userIndex, 1);
    return true;
  },

  // Update DUPR rating
  updateDuprRating: (id: string, newRating: number) => {
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) return null;

    const updatedUser = {
      ...users[userIndex],
      duprRating: newRating,
      updatedAt: new Date()
    };
    users[userIndex] = updatedUser;
    return updatedUser;
  }
}; 