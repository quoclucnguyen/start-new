import Pica from 'pica';
import { getSupabaseClient } from './supabaseClient';

const pica = new Pica();

// Configuration
const MAX_IMAGE_SIZE = 800; // Max width/height in pixels
const JPEG_QUALITY = 0.8; // JPEG quality (0-1)
const STORAGE_BUCKET = 'food-images';

/**
 * Resize an image using pica library
 * Maintains aspect ratio while fitting within MAX_IMAGE_SIZE
 */
async function resizeImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = async () => {
      try {
        // Calculate new dimensions maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > MAX_IMAGE_SIZE || height > MAX_IMAGE_SIZE) {
          if (width > height) {
            height = Math.round((height * MAX_IMAGE_SIZE) / width);
            width = MAX_IMAGE_SIZE;
          } else {
            width = Math.round((width * MAX_IMAGE_SIZE) / height);
            height = MAX_IMAGE_SIZE;
          }
        }

        // Create source canvas
        const srcCanvas = document.createElement('canvas');
        srcCanvas.width = img.width;
        srcCanvas.height = img.height;
        const srcCtx = srcCanvas.getContext('2d');
        if (!srcCtx) {
          throw new Error('Failed to get canvas context');
        }
        srcCtx.drawImage(img, 0, 0);

        // Create destination canvas
        const destCanvas = document.createElement('canvas');
        destCanvas.width = width;
        destCanvas.height = height;

        // Resize using pica
        await pica.resize(srcCanvas, destCanvas, {
          quality: 3, // 0-3, higher is better quality but slower
        });

        // Convert to blob
        const blob = await pica.toBlob(destCanvas, 'image/jpeg', JPEG_QUALITY);
        
        // Revoke object URL to free memory
        URL.revokeObjectURL(img.src);
        
        resolve(blob);
      } catch (error) {
        URL.revokeObjectURL(img.src);
        reject(error);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Generate a unique filename for the uploaded image
 */
function generateFileName(userId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${userId}/${timestamp}-${random}.jpg`;
}

export interface UploadImageResult {
  url: string;
  path: string;
}

/**
 * Upload an image to Supabase Storage
 * - Resizes the image to MAX_IMAGE_SIZE using pica
 * - Converts to JPEG format
 * - Uploads to the food-images bucket
 */
export async function uploadFoodImage(
  file: File,
  userId: string
): Promise<UploadImageResult> {
  const supabase = getSupabaseClient();

  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  // Resize image
  const resizedBlob = await resizeImage(file);

  // Generate unique filename
  const filePath = generateFileName(userId);

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, resizedBlob, {
      contentType: 'image/jpeg',
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    console.error('Upload error:', uploadError);
    throw new Error(`Failed to upload image: ${uploadError.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath);

  return {
    url: urlData.publicUrl,
    path: filePath,
  };
}

/**
 * Delete an image from Supabase Storage
 */
export async function deleteFoodImage(filePath: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([filePath]);

  if (error) {
    console.error('Delete error:', error);
    throw new Error(`Failed to delete image: ${error.message}`);
  }
}

/**
 * Extract file path from Supabase public URL
 */
export function getFilePathFromUrl(url: string): string | null {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const bucketPath = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
    const urlObj = new URL(url);
    
    if (urlObj.origin === supabaseUrl && urlObj.pathname.includes(bucketPath)) {
      return urlObj.pathname.split(bucketPath)[1];
    }
    return null;
  } catch {
    return null;
  }
}
