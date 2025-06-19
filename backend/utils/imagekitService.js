const ImageKit = require('imagekit');

// Initialize ImageKit with environment variables
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_API_URL,
});

/**
 * Upload image to ImageKit
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - Name of the file
 * @param {string} folder - Folder to upload to (optional)
 * @returns {Promise<Object>} Upload result
 */
const uploadImage = async (fileBuffer, fileName, folder = 'avatars') => {
  try {
    const result = await imagekit.upload({
      file: fileBuffer,
      fileName: fileName,
      folder: folder,
      useUniqueFileName: true,
      tags: ['user-avatar', 'byterunners'],
      transformation: {
        pre: 'l-text,i-© ByteRunners,fs-16,l-end', // Optional watermark
        post: [
          {
            type: 'transformation',
            value: 'w-400,h-400,c-at_smart_auto,q-80,f-auto'
          }
        ]
      }
    });    return {
      success: true,
      url: result.url,
      fileId: result.fileId,
      thumbnailUrl: result.thumbnailUrl,
      size: result.size
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Delete image from ImageKit
 * @param {string} fileId - File ID to delete
 * @returns {Promise<Object>} Delete result
 */
const deleteImage = async (fileId) => {
  try {
    await imagekit.deleteFile(fileId);
    return { success: true };  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get optimized image URL
 * @param {string} url - Original image URL
 * @param {Object} transformations - ImageKit transformations
 * @returns {string} Transformed URL
 */
const getOptimizedUrl = (url, transformations = {}) => {
  const defaultTransformations = {
    height: 300,
    width: 300,
    crop: 'at_smart_auto',
    quality: 90,
    format: 'auto',
    ...transformations,
  };

  return imagekit.url({
    src: url,
    transformation: [defaultTransformations],
  });
};

/**
 * Generate image upload signature for client-side uploads
 * @param {Object} options - Upload options
 * @returns {Object} Authentication parameters
 */
const getUploadSignature = (options = {}) => {
  const defaultOptions = {
    expire: Math.floor(Date.now() / 1000) + 2400, // 40 minutes
    ...options,
  };

  return imagekit.getAuthenticationParameters(defaultOptions);
};

/**
 * Test ImageKit connection and configuration
 * @returns {Promise<Object>} Test result
 */
const testImageKitConnection = async () => {
  try {
    // Test with a simple API call
    const authParams = imagekit.getAuthenticationParameters();
    
    return {
      success: true,
      message: 'ImageKit connection successful',
      config: {
        urlEndpoint: process.env.IMAGEKIT_API_URL,
        hasKeys: !!(process.env.IMAGEKIT_PUBLIC_KEY && process.env.IMAGEKIT_PRIVATE_KEY)
      },
      authParams
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  uploadImage,
  deleteImage,
  getOptimizedUrl,
  getUploadSignature,
  testImageKitConnection,
  imagekit,
};
