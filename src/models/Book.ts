import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBook extends Document {
  title: string;
  description: string;
  author: string;
  price: number;
  coverImage: string;
  filePath: string;      // Secured, private GCS object key (e.g., "books/secured-calculus.pdf")
  pageCount: number;
  previewLimit: number;  // Default is 4 pages for free viewing
  ratingsCount: number;
  averageRating: number;
  category: string;
  isFree: boolean;
  createdAt: Date;
}

const BookSchema = new Schema<IBook>({
  title: { 
    type: String, 
    required: [true, 'Book title is required'],
    trim: true 
  },
  description: { 
    type: String, 
    required: [true, 'Description is required'] 
  },
  author: { 
    type: String, 
    required: [true, 'Author name is required'],
    trim: true 
  },
  price: { 
    type: Number, 
    required: [true, 'Price is required'], 
    min: [0, 'Price cannot be negative'] 
  },
  coverImage: { 
    type: String, 
    required: [true, 'Cover image URL is required'] 
  },
  filePath: { 
    type: String, 
    required: [true, 'Private storage file path is required'],
    unique: true 
  },
  pageCount: { 
    type: Number, 
    required: [true, 'Total page count is required'],
    min: [1, 'Page count must be at least 1']
  },
  previewLimit: { 
    type: Number, 
    default: 4, 
    min: [1, 'Preview limit must be at least 1'] 
  },
  ratingsCount: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 5.0
  },
  category: {
    type: String,
    default: 'General'
  },
  isFree: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: false }
});

const Book: Model<IBook> = mongoose.models.Book || mongoose.model<IBook>('Book', BookSchema);
export default Book;
