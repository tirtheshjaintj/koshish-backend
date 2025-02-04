const asyncHandler = require("express-async-handler");
const Registration = require("../models/registration.model");
const Class = require("../models/class.model");
const Event = require("../models/event.model");

const createRegistration = asyncHandler(async (req, res) => {
    const { classId, eventId, students } = req.body;
    try {
        const userId=req.user.id;
        const classExists = await Class.find({_id:classId,incharge:userId});
        if (!classExists) {
            return res.status(400).json({
                status: false,
                message: "Class not found.",
            });
        }

        const eventExists = await Event.findById(eventId);
        if (!eventExists) {
            return res.status(400).json({
                status: false,
                message: "Event not found.",
            });
        }

        if(students.length<eventExists.minStudents){
            return res.status(400).json({
                status: false,
                message: "Students are less than required",
            });
        }

        if(students.length>eventExists.maxStudents){
            return res.status(400).json({
                status: false,
                message: "Students are more than required",
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


const getAllRegistrations = asyncHandler(async (req, res) => {
    try {
        const registrations = await Registration.find().populate("classId").populate("eventId");
        if(!registrations) {
            return res.status(500).json({status: false, message: "Error retrieving registrations."});
        }
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


const getRegistrationById = asyncHandler(async (req, res) => {
    const { registrationId } = req.params;
    try {
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


const updateRegistration = asyncHandler(async (req, res) => {
    const { registrationId } = req.params;
    const { classId, eventId, students } = req.body;

    try {
        const userId=req.user.id;
        const classExists = await Class.find({_id:classId,incharge:userId});
        if (!classExists) {
            return res.status(400).json({
                status: false,
                message: "Class not found.",
            });
        }
        const registration = await Registration.find({_id:registrationId,classId:classExists._id});
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

const deleteRegistration = asyncHandler(async (req, res) => {
    const { registrationId } = req.params;
    try {
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
