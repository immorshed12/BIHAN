import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Book from '@/models/Book';
import User from '@/models/User';
import WebhookLog from '@/models/WebhookLog';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { bookId, amountPaid, paymentGateway, customerPhone, submittedTxID } = body;
    const email = req.headers.get('x-user-email') || 'guest@example.com'; // Fallback for simulation auth context

    // 1. Basic Parameter Validations
    if (!bookId || !amountPaid || !paymentGateway || !customerPhone || !submittedTxID) {
      return NextResponse.json({ error: 'Missing required checkout parameters' }, { status: 400 });
    }

    // 2. Fetch User Account Context
    let user = await User.findOne({ email });
    if (!user) {
      // Auto-create guest user for demo friction reduction
      user = await User.create({
        email,
        name: email.split('@')[0],
        role: 'user',
      });
    }

    // 3. Confirm Book Catalog and Pricing Matches
    const book = await Book.findById(bookId);
    if (!book) {
      return NextResponse.json({ error: 'Target catalogue item not found' }, { status: 404 });
    }

    if (amountPaid < book.price) {
      return NextResponse.json({ 
        error: `Insufficient transaction payment. Book costs Tk ${book.price}, received Tk ${amountPaid}` 
      }, { status: 400 });
    }

    // Normalize TxID to strictly protect against case-insensitivity discrepancies
    const normalizedTxId = submittedTxID.trim().toUpperCase();

    // 4. Guard against Double Claim / Replay Attacks
    const existingOrder = await Order.findOne({ submittedTxID: normalizedTxId });
    if (existingOrder) {
      return NextResponse.json({ 
        error: 'This Transaction ID (TxID) has already been submitted or claimed.' 
      }, { status: 409 });
    }

    // 5. Create Pending Order Document
    const order = await Order.create({
      userId: user._id,
      bookId: book._id,
      amountPaid,
      paymentGateway,
      customerPhone,
      submittedTxID: normalizedTxId,
      status: 'pending',
    });

    // 6. Hybrid Reconcile Step: Check if the Android automation webhook has already pushed this log!
    // (This handles the race condition where the SMS arrives *before* the user submits the form).
    const matchingSMSLog = await WebhookLog.findOne({
      parsedTxID: normalizedTxId,
      isMatched: false,
    });

    if (matchingSMSLog && matchingSMSLog.parsedAmount >= book.price) {
      // Complete handshake instantly!
      order.status = 'approved';
      order.verifiedAt = new Date();
      await order.save();

      // Add to user libraries
      await User.findByIdAndUpdate(user._id, {
        $addToSet: { purchasedBooks: book._id }
      });

      // Update SMS reconciliation log
      matchingSMSLog.isMatched = true;
      await matchingSMSLog.save();

      return NextResponse.json({
        message: 'Payment received and auto-verified successfully!',
        orderId: order._id,
        status: 'approved',
      }, { status: 200 });
    }

    // Return pending status if no matching webhook log exists yet
    return NextResponse.json({
      message: 'Transaction registered successfully. Awaiting bKash/Nagad automated reconciliation.',
      orderId: order._id,
      status: 'pending',
    }, { status: 201 });

  } catch (error: any) {
    console.error('Checkout error:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'This Transaction ID is already claimed.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
