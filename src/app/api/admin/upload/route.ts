import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import dbConnect from '@/lib/db';
import User from '@/models/User';

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

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'pdf' | 'cover'

    if (!file || !type) {
      return NextResponse.json({ error: 'Missing file or type parameter.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Dynamic destination
    const subFolder = type === 'pdf' ? 'books' : 'covers';
    const uploadDir = join(process.cwd(), 'public', subFolder);

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Sanitize filename to prevent path traversal or spacing issues
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFileName = `${Date.now()}-${sanitizedName}`;
    const filePath = join(uploadDir, uniqueFileName);

    await writeFile(filePath, buffer);

    const relativeUrl = `/${subFolder}/${uniqueFileName}`;
    return NextResponse.json({ url: relativeUrl, message: 'File uploaded successfully' }, { status: 200 });

  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
