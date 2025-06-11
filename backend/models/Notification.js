const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  type: {
    type: String,
    required: true,
    enum: [
      'achievement',    // Problem solved, level up, etc.
      'course',         // Course enrollment, completion
      'contest',        // Contest reminders, results
      'job',           // Job applications, new postings
      'profile',       // Profile updates, verification
      'system',        // System announcements
      'social',        // Comments, likes, follows
      'payment',       // Payment confirmations, subscription
      'security'       // Login alerts, password changes
    ],
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: {
    type: Date,
    default: null
  },
  // For notifications with actions (e.g., "View Course", "Accept Challenge")
  actionUrl: {
    type: String,
    default: null
  },
  actionText: {
    type: String,
    default: null
  },
  // Metadata for different notification types
  metadata: {
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    contestId: { type: String },
    achievementType: { type: String },
    points: { type: Number },
    level: { type: Number }
  },  // For batch notifications
  batchId: {
    type: String,
    default: null
  },
  // Auto-expire notifications after certain time
  expiresAt: {
    type: Date,
    default: null,
    index: { expireAfterSeconds: 0 }
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Indexes for better query performance
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ batchId: 1 });

// Virtual for formatted time
notificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const created = this.createdAt;
  const diffMs = now - created;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return created.toLocaleDateString();
});

// Static methods for common notification operations
notificationSchema.statics.createForUser = async function(userId, notificationData) {
  return await this.create({
    userId,
    ...notificationData
  });
};

notificationSchema.statics.markAsRead = async function(userId, notificationId) {
  return await this.findOneAndUpdate(
    { _id: notificationId, userId },
    { 
      read: true, 
      readAt: new Date() 
    },
    { new: true }
  );
};

notificationSchema.statics.markAllAsRead = async function(userId) {
  return await this.updateMany(
    { userId, read: false },
    { 
      read: true, 
      readAt: new Date() 
    }
  );
};

notificationSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({ userId, read: false });
};

notificationSchema.statics.getUserNotifications = async function(userId, options = {}) {
  const {
    page = 1,
    limit = 20,
    type = null,
    unreadOnly = false
  } = options;

  const query = { userId };
  if (type) query.type = type;
  if (unreadOnly) query.read = false;

  return await this.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('metadata.problemId', 'title difficulty')
    .populate('metadata.courseId', 'title')
    .populate('metadata.jobId', 'title company');
};

// Instance methods
notificationSchema.methods.markAsRead = async function() {
  this.read = true;
  this.readAt = new Date();
  return await this.save();
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
