import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { db, User } from '../db';
import { sendApprovalEmail } from '../services/email';
import { encode } from '../utils/token';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (email: string, password: string, name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      checkUserStatus(parsedUser);
    }
  }, []);

  const checkUserStatus = async (user: User) => {
    try {
      const dbUser = await db.users.where('email').equals(user.email).first();
      if (dbUser?.status === 'rejected') {
        logout();
        navigate('/login');
        return;
      }
      if (dbUser?.status === 'approved') {
        setUser(dbUser);
      }
    } catch (error) {
      console.error('Error checking user status:', error);
      logout();
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      const existingUser = await db.users.where('email').equals(email).first();
      if (existingUser) {
        throw new Error('User already exists');
      }

      const user: User = {
        email,
        password,
        name,
        status: 'pending',
        createdAt: new Date()
      };

      const userId = await db.users.add(user);
      
      // Create a secure token with user info and timestamp
      const tokenData = JSON.stringify({
        userId,
        email,
        timestamp: Date.now()
      });
      
      try {
        const token = encode(tokenData);
        
        // Generate approval/rejection URLs with the secure token
        const baseUrl = window.location.origin;
        const approveUrl = `${baseUrl}/approve/${token}`;
        const rejectUrl = `${baseUrl}/reject/${token}`;

        // Send approval email
        await sendApprovalEmail({
          to_email: 'unlessuser99@gmail.com',
          user_name: name,
          user_email: email,
          approve_url: approveUrl,
          reject_url: rejectUrl
        });

        navigate('/pending-approval');
      } catch (error) {
        // If email sending fails, still create the user but show a warning
        console.error('Error sending approval email:', error);
        toast.error('Account created but there was an error sending the approval email');
        navigate('/pending-approval');
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create account');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const user = await db.users.where('email').equals(email).first();
      
      if (!user) {
        throw new Error('User not found');
      }

      if (user.password !== password) {
        throw new Error('Invalid password');
      }

      if (user.status === 'pending') {
        throw new Error('Your account is pending approval');
      }

      if (user.status === 'rejected') {
        throw new Error('Your account has been rejected');
      }

      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/');
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}