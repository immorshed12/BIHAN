import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  bookId: mongoose.Types.ObjectId;
  amountPaid: number;
  paymentGateway: 'bkash' | 'nagad';
  customerPhone: string;     // The phone number the customer paid from
  submittedTxID: string;     // User inputted TxID for matching
  status: 'pending' | 'approved' | 'rejected';
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'User ID is required'],
    index: true 
  },
  bookId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Book', 
    required: [true, 'Book ID is required'] 
  },
  amountPaid: { 
    type: Number, 
    required: [true, 'Amount paid is required'],
    min: [0, 'Amount paid cannot be negative'] 
  },
  paymentGateway: { 
    type: String, 
    enum: {
      values: ['bkash', 'nagad'],
      message: '{VALUE} is not a supported gateway'
    }, 
    required: [true, 'Payment gateway is required'] 
  },
  customerPhone: { 
    type: String, 
    required: [true, 'Customer phone number is required'],
    trim: true 
  },
  submittedTxID: { 
    type: String, 
    required: [true, 'Transaction ID (TxID) is required'], 
    unique: true,             // Absolutely critical to prevent replay double-claims
    trim: true,
    uppercase: true,          // Ensures case-insensitivity on database lookups
    index: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending',
    index: true 
  },
  verifiedAt: { 
    type: Date 
  },
}, {
  timestamps: true // Tracks createdAt and updatedAt automatically
});

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
export default Order;
