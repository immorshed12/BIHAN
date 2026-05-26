import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Coupon from '@/models/Coupon';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { code, price } = await req.json();

    if (!code || price === undefined) {
      return NextResponse.json({ error: 'Promo coupon code and book price are required' }, { status: 400 });
    }

    const normalizedCode = code.toUpperCase().trim();
    const coupon = await Coupon.findOne({ code: normalizedCode });

    if (!coupon) {
      return NextResponse.json({ error: 'এই কুপন কোডটি সঠিক নয়' }, { status: 400 }); // "Invalid coupon code"
    }

    if (!coupon.isActive) {
      return NextResponse.json({ error: 'কুপন কোডটি নিষ্ক্রিয় করা হয়েছে' }, { status: 400 }); // "Coupon is inactive"
    }

    if (new Date() > coupon.expiresAt) {
      return NextResponse.json({ error: 'কুপন কোডটির মেয়াদ শেষ হয়ে গেছে' }, { status: 400 }); // "Coupon has expired"
    }

    const originalPrice = Number(price);
    const discountAmount = originalPrice * (coupon.discountPercent / 100);
    const discountedPrice = Math.max(0, originalPrice - discountAmount);

    return NextResponse.json({
      message: 'Coupon code validated successfully',
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      discountAmount: Number(discountAmount.toFixed(2)),
      discountedPrice: Number(discountedPrice.toFixed(2))
    }, { status: 200 });

  } catch (error: any) {
    console.error('Validate coupon error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
