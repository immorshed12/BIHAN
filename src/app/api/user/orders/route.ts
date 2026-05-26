import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Book from '@/models/Book'; // Required for populate()
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-super-secret-jwt-key-2026';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // 1. Fetch secure cookie 'token'
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ orders: [] }, { status: 200 });
    }

    // 2. Decode and verify JWT
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      return NextResponse.json({ error: 'Invalid or expired session. Please login again.' }, { status: 401 });
    }

    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: 'Unauthorized session.' }, { status: 401 });
    }

    // 3. Query all order claims submitted by the current user
    const orders = await Order.find({ userId: decoded.id })
      .populate({
        path: 'bookId',
        select: 'title author price coverImage pageCount'
      })
      .sort({ createdAt: -1 });

    return NextResponse.json({ orders }, { status: 200 });

  } catch (error: any) {
    console.error('Fetch user orders error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
