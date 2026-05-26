import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Book from '@/models/Book';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const { rating } = await req.json();

    const ratingVal = Number(rating);
    if (!ratingVal || ratingVal < 1 || ratingVal > 5) {
      return NextResponse.json({ error: 'Valid rating between 1 and 5 is required' }, { status: 400 });
    }

    const book = await Book.findById(params.id);
    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    // Recalculate average star ratings dynamically
    const currentCount = book.ratingsCount || 0;
    const currentAvg = book.averageRating || 5.0;

    const newCount = currentCount + 1;
    const newAvg = ((currentAvg * currentCount) + ratingVal) / newCount;

    book.ratingsCount = newCount;
    book.averageRating = Number(newAvg.toFixed(1));

    await book.save();

    return NextResponse.json({
      message: 'Review rating submitted successfully',
      ratingsCount: book.ratingsCount,
      averageRating: book.averageRating
    }, { status: 200 });

  } catch (error: any) {
    console.error('Submit rating error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
