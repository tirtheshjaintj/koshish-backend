const asyncHandler = require("express-async-handler");
const Registration = require("../models/registration.model.js");
const Class = require("../models/class.model.js");
const Event = require("../models/event.model.js");
const { isValidObjectId } = require("mongoose");

/**
 * @desc    Create a new registration
 * @route   POST /api/registrations
 * @input   { classId: <ObjectId>, eventId: <ObjectId>, students: <Array of student names> }
 * @output  { status: true/false, message: <message>, registration: <created registration object> }
*/
const createRegistration = asyncHandler(async (req, res) => {
    const { classId, eventId, students } = req.body;

    try {
        // Validate input
        if (!classId || !eventId || !students || !Array.isArray(students) || students.length === 0) {
            return res.status(400).json({
                status: false,
                message: "Class ID, Event ID, and a list of students are required.",
            });
        }

        // Validate Class ID
        if (!isValidObjectId(classId)) {
            return res.status(400).json({
                status: false,
                message: "Invalid Class ID.",
            });
        }

        const classExists = await Class.findById(classId);
        if (!classExists) {
            return res.status(400).json({
                status: false,
                message: "Class not found.",
            });
        }

        // Validate Event ID
        if (!isValidObjectId(eventId)) {
            return res.status(400).json({
                status: false,
                message: "Invalid Event ID.",
            });
        }

        const eventExists = await Event.findById(eventId);
        if (!eventExists) {
            return res.status(400).json({
                status: false,
                message: "Event not found.",
            });
        }

        // Create the registration
        const newRegistration = await Registration.create({
            classId,
            eventId,
            students,
        });

        res.status(201).json({
            status: true,
            message: "Registration created successfully!",
            registration: newRegistration,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
});

/**
 * @desc    Get all registrations
 * @route   GET /api/registrations
 * @input   None
 * @output  { status: true/false, message: <message>, registrations: <Array of registration objects> }
*/
const getAllRegistrations = asyncHandler(async (req, res) => {
    try {
        const registrations = await Registration.find().populate("classId").populate("eventId");
        if(!registrations) 
            return res.status(500).json({status: false, message: "Error retrieving registrations."});

        res.status(200).json({
            status: true,
            message: "Registrations retrieved successfully!",
            registrations,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            message: "Internal Server Error",
        });
    }
});


/**
 * @desc    Get a single registration by ID
 * @route   GET /api/registrations/:registrationId
 * @input   { registrationId: <ObjectId> }
 * @output  { status: true/false, message: <message>, registration: <registration object> }
*/
const getRegistrationById = asyncHandler(async (req, res) => {
    const { registrationId } = req.params;

    try {
        if (!registrationId) {
            return res.status(400).json({
                status: false,
                message: "Registration ID is required.",
            });
        }

        if (!isValidObjectId(registrationId)) {
            return res.status(400).json({
                status: false,
                message: "Invalid Registration ID.",
            });
        }

        const registration = await Registration.findById(registrationId).populate("classId").populate("eventId");
        if (!registration) {
            return res.status(404).json({
                status: false,
                message: "Registration not found.",
            });
        }

        res.status(200).json({
            status: true,
            message: "Registration retrieved successfully!",
            registration,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            message: "Internal Server Error",
        });
    }
});


/**
 * @desc    Update a registration
 * @route   PUT /api/registrations/:registrationId
 * @input   { classId: <ObjectId>, eventId: <ObjectId>, students: <Array of student names> }
 * @output  { status: true/false, message: <message>, registration: <updated registration object> }
*/
const updateRegistration = asyncHandler(async (req, res) => {
    const { registrationId } = req.params;
    const { classId, eventId, students } = req.body;

    try {
        if (!registrationId) {
            return res.status(400).json({
                status: false,
                message: "Registration ID is required.",
            });
        }

        if (!isValidObjectId(registrationId)) {
            return res.status(400).json({
                status: false,
                message: "Invalid Registration ID.",
            });
        }

        const registration = await Registration.findById(registrationId);
        if (!registration) {
            return res.status(404).json({
                status: false,
                message: "Registration not found.",
            });
        }

        const updateFields = {};
        if (classId) updateFields.classId = classId;
        if (eventId) updateFields.eventId = eventId;
        if (students) updateFields.students = students;

        const updatedRegistration = await Registration.findByIdAndUpdate(
            registrationId,
            updateFields,
            { new: true, runValidators: true }
        ).populate("classId").populate("eventId");

        res.status(200).json({
            status: true,
            message: "Registration updated successfully!",
            registration: updatedRegistration,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
});

/**
 * @desc    Delete a registration
 * @route   DELETE /api/registrations/:registrationId
 * @input   { registrationId: <ObjectId> }
 * @output  { status: true/false, message: <message> }
 */

const deleteRegistration = asyncHandler(async (req, res) => {
    const { registrationId } = req.params;

    try {
        if (!registrationId) {
            return res.status(400).json({
                status: false,
                message: "Registration ID is required.",
            });
        }

        if (!isValidObjectId(registrationId)) {
            return res.status(400).json({
                status: false,
                message: "Invalid Registration ID.",
            });
        }

        const deletedRegistration = await Registration.findByIdAndDelete(registrationId);
        if (!deletedRegistration) {
            return res.status(404).json({
                status: false,
                message: "Registration not found.",
            });
        }

        res.status(200).json({
            status: true,
            message: "Registration deleted successfully!",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            message: "Internal Server Error",
        });
    }
});

module.exports = {
    createRegistration,
    getAllRegistrations,
    getRegistrationById,
    updateRegistration,
    deleteRegistration,
};
