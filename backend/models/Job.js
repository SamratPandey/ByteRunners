const mongoose = require('mongoose');
const { Schema } = mongoose;

const jobSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    salary: { type: Number, required: true },
    type: { 
        type: String, 
        enum: ['full-time', 'part-time', 'contract', 'internship', 'remote'], 
        default: 'full-time' 
    },
    skills: [{ type: String }],
    requirements: [{ type: String }],
    benefits: [{ type: String }],
    experience: { type: String, default: 'Entry Level' },
    salaryRange: {
        min: { type: Number },
        max: { type: Number }
    },
    applicationDeadline: { type: Date },
    isActive: { type: Boolean, default: true },
    postedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Admin',
        required: false 
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const Job = mongoose.model('Job', jobSchema);
module.exports = Job;