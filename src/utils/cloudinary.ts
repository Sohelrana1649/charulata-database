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
export const uploadBufferToCloudinary = (fileBuffer: Buffer, folder: string = 'charulata_uploads'): Promise<string> => {
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
 * Upload base64 string or Data URI to Cloudinary if needed
 */
export const uploadBase64ToCloudinary = async (base64String: string, folder: string = 'charulata_uploads'): Promise<string> => {
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
