import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config';

cloudinary.config({
  cloud_name: config.cloudinaryCloudName,
  api_key: config.cloudinaryApiKey,
  api_secret: config.cloudinaryApiSecret,
});

export { cloudinary };

/**
 * Upload Buffer to Cloudinary (used by multer memoryStorage)
 */
export const uploadBufferToCloudinary = (
  fileBuffer: Buffer,
  folder: string = 'charulata_uploads'
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error || !result) {
          console.error('[CLOUDINARY UPLOAD ERROR]', error);
          return reject(error || new Error('Cloudinary upload failed'));
        }
        resolve(result.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

/**
 * Upload Buffer to Cloudinary and return both secure_url and public_id
 */
export const uploadBufferToCloudinaryDetails = (
  fileBuffer: Buffer,
  folder: string = 'charulata_uploads'
): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error || !result) {
          console.error('[CLOUDINARY UPLOAD DETAILS ERROR]', error);
          return reject(error || new Error('Cloudinary upload failed'));
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );
    uploadStream.end(fileBuffer);
  });
};

/**
 * Upload base64 string or Data URI to Cloudinary if needed
 */
export const uploadBase64ToCloudinary = async (
  base64String: string,
  folder: string = 'charulata_uploads'
): Promise<string> => {
  if (!base64String || typeof base64String !== 'string' || !base64String.startsWith('data:image')) {
    return base64String;
  }

  try {
    const result = await cloudinary.uploader.upload(base64String, {
      folder,
      resource_type: 'auto',
    });
    return result.secure_url;
  } catch (error) {
    console.error('[CLOUDINARY BASE64 UPLOAD ERROR]', error);
    throw error;
  }
};

/**
 * Upload base64 string and return both secure_url and public_id
 */
export const uploadBase64ToCloudinaryDetails = async (
  base64String: string,
  folder: string = 'charulata_uploads'
): Promise<{ url: string; publicId: string }> => {
  if (!base64String || typeof base64String !== 'string' || !base64String.startsWith('data:image')) {
    return { url: base64String, publicId: '' };
  }

  try {
    const result = await cloudinary.uploader.upload(base64String, {
      folder,
      resource_type: 'auto',
    });
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('[CLOUDINARY BASE64 DETAILS UPLOAD ERROR]', error);
    throw error;
  }
};

/**
 * Delete image from Cloudinary by publicId
 */
export const deleteFromCloudinary = async (publicId: string): Promise<any> => {
  if (!publicId) return;
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('[CLOUDINARY DESTROY ERROR]', error);
  }
};

/**
 * Extract publicId from Cloudinary URL if not explicitly saved
 */
export const extractPublicIdFromUrl = (url: string): string | null => {
  if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) {
    return null;
  }
  try {
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;
    const afterUpload = parts[1];
    // Remove version tag (e.g. v123456789/)
    const withoutVersion = afterUpload.replace(/^v\d+\//, '');
    // Remove file extension
    const lastDotIndex = withoutVersion.lastIndexOf('.');
    if (lastDotIndex === -1) return withoutVersion;
    return withoutVersion.substring(0, lastDotIndex);
  } catch {
    return null;
  }
};
