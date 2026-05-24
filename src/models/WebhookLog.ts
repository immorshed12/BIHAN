import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWebhookLog extends Document {
  rawSMS: string;
  senderNumber: string;    // Raw sender tag from SMS header (e.g., "bKash" or "Nagad")
  parsedSender: string;    // The customer's mobile wallet number parsed from body
  parsedAmount: number;
  parsedTxID: string;      // Normalized transaction identifier
  gateway: 'bkash' | 'nagad';
  isMatched: boolean;      // True if successfully reconciled with a customer Order
  createdAt: Date;
}

const WebhookLogSchema = new Schema<IWebhookLog>({
  rawSMS: { 
    type: String, 
    required: [true, 'Raw SMS body is required'] 
  },
  senderNumber: { 
    type: String, 
    required: [true, 'Sender name/number header is required'],
    trim: true
  },
  parsedSender: { 
    type: String, 
    required: [true, 'Parsed sender number is required'],
    trim: true 
  },
  parsedAmount: { 
    type: Number, 
    required: [true, 'Parsed amount is required'],
    min: [0, 'Parsed amount cannot be negative'] 
  },
  parsedTxID: { 
    type: String, 
    required: [true, 'Parsed Transaction ID is required'], 
    unique: true,          // Enforces single insertion to block duplicate replay webhooks
    trim: true,
    uppercase: true,
    index: true 
  },
  gateway: { 
    type: String, 
    enum: ['bkash', 'nagad'], 
    required: [true, 'Parsed gateway is required'] 
  },
  isMatched: { 
    type: Boolean, 
    default: false,
    index: true 
  },
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: false }
});

const WebhookLog: Model<IWebhookLog> = mongoose.models.WebhookLog || mongoose.model<IWebhookLog>('WebhookLog', WebhookLogSchema);
export default WebhookLog;
