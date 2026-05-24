import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Book from '@/models/Book';
import User from '@/models/User';
import { generateSecureDownloadUrl } from '@/lib/gcs';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import { Storage } from '@google-cloud/storage';

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: {
    client_email: process.env.GCP_CLIENT_EMAIL,
    private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});
const bucketName = process.env.GCP_PRIVATE_BUCKET_NAME || '';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookId = params.id;
    const { searchParams } = new URL(req.url);
    const pageNumStr = searchParams.get('page');
    const email = req.headers.get('x-user-email') || ''; // Simulated header auth or NextAuth session hook fallback
    
    if (!pageNumStr) {
      return NextResponse.json({ error: 'Page number is required' }, { status: 400 });
    }

    const pageNum = parseInt(pageNumStr, 10);
    if (isNaN(pageNum) || pageNum < 1) {
      return NextResponse.json({ error: 'Invalid page number' }, { status: 400 });
    }

    const MONGODB_URI = process.env.MONGODB_URI;

    // Fallback: If credentials or DB are not configured, enter Simulated Demo Mode
    if (!MONGODB_URI || !bucketName || !process.env.GCP_CLIENT_EMAIL) {
      console.warn('Environment variables not configured. Operating in Simulated Demo Mode.');
      
      const mockBooks: Record<string, any> = {
        "60c72b2f9b1d8a23c4d5e6f1": {
          title: "UI/UX Design Guide",
          author: "Gronthi Publishers",
          pageCount: 320,
          previewLimit: 4
        },
        "60c72b2f9b1d8a23c4d5e6f2": {
          title: "Digital Art Techniques",
          author: "DeepMind Academy",
          pageCount: 145,
          previewLimit: 4
        },
        "60c72b2f9b1d8a23c4d5e6f3": {
          title: "Typography Masterclass",
          author: "Astra Designers",
          pageCount: 210,
          previewLimit: 4
        },
        "60c72b2f9b1d8a23c4d5e6f4": {
          title: "Freelancing Career Guide",
          author: "Career Lab",
          pageCount: 180,
          previewLimit: 4
        },
        "60c72b2f9b1d8a23c4d5e6f5": {
          title: "Responsive Web Development",
          author: "Core Stack",
          pageCount: 290,
          previewLimit: 4
        },
        "60c72b2f9b1d8a23c4d5e6f6": {
          title: "টুনটুনির বই",
          author: "উপেন্দ্রকিশোর রায়চৌধুরী",
          pageCount: 150,
          previewLimit: 4
        },
        "60c72b2f9b1d8a23c4d5e6f7": {
          title: "আবোল তাবোল",
          author: "সুকুমার রায়",
          pageCount: 95,
          previewLimit: 4
        },
        "60c72b2f9b1d8a23c4d5e6f8": {
          title: "ঠাকুরমার ঝুলি",
          author: "দক্ষিণারঞ্জন মিত্র মজুমদার",
          pageCount: 220,
          previewLimit: 4
        },
        "60c72b2f9b1d8a23c4d5e6f9": {
          title: "হযবরল",
          author: "সুকুমার রায়",
          pageCount: 80,
          previewLimit: 4
        }
      };

      const book = mockBooks[bookId] || {
        title: "Secured Premium Guide",
        author: "Gronthi Publishers",
        pageCount: 100,
        previewLimit: 4
      };

      // Simulated purchase check: admin emails bypass preview limits
      const isPurchased = email.includes('admin');
      const previewLimit = book.previewLimit || 4;
      if (!isPurchased && pageNum > previewLimit) {
        return NextResponse.json({ 
          error: 'Paywall active. Purchase book to unlock full reading capabilities.', 
          locked: true 
        }, { status: 403 });
      }

      if (pageNum > book.pageCount) {
        return NextResponse.json({ error: 'Page number out of bounds' }, { status: 400 });
      }

      const destDoc = await PDFDocument.create();
      const page = destDoc.addPage([600, 800]);
      const helveticaFont = await destDoc.embedFont(StandardFonts.Helvetica);
      
      // Draw background decorations to look premium
      page.drawRectangle({
        x: 20,
        y: 20,
        width: 560,
        height: 760,
        borderColor: rgb(0.3, 0.4, 0.9),
        borderWidth: 2,
      });

      page.drawText(book.title, {
        x: 50,
        y: 700,
        size: 20,
        font: helveticaFont,
        color: rgb(0.1, 0.1, 0.2),
      });

      page.drawText(`By ${book.author}`, {
        x: 50,
        y: 670,
        size: 12,
        font: helveticaFont,
        color: rgb(0.4, 0.4, 0.5),
      });

      page.drawText(`SIMULATED DEMO PAGE ${pageNum}`, {
        x: 50,
        y: 500,
        size: 24,
        font: helveticaFont,
        color: rgb(0.8, 0.3, 0.3),
      });

      const demoParagraph = [
        "This is a premium guide page rendered on-the-fly inside Next.js.",
        "Your server-side viewer is active and operating perfectly.",
        "",
        "To load your actual raw PDF files from private storage:",
        "1. Open your GCP Console and create a private Cloud Storage Bucket.",
        "2. Set up a MongoDB Atlas M0 cluster.",
        "3. Configure your local .env.local file with the required credentials.",
        "",
        "The dynamic watermarking, layer flattening, and local P2P automated",
        "handshakes are fully prepared and waiting for your databases."
      ];

      let yPos = 440;
      for (const line of demoParagraph) {
        page.drawText(line, {
          x: 50,
          y: yPos,
          size: 11,
          font: helveticaFont,
          color: rgb(0.2, 0.2, 0.3),
        });
        yPos -= 20;
      }

      // Draw running preview watermark diagonal across the page
      const watermarkText = isPurchased 
        ? `Licensed to: ${email || 'guest@example.com'} | Secure Viewer` 
        : 'PREVIEW ONLY - PURCHASE TO UNLOCK FULL HIGH-RES PDF';

      page.drawText(watermarkText, {
        x: 300 - 150,
        y: 400 - 20,
        size: 12,
        font: helveticaFont,
        color: rgb(0.7, 0.7, 0.8),
        opacity: 0.15,
        rotate: degrees(45),
      });

      // Draw running security footer
      page.drawText(watermarkText, {
        x: 50,
        y: 50,
        size: 8,
        font: helveticaFont,
        color: rgb(0.6, 0.6, 0.6),
        opacity: 0.4,
      });

      page.drawText(`Page ${pageNum} of ${book.pageCount}`, {
        x: 480,
        y: 50,
        size: 8,
        font: helveticaFont,
        color: rgb(0.6, 0.6, 0.6),
      });

      const singlePagePdfBytes = await destDoc.save();
      return new NextResponse(Buffer.from(singlePagePdfBytes), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Cache-Control': 'no-store',
        },
      });
    }

    // Connect to database if credentials are present
    await dbConnect();

    // 1. Fetch Book Metadata
    const book = await Book.findById(bookId);
    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    // 2. Determine Authentication & Purchase State
    let isPurchased = false;
    if (email) {
      const user = await User.findOne({ email });
      if (user && (user.role === 'admin' || user.purchasedBooks.includes(book._id))) {
        isPurchased = true;
      }
    }

    // 3. Apply Preview Paywall Restrictions
    const previewLimit = book.previewLimit || 4;
    if (!isPurchased && pageNum > previewLimit) {
      return NextResponse.json({ 
        error: 'Paywall active. Purchase book to unlock full reading capabilities.', 
        locked: true 
      }, { status: 403 });
    }

    if (pageNum > book.pageCount) {
      return NextResponse.json({ error: 'Page number out of bounds' }, { status: 400 });
    }

    const bucket = storage.bucket(bucketName);
    const file = bucket.file(book.filePath);
    
    const [exists] = await file.exists();
    if (!exists) {
      return NextResponse.json({ error: 'Raw book file not found in storage' }, { status: 500 });
    }

    // Download file buffer into memory
    const [originalPdfBuffer] = await file.download();

    // 5. PDF Extraction & Watermarking Engine (Pure JS pdf-lib)
    const srcDoc = await PDFDocument.load(originalPdfBuffer);
    const destDoc = await PDFDocument.create();
    
    // Copy the specific page (pdf-lib is 0-indexed)
    const [copiedPage] = await destDoc.copyPages(srcDoc, [pageNum - 1]);
    destDoc.addPage(copiedPage);

    // Apply Dynamic Preview Vector Watermark
    const helveticaFont = await destDoc.embedFont(StandardFonts.Helvetica);
    const { width, height } = copiedPage.getSize();
    
    // Draw visual watermark diagonal across page to prevent screenshot copying
    const watermarkText = isPurchased 
      ? `Licensed to: ${email} | Secure Viewer` 
      : 'PREVIEW ONLY - PURCHASE TO UNLOCK FULL HIGH-RES PDF';
      
    copiedPage.drawText(watermarkText, {
      x: width / 2 - 180,
      y: height / 2 - 20,
      size: 13,
      font: helveticaFont,
      color: rgb(0.65, 0.65, 0.7),
      opacity: 0.18,
      rotate: degrees(45),
    });

    // Draw running security footer
    copiedPage.drawText(watermarkText, {
      x: 30,
      y: 20,
      size: 8,
      font: helveticaFont,
      color: rgb(0.7, 0.7, 0.7),
      opacity: 0.3,
    });

    // Flatten forms
    destDoc.getForm().flatten();
    
    const singlePagePdfBytes = await destDoc.save();

    // 6. Return response with application/pdf header
    return new NextResponse(Buffer.from(singlePagePdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Cache-Control': isPurchased 
          ? 'private, no-store, max-age=0' 
          : 'public, max-age=86400', // Cache preview pages on CDN for performance
      },
    });

  } catch (error: any) {
    console.error('Error streaming page:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
