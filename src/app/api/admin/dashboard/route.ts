import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import Book from '@/models/Book';
import WebhookLog from '@/models/WebhookLog';
import GatewayState from '@/models/GatewayState';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // Auth Check: Validate admin role header
    const email = req.headers.get('x-user-email') || '';
    if (!email) {
      return NextResponse.json({ error: 'Unauthorized. Login required.' }, { status: 401 });
    }

    const adminUser = await User.findOne({ email });
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin privileges required.' }, { status: 403 });
    }

    // 1. Calculate General Aggregations
    const totalApprovedOrders = await Order.countDocuments({ status: 'approved' });
    const totalPendingOrders = await Order.countDocuments({ status: 'pending' });
    const allApprovedOrders = await Order.find({ status: 'approved' });
    const totalRevenue = allApprovedOrders.reduce((acc, order) => acc + order.amountPaid, 0);

    // 2. Fetch Gateway connection state
    const activeGateway = await GatewayState.findOne().sort({ lastPing: -1 });

    // 3. Fetch List of Pending Manual Orders
    const pendingOrders = await Order.find({ status: 'pending' })
      .populate('userId', 'email name')
      .populate('bookId', 'title price')
      .sort({ createdAt: -1 });

    // 4. Fetch list of WebhookLogs (unmatched highlighted first)
    const logs = await WebhookLog.find()
      .sort({ createdAt: -1 })
      .limit(50);

    // 5. Fetch all users
    const usersList = await User.find()
      .populate('purchasedBooks', 'title')
      .sort({ createdAt: -1 });

    // 6. Fetch Catalog Books
    const catalogList = await Book.find().sort({ createdAt: -1 });

    return NextResponse.json({
      metrics: {
        totalRevenue,
        totalApprovedOrders,
        totalPendingOrders,
      },
      gateway: activeGateway ? {
        deviceId: activeGateway.deviceId,
        lastPing: activeGateway.lastPing,
        status: activeGateway.status,
        appVersion: activeGateway.appVersion,
      } : null,
      pendingOrders: pendingOrders.map((o: any) => ({
        id: o._id,
        userEmail: o.userId?.email || 'Unknown User',
        userName: o.userId?.name || 'Guest',
        bookTitle: o.bookId?.title || 'Unknown Book',
        bookPrice: o.bookId?.price || 0,
        amountPaid: o.amountPaid,
        gateway: o.paymentGateway,
        phone: o.customerPhone,
        txId: o.submittedTxID,
        createdAt: o.createdAt,
      })),
      logs,
      users: usersList.map((u: any) => ({
        id: u._id,
        email: u.email,
        name: u.name,
        role: u.role,
        purchasedBooks: u.purchasedBooks.map((b: any) => ({ id: b._id, title: b.title })),
        createdAt: u.createdAt,
      })),
      catalog: catalogList,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Admin API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
