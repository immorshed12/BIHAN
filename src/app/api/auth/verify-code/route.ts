import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import VerificationCode from '@/models/VerificationCode';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-super-secret-jwt-key-2026';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { email, code, name } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and verification code are required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const submittedCode = code.trim();

    // 1. Fetch active verification code from MongoDB
    const activeVerification = await VerificationCode.findOne({ email: normalizedEmail });

    if (!activeVerification) {
      return NextResponse.json({ error: 'No verification request found for this email' }, { status: 400 });
    }

    // 2. Validate expiration window
    if (new Date() > activeVerification.expiresAt) {
      await VerificationCode.deleteOne({ _id: activeVerification._id });
      return NextResponse.json({ error: 'Verification code has expired. Please request a new one.' }, { status: 400 });
    }

    // 3. Verify OTP code match
    if (activeVerification.code !== submittedCode) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    // 4. Verification successful, clean up database code entry
    await VerificationCode.deleteOne({ _id: activeVerification._id });

    // 5. Connect / Create User in Database
    let user = await User.findOne({ email: normalizedEmail });
    
    // Strict Admin enforcement check
    const isAdminEmail = normalizedEmail === 'immorshed068@gmail.com';
    const targetRole = isAdminEmail ? 'admin' : 'user';

    if (!user) {
      // Auto-create new user with submitted name (fallback to email prefix)
      user = await User.create({
        email: normalizedEmail,
        name: name || normalizedEmail.split('@')[0],
        role: targetRole,
        purchasedBooks: []
      });
    } else if (user.role !== targetRole) {
      // Force admin role in database if they previously had user role
      user.role = targetRole;
      await user.save();
    }

    // 6. Sign JWT Session Token
    const sessionToken = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        purchasedBooks: user.purchasedBooks.map(id => id.toString())
      },
      JWT_SECRET,
      { expiresIn: '7d' } // Session persists for 7 days
    );

    // 7. Construct Next Response with secure, HTTP-Only Cookie
    const response = NextResponse.json({
      message: 'Sign-in verified successfully',
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
    console.error('Verify OTP error detailed:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: error.message || String(error),
      stack: error.stack
    }, { status: 500 });
  }
}
