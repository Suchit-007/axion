import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession['user'];
  }

  interface User {
    role: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
  }
}

export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'student' | 'staff' | 'technician' | 'admin';
  phone?: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Incident {
  _id: string;
  title: string;
  category: 'electricity' | 'water' | 'internet' | 'hostel' | 'garbage' | 'it' | 'equipment';
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'in-progress' | 'resolved' | 'closed';
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  images: string[];
  reportedBy: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

export interface Prediction {
  _id: string;
  type: 'frequency' | 'pattern' | 'trend';
  category: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  confidence: number;
  predictedTimeframe: Date;
  reason: string;
  isActive: boolean;
  createdAt: Date;
}

