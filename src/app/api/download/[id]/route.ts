import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Book from '@/models/Book';
import Order from '@/models/Order';
import User from '@/models/User';
import { generateSecureDownloadUrl, uploadSecuredWatermarkedPDF } from '@/lib/gcs';
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
    const email = req.headers.get('x-user-email') || ''; // Simulated authorization context header

    if (!email) {
      return NextResponse.json({ error: 'Unauthorized. Please login to download.' }, { status: 401 });
    }

    const MONGODB_URI = process.env.MONGODB_URI;

    // 3. Fallback check: Operates in Simulated Demo Mode if GCS credentials or MongoDB URI are missing
    if (!MONGODB_URI || !bucketName || !process.env.GCP_CLIENT_EMAIL) {
      console.warn('Operating in simulated GCS Download mode due to missing environment variables.');
      
      const mockBooks: Record<string, any> = {
        "60c72b2f9b1d8a23c4d5e6f1": {
          title: "Next.js 14 Premium Handbuch"
        },
        "60c72b2f9b1d8a23c4d5e6f2": {
          title: "The Zero-Timeout PDF Engine"
        },
        "60c72b2f9b1d8a23c4d5e6f6": {
          title: "টুনটুনির বই"
        },
        "60c72b2f9b1d8a23c4d5e6f7": {
          title: "আবোল তাবোল"
        },
        "60c72b2f9b1d8a23c4d5e6f8": {
          title: "ঠাকুরমার ঝুলি"
        },
        "60c72b2f9b1d8a23c4d5e6f9": {
          title: "হযবরল"
        }
      };

      const book = mockBooks[bookId] || { title: "Secured Premium Guide" };
      const txId = 'SIMULATED_DEMO_TXID';

      // Dynamically generate a simple mock PDF representing the downloaded product
      const destDoc = await PDFDocument.create();
      const page = destDoc.addPage([600, 800]);
      const helveticaFont = await destDoc.embedFont(StandardFonts.Helvetica);
      
      page.drawText(`SECURE DOWNLOADED COPY`, { x: 50, y: 700, size: 24, font: helveticaFont, color: rgb(0.1, 0.1, 0.3) });
      page.drawText(book.title, { x: 50, y: 650, size: 18, font: helveticaFont, color: rgb(0.3, 0.4, 0.9) });
      page.drawText(`Licensed exclusively to: ${email}`, { x: 50, y: 600, size: 12, font: helveticaFont });
      page.drawText(`Verified Transaction ID: ${txId}`, { x: 50, y: 570, size: 12, font: helveticaFont });
      
      const watermarkText = `Licensed to: ${email} | TxID: ${txId} | Secure PDF`;
      page.drawText(watermarkText, { x: 50, y: 50, size: 8, font: helveticaFont, color: rgb(0.6, 0.6, 0.6) });
      
      const finalBytes = await destDoc.save();
      return new NextResponse(Buffer.from(finalBytes), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="secure-${bookId}.pdf"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    // Connect to database if credentials are present
    await dbConnect();

    // 1. Verify User Authentication & Purchase Status
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'User account not found.' }, { status: 404 });
    }

    const isPurchased = user.purchasedBooks.includes(bookId as any) || user.role === 'admin';
    
    // Find the latest approved order to extract the TxID for watermark stamp
    const approvedOrder = await Order.findOne({
      userId: user._id,
      bookId,
      status: 'approved',
    }).sort({ createdAt: -1 });

    if (!isPurchased || (!approvedOrder && user.role !== 'admin')) {
      return NextResponse.json({ 
        error: 'Forbidden. You do not own this book or payment is still pending verification.' 
      }, { status: 403 });
    }

    const txId = approvedOrder ? approvedOrder.submittedTxID : 'MANUAL_ADMIN_OVERRIDE';

    // 2. Fetch original Book details
    const book = await Book.findById(bookId);
    if (!book) {
      return NextResponse.json({ error: 'Book metadata not found.' }, { status: 404 });
    }

    // 4. Download original PDF buffer from secure GCS bucket
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(book.filePath);
    const [exists] = await file.exists();
    
    if (!exists) {
      return NextResponse.json({ error: 'Original guide file not found in storage.' }, { status: 500 });
    }

    const [originalPdfBuffer] = await file.download();

    // 5. PDF Watermarking & Layer Flattening Compilation
    const pdfDoc = await PDFDocument.load(originalPdfBuffer);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const watermarkText = `Licensed to: ${email} | TxID: ${txId} | Anti-Piracy Flattened PDF`;
    const pages = pdfDoc.getPages();

    for (const page of pages) {
      const { width, height } = page.getSize();
      
      // Draw running footer watermark on every page
      page.drawText(watermarkText, {
        x: 30,
        y: 20,
        size: 9,
        font: helveticaFont,
        color: rgb(0.65, 0.65, 0.65),
      });

      // Draw diagonal translucent watermark across the center of every page
      page.drawText(watermarkText, {
        x: width / 2 - 160,
        y: height / 2 - 10,
        size: 13,
        font: helveticaFont,
        color: rgb(0.7, 0.7, 0.7),
        opacity: 0.15,
        rotate: degrees(45),
      });
    }

    // Flatten forms & lock layers permanently
    pdfDoc.getForm().flatten();
    const finalPdfBytes = await pdfDoc.save();
    const finalPdfBuffer = Buffer.from(finalPdfBytes);

    // 6. Check final compiled payload sizes (Vercel payload ceiling check)
    // If size exceeds 4MB, bypass Vercel limits by saving to GCS temp and redirecting!
    const fileSizeMB = finalPdfBuffer.length / (1024 * 1024);
    if (fileSizeMB > 4.0) {
      console.log(`Large PDF detected (${fileSizeMB.toFixed(2)} MB). Bypassing serverless buffer limits.`);
      
      const tempPath = `temp/secure-book-${bookId}-${txId}-${Date.now()}.pdf`;
      const secureSignedUrl = await uploadSecuredWatermarkedPDF(tempPath, finalPdfBuffer);
      
      // Perform direct HTTP 307 Temporary Redirect to GCS signed URL
      return NextResponse.redirect(secureSignedUrl, 307);
    }

    // Stream small/medium PDFs directly from Vercel edge response buffer
    return new NextResponse(finalPdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="secured-${book.title.replace(/\s+/g, '-')}.pdf"`,
        'Cache-Control': 'private, no-store, max-age=0',
      },
    });

  } catch (error: any) {
    console.error('Download compilation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
