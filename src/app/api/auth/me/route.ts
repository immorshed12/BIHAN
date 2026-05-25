import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-super-secret-jwt-key-2026';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // 1. Fetch secure cookie 'token'
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // 2. Decode and verify JWT
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      // If token is invalid or expired, clear it and return null session
      const response = NextResponse.json({ user: null }, { status: 200 });
      response.cookies.set('token', '', { maxAge: 0, path: '/' });
      return response;
    }

    if (!decoded || !decoded.id) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // 3. Fetch fresh user information from MongoDB
    const user = await User.findById(decoded.id);

    if (!user) {
      // Clear token if user was deleted from database
      const response = NextResponse.json({ user: null }, { status: 200 });
      response.cookies.set('token', '', { maxAge: 0, path: '/' });
      return response;
    }

    // Enforce admin role again if it's the target email
    const isAdminEmail = user.email === 'immorshed068@gmail.com';
    if (isAdminEmail && user.role !== 'admin') {
      user.role = 'admin';
      await user.save();
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        purchasedBooks: user.purchasedBooks.map(id => id.toString())
      }
    });

  } catch (error: any) {
    console.error('Fetch Session me error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
