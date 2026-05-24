import { Storage } from '@google-cloud/storage';

// Initialize GCS client using environment variables
// Ensure these variables are populated in your local .env.local file
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: {
    client_email: process.env.GCP_CLIENT_EMAIL,
    // Replace double escaped newlines to ensure proper private key loading
    private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

const bucketName = process.env.GCP_PRIVATE_BUCKET_NAME || '';

/**
 * Generates a high-security temporary signed URL for a private PDF.
 * The link is active for exactly 10 minutes, completely blocking public access.
 * 
 * @param filePath Path inside the private GCS bucket (e.g., "books/premium-book.pdf")
 * @returns Promise<string> Temporary HTTPS GCS Signed URL
 */
export async function generateSecureDownloadUrl(filePath: string): Promise<string> {
  if (!bucketName) {
    throw new Error('GCP_PRIVATE_BUCKET_NAME is not configured.');
  }

  const options = {
    version: 'v4' as const,
    action: 'read' as const,
    expires: Date.now() + 10 * 60 * 1000, // 10 minutes from now
  };

  const [url] = await storage
    .bucket(bucketName)
    .file(filePath)
    .getSignedUrl(options);

  return url;
}

/**
 * Bypasses Vercel's 4.5MB serverless response body size limit.
 * If the processed/watermarked PDF exceeds 4MB, the backend uploads it 
 * to a temporary folder in GCS and serves a Signed URL instead of direct streaming.
 * 
 * @param tempFileName Custom filename (e.g., "temp/watermarked-user-txid.pdf")
 * @param fileBuffer The actual watermarked PDF binary buffer
 * @returns Promise<string> Temporary HTTPS GCS Signed URL to download the file
 */
export async function uploadSecuredWatermarkedPDF(
  tempFileName: string,
  fileBuffer: Buffer
): Promise<string> {
  if (!bucketName) {
    throw new Error('GCP_PRIVATE_BUCKET_NAME is not configured.');
  }

  const bucket = storage.bucket(bucketName);
  const file = bucket.file(tempFileName);

  // Upload processed PDF buffer to a temporary space in the secure private bucket.
  // Note: GCS Lifecycle rules can be configured on the bucket to automatically
  // delete any object matching the 'temp/' prefix after 1 day to clean up space.
  await file.save(fileBuffer, {
    metadata: {
      contentType: 'application/pdf',
      cacheControl: 'private, max-age=0, no-transform',
    },
    resumable: false, // Fast, single-shot buffer upload
  });

  // Generate a secure signed URL for the user to download the file directly from GCS.
  // The user gets direct download capability while the serverless function remains lean.
  return generateSecureDownloadUrl(tempFileName);
}
