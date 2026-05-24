import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import Book from '@/models/Book';
import WebhookLog from '@/models/WebhookLog';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const orderId = params.id;
    const adminEmail = req.headers.get('x-user-email') || '';

    // Auth Check
    if (!adminEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status === 'approved') {
      return NextResponse.json({ message: 'Order is already approved' }, { status: 200 });
    }

    // 1. Set Order status to approved
    order.status = 'approved';
    order.verifiedAt = new Date();
    await order.save();

    // 2. Unlock the book inside the customer user model
    await User.findByIdAndUpdate(order.userId, {
      $addToSet: { purchasedBooks: order.bookId }
    });

    // 3. Mark matching webhook log as reconciled if it exists
    await WebhookLog.findOneAndUpdate(
      { parsedTxID: order.submittedTxID },
      { isMatched: true }
    );

    return NextResponse.json({
      message: 'Order manually verified and unlocked successfully!',
      status: 'approved',
    }, { status: 200 });

  } catch (error: any) {
    console.error('Order manual approval error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
