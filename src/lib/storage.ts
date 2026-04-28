// Google Cloud Storage integration
import { Storage } from '@google-cloud/storage';

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID || 'bun-bo-hue-app',
});

const BUCKET_NAME = process.env.GCS_BUCKET_NAME || 'bun-bo-hue-storage';
const bucket = storage.bucket(BUCKET_NAME);

export interface UploadOptions {
  folder?: string;
  isPublic?: boolean;
}

/**
 * Upload file to Cloud Storage
 */
export async function uploadFile(
  fileBuffer: Buffer,
  fileName: string,
  options: UploadOptions = {}
) {
  try {
    const { folder = 'uploads', isPublic = true } = options;
    const filePath = `${folder}/${Date.now()}-${fileName}`;
    
    const file = bucket.file(filePath);

    await file.save(fileBuffer, {
      metadata: {
        contentType: getMimeType(fileName),
      },
    });

    // Make public if needed
    if (isPublic) {
      await file.makePublic();
    }

    // Return public URL
    return `https://storage.googleapis.com/${BUCKET_NAME}/${filePath}`;
  } catch (error: any) {
    console.error('GCS Upload Error:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
}

/**
 * Download file from Cloud Storage
 */
export async function downloadFile(filePath: string): Promise<Buffer> {
  try {
    const file = bucket.file(filePath);
    const [contents] = await file.download();
    return contents;
  } catch (error: any) {
    console.error('GCS Download Error:', error);
    throw new Error(`Failed to download file: ${error.message}`);
  }
}

/**
 * Delete file from Cloud Storage
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    const file = bucket.file(filePath);
    await file.delete();
  } catch (error: any) {
    console.error('GCS Delete Error:', error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

/**
 * List files in folder
 */
export async function listFiles(folder: string): Promise<string[]> {
  try {
    const [files] = await bucket.getFiles({ prefix: `${folder}/` });
    return files.map(f => f.name);
  } catch (error: any) {
    console.error('GCS List Error:', error);
    throw new Error(`Failed to list files: ${error.message}`);
  }
}

/**
 * Get public URL for file
 */
export function getPublicUrl(filePath: string): string {
  return `https://storage.googleapis.com/${BUCKET_NAME}/${filePath}`;
}

/**
 * Helper: Get MIME type
 */
function getMimeType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    pdf: 'application/pdf',
    txt: 'text/plain',
    json: 'application/json',
  };
  return mimeTypes[ext || ''] || 'application/octet-stream';
}
