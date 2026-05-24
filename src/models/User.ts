import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  role: 'user' | 'admin';
  purchasedBooks: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true, 
    lowercase: true,
    trim: true,
    index: true 
  },
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true 
  },
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },
  purchasedBooks: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Book' 
  }],
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: false }
});

// Prevent Mongoose model recompilation in Next.js Serverless runtime
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
