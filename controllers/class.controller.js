const asyncHandler = require("express-async-handler");
const Class = require("../models/class.model");
const User = require("../models/user.model");

const createClass = asyncHandler(async (req, res) => {
    const { name, incharge, type } = req.body;
    try {
        const userId = req.user.id;
        const user = await User.find({_id:userId,user_type:"Admin"});
        if(!user){
            return res.status(400).json({ status: false, message: "Only Admin can create a class." });  
        }

        // Validate incharge (must be a valid teacher)
        const teacher = await User.find({_id:incharge,user_type:"Teacher"});
        if (!teacher) {
            return res.status(400).json({ status: false, message: "Incharge must be a valid teacher." });
        }

        // Create the new class
        const newClass = await Class.create({ name, incharge, type });
        res.status(201).json({ status: true, message: "Class created successfully!", class: newClass });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message });
    }
});

const getAllClasses = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.find({_id:userId,user_type:"Admin"});
        if(!user){
            return res.status(400).json({ status: false, message: "Only Admin can access class." });  
        }
        const classes = await Class.find().populate("incharge", "name email");
        res.status(200).json({ status: true, message: "Classes retrieved successfully!", classes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
});

const getClassById = asyncHandler(async (req, res) => {
    const { classId } = req.params;
    try {
        const userId = req.user.id;
        const user = await User.find({_id:userId,user_type:"Admin"});
        if(!user){
            return res.status(400).json({ status: false, message: "Only Admin can access classes." });  
        }
        // Fetch the class by ID and populate incharge details
        const singleClass = await Class.findById(classId).populate("incharge", "name email");
        if (!singleClass) {
            return res.status(404).json({ status: false, message: "Class not found." });
        }

        res.status(200).json({ status: true, message: "Class retrieved successfully!", class: singleClass });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
});

const updateClass = asyncHandler(async (req, res) => {
    const { classId } = req.params;
    const { name, incharge, type } = req.body;
    try {
        const userId = req.user.id;
        const user = await User.find({_id:userId,user_type:"Admin"});
        if(!user){
            return res.status(400).json({ status: false, message: "Only Admin can access classes." });  
        }

        // Validate incharge if provided
        if (incharge) {
            const teacher = await User.find({_id:incharge,user_type:"Teacher"});
            if (!teacher) {
                return res.status(400).json({ status: false, message: "Incharge must be a valid teacher." });
            }
        }

        // Build the update fields
        const updateFields = {};
        if (name) updateFields.name = name;
        if (incharge) updateFields.incharge = incharge;
        if (type) updateFields.type = type;

        // Update the class
        const updatedClass = await Class.findByIdAndUpdate(
            classId,
            updateFields,
            { new: true, runValidators: true }
        ).populate("incharge", "name email");

        if (!updatedClass) {
            return res.status(404).json({ status: false, message: "Class not found." });
        }

        res.status(200).json({ status: true, message: "Class updated successfully!", class: updatedClass });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message });
    }
});


const deleteClass = asyncHandler(async (req, res) => {
    const { classId } = req.params;
    try {
        const userId = req.user.id;
        const user = await User.find({_id:userId,user_type:"Admin"});
        if(!user){
            return res.status(400).json({ status: false, message: "Only Admin can access classes." });  
        }

        // Delete the class by ID
        const deletedClass = await Class.findByIdAndDelete(classId);
        if (!deletedClass) {
            return res.status(404).json({ status: false, message: "Class not found." });
        }

        res.status(200).json({ status: true, message: "Class deleted successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message });
    }
});


module.exports = {
    createClass,
    getAllClasses,
    getClassById,
    updateClass,
    deleteClass,
};
