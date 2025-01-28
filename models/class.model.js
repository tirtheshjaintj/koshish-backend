const mongoose = require("mongoose");
const User = require("./User"); // Import the User model to check the user_type

const classSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Class name is required"],
        trim: true,
        unique:true,
        minlength: [3, "Class name must be at least 3 characters"],
        maxlength: [50, "Class name cannot exceed 50 characters"]
    },
    incharge: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Incharge (Teacher) reference is required"],
        validate: {
            validator: async function (value) {
                const user = await User.findById(value);
                return user && user.user_type === "Teacher";
            },
            message: "Incharge must be a valid user with the user_type 'Teacher'"
        }
    },
    type: {
        type: String,
        enum: {
            values: ["Senior", "Junior"],
            message: "Type must be either 'Senior' or 'Junior'"
        },
        required: [true, "Class type is required"]
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt timestamps
});

const Class = mongoose.model("Class", classSchema);
module.exports = Class;
