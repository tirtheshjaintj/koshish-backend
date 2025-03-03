const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Class name is required"],
      trim: true,
      unique: true,
      minlength: [3, "Class name must be at least 3 characters"],
    //   maxlength: [50, "Class name cannot exceed 50 characters"],
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
    },
    password: {
      type: String,
      minlength: [8, "Password must be at least 8 characters"],
      required: [true, "Password is required"],
    },
    type: {
      type: String,
      enum: {
        values: ["Senior", "Junior"],
        message: "Type must be either 'Senior' or 'Junior'",
      },
      required: [true, "Class type is required"],
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);


classSchema.pre("save", async function (next) {
  try {
    if (this.isModified("password")) {
      this.password = await bcrypt.hash(this.password, 12);
    }
    next();
  } catch (error) {
    next(error);
  }
});


classSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};
const Class = mongoose.model("Class", classSchema);


module.exports = Class;
