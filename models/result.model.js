const mongoose = require("mongoose");
const Event = require("./event.model");

const resultSchema = new mongoose.Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        unique: [true, "Event must be unique for each result"],
        required: [true, "Event ID is required"],
        validate: {
            validator: async function (value) {
                const eventExists = await Event.findById(value);
                return eventExists !== null;  
            },
            message: "Event not found"
        }
    },
    year: {
        type: Number,
        default: new Date().getFullYear(),
        required: [true, "Year is required"]
    },
    result: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
        required: [true, "Class ID is required"]
    }],
    is_active:{
        type:Boolean,
        default:true
    },
    year:{
        type: Number,
        required: [true, "Year is required"],
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Ensure that each event can only have one result per position
resultSchema.index({ eventId: 1, year: 1 }, { unique: true });

const Result = mongoose.model("Result", resultSchema);

module.exports = Result;
