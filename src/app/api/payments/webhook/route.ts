import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import Book from '@/models/Book';
import WebhookLog from '@/models/WebhookLog';
import { parseIncomingSMS } from '@/lib/smsParser';

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'fallback_demo_secret';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    // 1. Webhook Signature Authorization Check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized. Missing authorization token' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    if (token !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Forbidden. Invalid webhook secret token' }, { status: 403 });
    }

    // 2. Parse Incoming Payload
    const body = await req.json();
    const { sender, message } = body; // Raw sender ("bKash"/"Nagad") and raw SMS body

    if (!sender || !message) {
      return NextResponse.json({ error: 'Sender header and raw message are required' }, { status: 400 });
    }

    // 3. Regex Filter & Transaction Extraction
    const payment = parseIncomingSMS(sender, message);
    if (!payment) {
      // Discard spam, cash-out notifications, or marketing texts
      return NextResponse.json({ 
        message: 'Message ignored. Non-payment SMS format or invalid sender.' 
      }, { status: 200 });
    }

    // 4. Replay Attack Protection: Check for duplicate webhook logs
    const existingLog = await WebhookLog.findOne({ parsedTxID: payment.txId });
    if (existingLog) {
      return NextResponse.json({ 
        error: 'Duplicate transaction. This TxID has already been received and logged.' 
      }, { status: 409 });
    }

    // 5. Create Webhook Reconcile Log
    const log = await WebhookLog.create({
      rawSMS: message,
      senderNumber: sender.trim(),
      parsedSender: payment.senderWallet,
      parsedAmount: payment.amount,
      parsedTxID: payment.txId,
      gateway: payment.gateway,
      isMatched: false,
    });

    // 6. DB Matching Engine: Search for pending user-submitted claims
    const matchingOrder = await Order.findOne({
      submittedTxID: payment.txId,
      status: 'pending',
    });

    if (matchingOrder) {
      // Verify book details and prices
      const book = await Book.findById(matchingOrder.bookId);
      const targetPrice = book ? book.price : matchingOrder.amountPaid;

      if (payment.amount >= targetPrice) {
        // Complete the handshake! Lock approval status
        matchingOrder.status = 'approved';
        matchingOrder.verifiedAt = new Date();
        await matchingOrder.save();

        // Dynamically add book to the customer's unlocked catalog array
        await User.findByIdAndUpdate(matchingOrder.userId, {
          $addToSet: { purchasedBooks: matchingOrder.bookId }
        });

        // Set webhook reconciled flag
        log.isMatched = true;
        await log.save();

        return NextResponse.json({
          message: 'Payment synchronized and order successfully auto-approved!',
          txId: payment.txId,
          matched: true,
          orderId: matchingOrder._id,
        }, { status: 200 });
      } else {
        return NextResponse.json({
          message: `Payment TxID matched, but amount Tk ${payment.amount} is less than required Tk ${targetPrice}`,
          txId: payment.txId,
          matched: false,
          amountMismatch: true,
        }, { status: 200 });
      }
    }

    // Handshake pending (Money received, but user hasn't claimed it on the web interface yet)
    return NextResponse.json({
      message: 'Payment logged. Transaction is unmatched and waiting for customer claim.',
      txId: payment.txId,
      matched: false,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Webhook synchronization error:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Duplicate transaction TxID logged.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
