const User = require('../models/User');
const Activity = require('../models/Activity');
const { uploadImage, deleteImage } = require('../utils/imagekitService');

// Update user profile details
exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = ['name', 'bio', 'location', 'phone', 'preferredLanguages', 'socialLinks'];
    const filteredBody = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredBody[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      filteredBody,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Log the activity
    const activity = new Activity({
      type: 'Profile Update',
      description: `User ${user.name} updated their profile.`,
    });
    await activity.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Update user avatar - ImageKit only
exports.updateAvatar = async (req, res) => {
  try {
    console.log('🖼️ Avatar upload started - ImageKit only');
    
    if (!req.file) {
      console.log('❌ No file provided');
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    if (!req.file.buffer) {
      console.log('❌ No file buffer (multer should use memory storage)');
      return res.status(400).json({
        success: false,
        message: 'File upload error - no buffer'
      });
    }

    console.log('📁 File received:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      bufferLength: req.file.buffer.length
    });

    // Get current user to manage existing avatar
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate unique filename for ImageKit
    const fileName = `avatar_${req.user.id}_${Date.now()}_${req.file.originalname}`;
    
    console.log('☁️ Uploading to ImageKit...', fileName);
    
    // Upload to ImageKit (cloud storage only)
    const uploadResult = await uploadImage(
      req.file.buffer, 
      fileName,
      'avatars'
    );

    console.log('📤 ImageKit upload result:', {
      success: uploadResult.success,
      url: uploadResult.success ? uploadResult.url : null,
      error: uploadResult.error || null
    });

    if (!uploadResult.success) {
      console.log('❌ ImageKit upload failed:', uploadResult.error);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload image to cloud storage',
        error: uploadResult.error
      });
    }

    // Delete old avatar from ImageKit if exists
    if (currentUser.avatarFileId) {
      console.log('🗑️ Deleting old avatar from ImageKit:', currentUser.avatarFileId);
      const deleteResult = await deleteImage(currentUser.avatarFileId);
      console.log('🗑️ Old avatar deletion result:', deleteResult);
    }

    // Update user with new ImageKit URL and file ID
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        avatar: uploadResult.url,
        avatarFileId: uploadResult.fileId
      },
      { new: true }
    ).select('-password -resetPasswordToken -emailVerificationToken');

    console.log('✅ User updated with new avatar URL:', uploadResult.url);

    // Log activity
    const activity = new Activity({
      type: 'Avatar Update',
      description: `User ${user.name} updated their profile picture via ImageKit.`,
    });
    await activity.save();

    res.json({
      success: true,
      message: 'Avatar updated successfully using ImageKit',
      data: {
        avatar: user.avatar,
        fileId: user.avatarFileId
      }
    });

  } catch (error) {
    console.error('❌ Avatar update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating avatar',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
};
