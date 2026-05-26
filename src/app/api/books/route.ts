import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Book from '@/models/Book';
import User from '@/models/User';

// GET all catalog books
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const books = await Book.find().sort({ createdAt: -1 });
    return NextResponse.json({ books }, { status: 200 });
  } catch (error: any) {
    console.error('Fetch books error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST new book (Admin Only)
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    // Auth Check
    const email = req.headers.get('x-user-email') || '';
    if (!email) {
      return NextResponse.json({ error: 'Unauthorized. Admin privileges required.' }, { status: 401 });
    }

    const adminUser = await User.findOne({ email });
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin privileges required.' }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, author, price, coverImage, filePath, pageCount, previewLimit, category } = body;

    if (!title || !description || !author || price === undefined || !coverImage || !filePath || !pageCount) {
      return NextResponse.json({ error: 'Missing required book fields' }, { status: 400 });
    }

    const newBook = await Book.create({
      title,
      description,
      author,
      price: Number(price),
      coverImage,
      filePath,
      pageCount: Number(pageCount),
      previewLimit: Number(previewLimit || 4),
      category: category || 'General',
      isFree: Number(price) === 0,
    });

    return NextResponse.json({ message: 'Book created successfully', book: newBook }, { status: 201 });

  } catch (error: any) {
    console.error('Create book error:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'A book with this storage file path already exists.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
