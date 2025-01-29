const mongoose=require("mongoose");
const User = require("./user.model");

const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Event name is required"],
        trim: true,
        minlength: [3, "Event name must be at least 3 characters long"],
        maxlength: [100, "Event name cannot exceed 100 characters"]
    },
    type: {
        type: String,
        enum: {
            values: ["Senior", "Junior"],
            message: "Event type must be either 'Senior' or 'Junior'"
        },
        required: [true, "Event type is required"]
    },
    part_type: {
        type: String,
        enum: {
            values: ["Group", "Solo"],
            message: "Event Part Type must be either 'Group' or 'Solo'"
        },
        required: [true, "Event Part Type is required"]
    },
    description: {
        type: String,
        required: [true, "Event description is required"],
        minlength: [10, "Description must be at least 10 characters long"],
        maxlength: [500, "Description cannot exceed 500 characters"]
    },
    rules: {
        type: [String],
        required: [true, "Event rules are required"],
        validate: {
            validator: function (rules) {
                return rules.length > 0; // At least one rule should be specified
            },
            message: "There must be at least one rule for the event"
        }
    },
    maxStudents: {
        type: Number,
        required: [true, "Maximum number of students is required"],
        min: [1, "Maximum students must be at least 1"],
        validate: {
            validator: function (value) {
                return value >= this.minStudents; // maxStudents must be greater than or equal to minStudents
            },
            message: "Maximum students must be greater than or equal to minimum students"
        }
    },
    minStudents: {
        type: Number,
        required: [true, "Minimum number of students is required"],
        min: [1, "Minimum students must be at least 1"]
    },
    location: {
        type: String,
        required: [true, "Event location is required"],
        trim: true,
        maxlength: [200, "Location cannot exceed 200 characters"]
    },
    convenor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Convenor is required"],
        validate: {
            validator: async function (value) {
                const user = await User.findById(value);
                return user && user.user_type === "Teacher"; // Ensure convenor is a user of type "Teacher"
            },
            message: "Convenor must be a valid user with the user_type 'Teacher'"
        }
    },
    points: {
        type: [Number],
        required: false,
        validate: {
            validator: function (points) {
                return points.length === 3 && 
                       points.every(point => typeof point === "number") &&
                       points[0] >= points[1] && points[1] >= points[2]; 
            },
            message: "Points must be exactly 3 values and sorted in descending order"
        }
    },
    is_active:{
        type:Boolean,
        default:false
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Ensure unique event names per type (Senior/Junior)
eventSchema.index({ name: 1, type: 1 }, { unique: true });

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
