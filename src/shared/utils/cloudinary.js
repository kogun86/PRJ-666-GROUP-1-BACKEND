import { v2 as cloudinary } from 'cloudinary';
import config from '../../../src/config.js';
import logger from './logger.js';

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.CLOUDINARY.CLOUD_NAME,
  api_key: config.CLOUDINARY.API_KEY,
  api_secret: config.CLOUDINARY.API_SECRET,
  secure: true,
});

/**
 * Generate Cloudinary signature for client-side upload
 * @param {Object} params - Parameters to sign
 * @returns {string} - Signature
 */
export function generateSignature(params = {}) {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);

    // Create the parameters to sign
    const signParams = {
      timestamp,
      ...params,
    };

    // Generate the signature
    const signature = cloudinary.utils.api_sign_request(signParams, config.CLOUDINARY.API_SECRET);

    logger.debug('Generated Cloudinary signature');

    return {
      signature,
      timestamp,
    };
  } catch (error) {
    logger.error({ error }, 'Error generating Cloudinary signature');
    throw error;
  }
}

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - The public ID of the image to delete
 * @returns {Promise} - Cloudinary API response
 */
export async function deleteImage(publicId) {
  try {
    if (!publicId) {
      logger.warn('No public ID provided for image deletion');
      return null;
    }

    const result = await cloudinary.uploader.destroy(publicId);
    logger.info({ result }, `Deleted image with publicId: ${publicId}`);

    return result;
  } catch (error) {
    logger.error({ error }, `Error deleting image with publicId: ${publicId}`);
    throw error;
  }
}

/**
 * Extract the public ID from a Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string|null} - Public ID or null if not found
 */
export function getPublicIdFromUrl(url) {
  if (!url || typeof url !== 'string') {
    return null;
  }

  try {
    // Match the public ID pattern in Cloudinary URLs
    // Example URL: https://res.cloudinary.com/cloud-name/image/upload/v1234567890/folder/image.jpg
    const match = url.match(/\/v\d+\/(.+?)\.\w+$/);

    if (match && match[1]) {
      return match[1];
    }

    return null;
  } catch (error) {
    logger.error({ error }, 'Error extracting public ID from Cloudinary URL');
    return null;
  }
}

export default {
  generateSignature,
  deleteImage,
  getPublicIdFromUrl,
};
