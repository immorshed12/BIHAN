import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVerificationCode extends Document {
  email: string;
  code: string;
  expiresAt: Date;
  createdAt: Date;
}

const VerificationCodeSchema = new Schema<IVerificationCode>({
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    lowercase: true,
    trim: true,
    index: true 
  },
  code: { 
    type: String, 
    required: [true, 'Verification code is required'] 
  },
  expiresAt: { 
    type: Date, 
    required: [true, 'Expiration time is required'],
    expires: 0 // Auto-delete document exactly at the expiresAt date
  },
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: false }
});

const VerificationCode: Model<IVerificationCode> = mongoose.models.VerificationCode || mongoose.model<IVerificationCode>('VerificationCode', VerificationCodeSchema);
export default VerificationCode;
