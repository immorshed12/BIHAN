import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-super-secret-jwt-key-2026';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json({ error: 'Google ID Token is required' }, { status: 400 });
    }

    // Verify token with Google's secure tokeninfo endpoint
    const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    if (!googleRes.ok) {
      return NextResponse.json({ error: 'গুগল লগইন ভেরিফিকেশন ব্যর্থ হয়েছে।' }, { status: 400 });
    }

    const payload = await googleRes.json();

    // Optional client ID audience verification if configured
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (googleClientId && payload.aud !== googleClientId) {
      return NextResponse.json({ error: 'Google client ID mismatch' }, { status: 400 });
    }

    const email = payload.email.toLowerCase().trim();
    const name = payload.name;

    // Connect user record inside MongoDB
    let user = await User.findOne({ email });
    const isAdminEmail = email === 'immorshed068@gmail.com';
    const targetRole = isAdminEmail ? 'admin' : 'user';

    if (!user) {
      user = await User.create({
        email,
        name: name || email.split('@')[0],
        role: targetRole,
        purchasedBooks: []
      });
    } else if (user.role !== targetRole) {
      user.role = targetRole;
      await user.save();
    }

    // Create session JWT payload
    const sessionToken = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        purchasedBooks: user.purchasedBooks.map(id => id.toString())
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({
      message: 'Google sign-in successful',
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        purchasedBooks: user.purchasedBooks.map(id => id.toString())
      }
    });

    // Set secure HTTP-Only cookie named 'token'
    response.cookies.set('token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/'
    });

    return response;

  } catch (error: any) {
    console.error('Google Auth Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
