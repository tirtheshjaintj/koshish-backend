const mongoose = require("mongoose");
const Event = require("./event.model");
const Class = require("./class.model");

const registrationSchema = new mongoose.Schema({
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
        required: [true, "Class ID is required"], // Ensures classId is provided
        validate: {
            validator: async function (value) {
                const classExists = await Class.findById(value);
                return classExists !== null; // Ensures the class exists in the database
            },
            message: "Class not found"
        }
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: [true, "Event ID is required"], // Ensures eventId is provided
        validate: {
            validator: async function (value) {
                const eventExists = await Event.findById(value);
                return eventExists !== null; // Ensures the event exists in the database
            },
            message: "Event not found"
        }
    },
    students: {
        type: [String],
        required: [true, "Student list is required"], // Ensures students array is provided
        validate: {
            validator: function (students) {
                return students.length > 0; // Ensures there is at least one student
            },
            message: "At least one student is required"
        }
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

const Registration = mongoose.model("Registration", registrationSchema);

module.exports = Registration;
