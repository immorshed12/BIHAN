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
      return NextResponse.json({ error: 'Book ID is required to revoke access' }, { status: 400 });
    }

    // Pull/Remove book ID from the user's purchased books array
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { purchasedBooks: bookId } },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Access to book successfully revoked!',
      userId,
      bookId,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Revocation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
