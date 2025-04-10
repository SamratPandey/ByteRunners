const Course = require('../models/Course');


const getAllCourses = async (req, res) =>{
    try {
        const courses = await Course.find({});
        console.log(courses);
        if (!courses || courses.length === 0) {
            return res.status(404).json({ message: 'No courses found' });
        }
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}



module.exports = {
    getAllCourses
}

