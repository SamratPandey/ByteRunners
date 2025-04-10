const Course = require('../models/Course');


const getAllCourses = async (req, res) =>{
    try {
        const courses = await Course.find({}).populate('enrollments.user', 'name email avatar'); // Populate user details in enrollments
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}



module.exports = {
    getAllCourses
}

