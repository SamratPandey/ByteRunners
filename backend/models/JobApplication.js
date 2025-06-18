const mongoose = require('mongoose');
const { Schema } = mongoose;

const jobApplicationSchema = new Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    jobId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Job', 
        required: true 
    },
    appliedAt: { 
        type: Date, 
        default: Date.now 
    },
    status: { 
        type: String, 
        enum: ['pending', 'reviewed', 'accepted', 'rejected'], 
        default: 'pending' 
    },
    coverLetter: {
        type: String,
        default: ''
    },
    resume: {
        type: String, // URL or file path
        default: ''
    },
    additionalNotes: {
        type: String,
        default: ''
    }
});

// Ensure a user can only apply once per job
jobApplicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);
module.exports = JobApplication;
