const Job = require('../models/Job');

const getAllJobs = async(req, res) =>{
    try {
        const jobs = await Job.find();
        if (!jobs || jobs.length === 0) {
            return res.status(404).json({ message: 'No jobs found' });
        }
        res.status(200).json({
            message: 'Jobs fetched successfully',
            jobs: jobs
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}

const getJobById = async(req, res) =>{
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: 'Job ID is required' });
    }
    try {
        const job = await Job.findById(id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.status(200).json(job);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

const createJob = async(req, res) =>{
    const { title, description, company, location, salary } = req.body;
    if (!title || !description || !company || !location || !salary) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    try {
        const newJob = new Job({
            title,
            description,
            company,
            location,
            salary,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        await newJob.save();
        res.status(201).json({
            message: 'Job created successfully',
            job: newJob
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}

const updateJob = async(req, res) =>{
    const { id } = req.params;
    const { title, description, company, location, salary } = req.body;
    if (!id) {
        return res.status(400).json({ message: 'Job ID is required' });
    }
    if (!title || !description || !company || !location || !salary) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    try {
        const job = await Job.findById(id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        job.title = title;
        job.description = description;
        job.company = company;
        job.location = location;
        job.salary = salary;
        job.updatedAt = new Date();
        await job.save();
        res.status(200).json({
            message: 'Job updated successfully',
            job: job
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

const deleteJob = async(req, res) =>{
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: 'Job ID is required' });
    }
    try {
        const job = await Job.findById(id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        await job.remove();
        res.status(200).json({
            message: 'Job deleted successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = {
    getAllJobs,
    getJobById,
    createJob,
    updateJob,
    deleteJob 
}