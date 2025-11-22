import mongoose, { Schema, Document } from 'mongoose';

export interface IIncident extends Document {
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
  reportedBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

const IncidentSchema: Schema = new Schema(
  {
    title: { 
      type: String, 
      required: true,
      trim: true
    },
    category: { 
      type: String, 
      enum: ['electricity', 'water', 'internet', 'hostel', 'garbage', 'it', 'equipment'],
      required: true
    },
    description: { 
      type: String, 
      required: true 
    },
    priority: { 
      type: String, 
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    status: { 
      type: String, 
      enum: ['new', 'in-progress', 'resolved', 'closed'],
      default: 'new'
    },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      address: { type: String }
    },
    images: [{ 
      type: String 
    }],
    reportedBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    assignedTo: { 
      type: Schema.Types.ObjectId, 
      ref: 'User' 
    },
    resolvedAt: { 
      type: Date 
    }
  },
  { 
    timestamps: true 
  }
);

// Index for duplicate detection
IncidentSchema.index({ 
  'location.latitude': 1, 
  'location.longitude': 1, 
  category: 1, 
  status: 1 
});

export default mongoose.models.Incident || mongoose.model<IIncident>('Incident', IncidentSchema);

