import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import VerificationCode from '@/models/VerificationCode';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

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

    // Print to server terminal/logs in all environments so developer/tester can access it instantly!
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
          from: `"গ্রন্থী (Gronthi)" <${smtpUser}>`,
          to: normalizedEmail,
          subject: 'গ্রন্থী সাইন-ইন ভেরিফিকেশন কোড',
          html: `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 500px; margin: auto; padding: 30px; border: 1px solid #eee; border-radius: 20px; background-color: #3b2a60; color: #ffffff; text-align: center;">
              <h2 style="color: #d3c5f6; font-size: 24px; margin-bottom: 20px; font-weight: 800;">গ্রন্থী (Gronthi)</h2>
              <p style="font-size: 15px; color: #e2e8f0; line-height: 1.6;">আপনার অ্যাকাউন্টটি সুরক্ষিতভাবে লগইন বা সাইন-আপ করতে নিচের ভেরিফিকেশন কোডটি ব্যবহার করুন:</p>
              <div style="background-color: #d3c5f6; color: #3b2a60; font-size: 32px; font-weight: 900; letter-spacing: 6px; padding: 15px 30px; border-radius: 12px; display: inline-block; margin: 25px 0;">${code}</div>
              <p style="font-size: 12px; color: #a0aec0; margin-top: 20px;">এই ওটিপি কোডটির মেয়াদ মাত্র ৫ মিনিট থাকবে। কাউকে এই কোডটি শেয়ার করবেন না।</p>
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
      // Include the code in response in non-production environments to enhance DX
      devCode: process.env.NODE_ENV !== 'production' ? code : undefined
    });

  } catch (error: any) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
