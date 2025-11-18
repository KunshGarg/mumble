import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize S3 client for Cloudflare R2
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

/**
 * Upload a file to Cloudflare R2
 * @param file - The file buffer to upload
 * @param fileName - The name to save the file as
 * @param contentType - The MIME type of the file
 * @returns The public URL of the uploaded file
 */
export async function uploadToR2(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  const bucketName = process.env.R2_BUCKET_NAME || "dejavu";

  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: file,
      ContentType: contentType,
    });

    await r2Client.send(command);

    // Return the public URL
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;
    return publicUrl;
  } catch (error: any) {
    console.error("Error uploading to R2:", error);
    throw error;
  }
}

/**
 * Delete a file from Cloudflare R2
 * @param fileName - The name of the file to delete
 */
export async function deleteFromR2(fileName: string): Promise<void> {
  const bucketName = process.env.R2_BUCKET_NAME || "dejavu";

  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: fileName,
    });

    await r2Client.send(command);
  } catch (error) {
    console.error("Error deleting from R2:", error);
    throw new Error("Failed to delete file from R2");
  }
}

/**
 * Extract filename from R2 URL
 * @param url - The R2 public URL
 * @returns The filename
 */
export function getFileNameFromUrl(url: string): string {
  const parts = url.split("/");
  return parts[parts.length - 1];
}

/**
 * Generate a presigned URL for uploading to R2
 * @param fileName - The name to save the file as
 * @param contentType - The MIME type of the file
 * @param expiresIn - URL expiration time in seconds (default: 300 = 5 minutes)
 * @returns Object containing presigned URL and public URL
 */
export async function generatePresignedUploadUrl(
  fileName: string,
  contentType: string,
  expiresIn: number = 300
): Promise<{ presignedUrl: string; publicUrl: string }> {
  const bucketName = process.env.R2_BUCKET_NAME || "dejavu";

  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(r2Client, command, { expiresIn });
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;

    return { presignedUrl, publicUrl };
  } catch (error: any) {
    console.error("Error generating presigned URL:", error);
    throw new Error("Failed to generate presigned URL");
  }
}

/**
 * Get public URL for a file in R2
 * @param fileName - The filename in R2
 * @returns The public URL
 */
export function getPublicUrl(fileName: string): string {
  return `${process.env.R2_PUBLIC_URL}/${fileName}`;
}
