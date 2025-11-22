import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  password: string;
  role: 'student' | 'staff' | 'technician' | 'admin';
  phone?: string;
  location?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: { 
      type: String, 
      required: true, 
      unique: true,
      lowercase: true,
      trim: true
    },
    name: { 
      type: String, 
      required: true 
    },
    password: { 
      type: String, 
      required: true 
    },
    role: { 
      type: String, 
      enum: ['student', 'staff', 'technician', 'admin'],
      default: 'student'
    },
    phone: { 
      type: String 
    },
    location: { 
      type: String 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    }
  },
  { 
    timestamps: true 
  }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

