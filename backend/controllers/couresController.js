const Course = require('../models/Course');


const getCourses = async (req,res) =>{
    try {
        const courses =  await Course.find();
        if(!courses){
            res.status(500).json({ message: "Error while fetching courses" });
        }else{
            res.status(200).json({
                message: "Courses fetched successfully",
                courses: courses
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

}

const getCourseById = async (req,res) =>{
    const { id } = req.params;
    try {
        const course =  await Course.findById(id);
        if(!course){
            res.status(500).json({ message: "Error while fetching course" });
        }else{
            res.status(200).json({
                message: "Course fetched successfully",
                course: course
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


module.exports = {
    getCourses,
    getCourseById
}

