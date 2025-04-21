
import { User } from '../utils/types';

// Static user data for demonstration
export const users: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'customer@example.com',
    phone: '555-123-4567',
    role: 'customer',
    password: 'password123', // In a real app, we'd use hashed passwords
  },
  {
    id: '2',
    name: 'Restaurant Owner',
    email: 'owner@example.com',
    phone: '555-987-6543',
    role: 'owner',
    password: 'password123',
  },
  {
    id: '3',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '555-555-5555',
    role: 'customer',
    password: 'password123',
  },
];

// Helper functions to work with user data
export const findUserByEmail = (email: string): User | undefined => {
  return users.find(user => user.email === email);
};

export const validateCredentials = (email: string, password: string): User | null => {
  const user = findUserByEmail(email);
  if (user && user.password === password) {
    return user;
  }
  return null;
};
