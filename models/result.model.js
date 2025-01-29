const mongoose = require("mongoose");
const Event = require("./event.model");
const Class = require("./class.model");

const resultSchema = new mongoose.Schema({
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
    position: {
        type: [Number],
        required: [true, "Positions are required"], // Ensures positions are provided
        validate: {
            validator: function (positions) {
                return positions.length === 3 && 
                       positions.every(position => [1, 2, 3].includes(position)); 
            },
            message: "Positions must be an array of exactly 3 values, each being 1, 2, or 3"
        }
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Ensure that each event can only have one result per position
resultSchema.index({ eventId: 1, position: 1 }, { unique: true });

const Result = mongoose.model("Result", resultSchema);

module.exports = Result;
