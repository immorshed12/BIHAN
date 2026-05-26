import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const userId = params.id;
    const { bookId } = await req.json();
    const adminEmail = req.headers.get('x-user-email') || '';

    // Auth Check
    if (!adminEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!bookId) {
      return NextResponse.json({ error: 'Book ID is required to grant access' }, { status: 400 });
    }

    // Add book ID to the user's purchased books array using $addToSet (ensures no duplicates)
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { purchasedBooks: bookId } },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Access to book successfully granted!',
      userId,
      bookId,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Grant access error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
