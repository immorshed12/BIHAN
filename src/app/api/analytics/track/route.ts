import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Analytics from '@/models/Analytics';
import Book from '@/models/Book';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { bookId, type, userEmail } = await req.json();

    if (!bookId || !type) {
      return NextResponse.json({ error: 'Book ID and action type are required' }, { status: 400 });
    }

    // Verify book exists
    const bookExists = await Book.findById(bookId);
    if (!bookExists) {
      return NextResponse.json({ error: 'Target book not found' }, { status: 404 });
    }

    const logEntry = await Analytics.create({
      bookId,
      type,
      userEmail: userEmail || 'guest',
      timestamp: new Date()
    });

    return NextResponse.json({ message: 'Interaction logged successfully', log: logEntry }, { status: 201 });

  } catch (error: any) {
    console.error('Log interaction error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
