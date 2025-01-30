const asyncHandler = require("express-async-handler");
const Class = require("../models/class.model.js");
const User = require("../models/user.model.js");
const { isValidObjectId } = require("mongoose");

const createClass = asyncHandler(async (req, res) => {
    const { name, incharge, type } = req.body;
    const user = req.user;
    try {
        // Validate required fields
        if (!name || !incharge || !type) {
            return res.status(400).json({ status: false, message: "All fields (name, incharge, type) are required." });
        }

        // Check if the user is an admin
        if(user.user_type !== "Admin"){
            return res.status(400).json({ status: false, message: "Only Admin can create a class." });
        }

        // Validate incharge (must be a valid teacher)
        const teacher = await User.findById(incharge);
        if (!teacher || teacher.user_type !== "Teacher") {
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

/**
 * @desc    Get all classes
 * @route   GET /api/class
 * @returns {Object} JSON response with all classes and their respective incharge details.
 */
const getAllClasses = asyncHandler(async (req, res) => {
    try {
        // Fetch all classes and populate the incharge details
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
        if (!classId) {
            return res.status(400).json({ status: false, message: "Class ID is required." });
        }
        if (!isValidObjectId(classId)) {
            return res.status(400).json({ status: false, message: "Invalid Class ID." });
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

/**
 * @desc    Update a class
 * @route   PUT /api/class/:classId
 * @param   {String} classId - ID of the class to update.
 * @param   {Object} req.body - Contains updated class details (name, incharge, type).
 * @returns {Object} JSON response with the updated class or an error if not found.
 */
const updateClass = asyncHandler(async (req, res) => {
    const { classId } = req.params;
    const { name, incharge, type } = req.body;
    const user = req.user;

    try {
        if (!classId) {
            return res.status(400).json({ status: false, message: "Class ID is required." });
        }

        if (!isValidObjectId(classId)) {
            return res.status(400).json({ status: false, message: "Invalid Class ID." });
        }

        if(user.user_type !== "Admin"){
            return res.status(400).json({ status: false, message: "Only Admin can update a class." });
        }

        // Validate incharge if provided
        if (incharge) {
            const teacher = await User.findById(incharge);
            if (!teacher || teacher.user_type !== "Teacher") {
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

/**
 * @desc    Delete a class
 * @route   DELETE /api/class/:classId
 * @param   {String} classId - ID of the class to delete.
 * @returns {Object} JSON response confirming deletion or an error if not found.
 */

const deleteClass = asyncHandler(async (req, res) => {
    const { classId } = req.params;
    try {
        if (!classId) {
            return res.status(400).json({ status: false, message: "Class ID is required." });
        }

        if (!isValidObjectId(classId)) {
            return res.status(400).json({ status: false, message: "Invalid Class ID." });
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
