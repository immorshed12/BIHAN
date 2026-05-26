import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-super-secret-jwt-key-2026';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Find or auto-create the user in our database
    let user = await User.findOne({ email: normalizedEmail });
    const isAdminEmail = normalizedEmail === 'immorshed068@gmail.com';
    const targetRole = isAdminEmail ? 'admin' : 'user';

    if (!user) {
      user = await User.create({
        email: normalizedEmail,
        name: normalizedEmail.split('@')[0],
        role: targetRole,
        purchasedBooks: []
      });
    }

    // 2. Sign the JWT Session Token
    const sessionToken = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        purchasedBooks: user.purchasedBooks.map(id => id.toString())
      },
      JWT_SECRET,
      { expiresIn: '7d' } // 7-day persistent session
    );

    // 3. Construct Next Response with secure, HTTP-Only Cookie
    const response = NextResponse.json({
      message: 'Sign-in completed successfully',
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        purchasedBooks: user.purchasedBooks.map(id => id.toString())
      }
    });

    response.cookies.set('token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    return response;

  } catch (error: any) {
    console.error('Free bypass OTP error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
