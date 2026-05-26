import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAnalytics extends Document {
  bookId: mongoose.Types.ObjectId;
  type: 'preview' | 'download';
  userEmail: string;
  timestamp: Date;
}

const AnalyticsSchema = new Schema<IAnalytics>({
  bookId: {
    type: Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  type: {
    type: String,
    enum: ['preview', 'download'],
    required: true,
  },
  userEmail: {
    type: String,
    default: 'guest',
    trim: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Optimization index for quick dashboard analytics retrieval
AnalyticsSchema.index({ type: 1, bookId: 1 });

const Analytics: Model<IAnalytics> = mongoose.models.Analytics || mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);
export default Analytics;
