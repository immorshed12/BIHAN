import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGatewayState extends Document {
  deviceId: string;
  lastPing: Date;
  status: 'online' | 'offline';
  appVersion: string;
  createdAt: Date;
  updatedAt: Date;
}

const GatewayStateSchema = new Schema<IGatewayState>({
  deviceId: { 
    type: String, 
    required: [true, 'Device ID is required'], 
    unique: true,
    trim: true 
  },
  lastPing: { 
    type: Date, 
    required: [true, 'Last ping date is required'], 
    default: Date.now 
  },
  status: { 
    type: String, 
    enum: ['online', 'offline'], 
    default: 'offline',
    index: true 
  },
  appVersion: { 
    type: String, 
    required: [true, 'Android App version is required'],
    trim: true 
  },
}, {
  timestamps: true
});

const GatewayState: Model<IGatewayState> = mongoose.models.GatewayState || mongoose.model<IGatewayState>('GatewayState', GatewayStateSchema);
export default GatewayState;
