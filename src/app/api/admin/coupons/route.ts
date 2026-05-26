import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Coupon from '@/models/Coupon';
import User from '@/models/User';

// GET all active/inactive coupons (Admin Only)
export async function GET(req: NextRequest) {
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

    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return NextResponse.json({ coupons }, { status: 200 });

  } catch (error: any) {
    console.error('Fetch coupons admin error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST create new coupon (Admin Only)
export async function POST(req: NextRequest) {
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
    const { code, discountPercent, expiresAt } = body;

    if (!code || !discountPercent) {
      return NextResponse.json({ error: 'Coupon code and discount percentage are required' }, { status: 400 });
    }

    const uppercaseCode = code.toUpperCase().trim();
    const existingCoupon = await Coupon.findOne({ code: uppercaseCode });
    if (existingCoupon) {
      return NextResponse.json({ error: 'A coupon with this code already exists.' }, { status: 400 });
    }

    // Default expiration date (30 days from now)
    const expiration = expiresAt ? new Date(expiresAt) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const newCoupon = await Coupon.create({
      code: uppercaseCode,
      discountPercent: Number(discountPercent),
      isActive: true,
      expiresAt: expiration
    });

    return NextResponse.json({ message: 'Coupon created successfully', coupon: newCoupon }, { status: 201 });

  } catch (error: any) {
    console.error('Create coupon error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
