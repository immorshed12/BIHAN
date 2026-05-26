import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import VerificationCode from '@/models/VerificationCode';
import User from '@/models/User';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { email, mode } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'সঠিক ইমেইল অ্যাড্রেস প্রদান করা আবশ্যক।' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Mode-specific validation checks to ensure logical login/signup boundaries
    if (mode === 'login') {
      const userExists = await User.findOne({ email: normalizedEmail });
      if (!userExists) {
        return NextResponse.json({ error: 'এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে আগে নতুন অ্যাকাউন্ট তৈরি (সাইন-আপ) করুন।' }, { status: 400 });
      }
    } else if (mode === 'signup') {
      const userExists = await User.findOne({ email: normalizedEmail });
      if (userExists) {
        return NextResponse.json({ error: 'এই ইমেইল দিয়ে ইতিমধ্যেই একটি অ্যাকাউন্ট তৈরি করা আছে। অনুগ্রহ করে লগইন করুন।' }, { status: 400 });
      }
    }

    // Generate a secure, 6-digit random code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Expire code in 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Upsert verification code inside MongoDB
    await VerificationCode.findOneAndUpdate(
      { email: normalizedEmail },
      { code, expiresAt },
      { upsert: true, new: true }
    );

    // Print to server terminal/logs in all environments
    console.log(`\n========================================\n[OTP AUTH] Verification code for ${normalizedEmail}: ${code}\n========================================\n`);

    // Attempt to send actual email if SMTP credentials are configured
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);

    if (smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        const mailOptions = {
          from: `"বিহান (BIHAN)" <${smtpUser}>`,
          to: normalizedEmail,
          subject: 'বিহান সাইন-ইন ভেরিফিকেশন কোড',
          html: `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 500px; margin: auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 20px; background-color: #f8fafc; color: #1e293b; text-align: center;">
              <h2 style="color: #d97706; font-size: 24px; margin-bottom: 20px; font-weight: 800;">বিহান (BIHAN)</h2>
              <p style="font-size: 15px; color: #334155; line-height: 1.6;">আপনার অ্যাকাউন্টটি সুরক্ষিতভাবে লগইন বা সাইন-আপ করতে নিচের ভেরিফিকেশন কোডটি ব্যবহার করুন:</p>
              <div style="background-color: #fef3c7; color: #b45309; font-size: 32px; font-weight: 900; letter-spacing: 6px; padding: 15px 30px; border-radius: 12px; display: inline-block; margin: 25px 0; border: 1px solid #fde68a;">${code}</div>
              <p style="font-size: 12px; color: #64748b; margin-top: 20px;">এই ওটিপি কোডটির মেয়াদ মাত্র ৫ মিনিট থাকবে। কাউকে এই কোডটি শেয়ার করবেন না।</p>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`[OTP AUTH] Email dispatched successfully to ${normalizedEmail}`);
      } catch (emailError) {
        console.error('[OTP AUTH] Email delivery failed:', emailError);
      }
    } else {
      console.warn('[OTP AUTH] SMTP_USER or SMTP_PASS not set. Operating in console-only logging mode.');
    }

    return NextResponse.json({
      message: 'Verification code generated successfully',
      devCode: process.env.NODE_ENV !== 'production' ? code : undefined
    });

  } catch (error: any) {
    console.error('Send OTP error detailed:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: error.message || String(error),
      stack: error.stack
    }, { status: 500 });
  }
}
