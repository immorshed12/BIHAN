import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Book from '@/models/Book';
import User from '@/models/User';

// GET individual book details
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const book = await Book.findById(params.id);
    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }
    return NextResponse.json({ book }, { status: 200 });
  } catch (error: any) {
    console.error('Fetch book by ID error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT update book metadata (Admin Only)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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

    const existingBook = await Book.findById(params.id);
    if (!existingBook) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    // Update fields dynamically
    if (title !== undefined) existingBook.title = title;
    if (description !== undefined) existingBook.description = description;
    if (author !== undefined) existingBook.author = author;
    if (price !== undefined) {
      existingBook.price = Number(price);
      existingBook.isFree = Number(price) === 0;
    }
    if (coverImage !== undefined) existingBook.coverImage = coverImage;
    if (filePath !== undefined) existingBook.filePath = filePath;
    if (pageCount !== undefined) existingBook.pageCount = Number(pageCount);
    if (previewLimit !== undefined) existingBook.previewLimit = Number(previewLimit);
    if (category !== undefined) existingBook.category = category;

    await existingBook.save();

    return NextResponse.json({ message: 'Book updated successfully', book: existingBook }, { status: 200 });

  } catch (error: any) {
    console.error('Update book error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE book (Admin Only)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
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

    const deletedBook = await Book.findByIdAndDelete(params.id);
    if (!deletedBook) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Book deleted successfully' }, { status: 200 });

  } catch (error: any) {
    console.error('Delete book error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
