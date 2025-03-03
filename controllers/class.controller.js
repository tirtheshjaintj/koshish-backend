const asyncHandler = require("express-async-handler");
const Class = require("../models/class.model");
const User = require("../models/user.model");
const { setClassUser } = require("../helpers/jwt.helper");

const LoginByClass = asyncHandler(async (req, res) => {
  console.log(req.body);
  const { username, password } = req.body;
  if (!username || !password)
    return res
      .status(500)
      .json({ status: false, message: "All fields are required" });
  const classDetail = await Class.findOne({ username });
  if (!classDetail) {
    return res
      .status(400)
      .json({ status: false, message: "Account does not exist" });
  }
  const isPassValid = await classDetail.isPasswordCorrect(password);
  if (!isPassValid)
    return res
      .status(401)
      .json({ status: false, message: "Invalid Credetials" });

    const classWithOutPass = classDetail.toObject();
    delete classWithOutPass.password;  
  res.status(200).json({
    status: true,
    token: setClassUser(classDetail),
    message: "Login successful",
    class: classWithOutPass,
  });
});

const createClass = asyncHandler(async (req, res) => {
  const { name, email, password, type } = req.body;
  try {
    const userId = req.user.id;
    const user = await User.find({ _id: userId, user_type: "Admin" });
    if (!user) {
      return res
        .status(400)
        .json({ status: false, message: "Only Admin can create a class." });
    }

    const username = name.replace(/\s+/g, "").toLowerCase();

    const existingClass = await Class.findOne({ name });
    if (existingClass) {
      return res.status(400).json({
        status: false,
        message: "A class with this name already exists.",
      });
    }

    const newClass = await Class.create({
      name,
      email,
      password,
      username,
      type,
    });
    res.status(201).json({
      status: true,
      message: "Class created successfully!",
      class: newClass,
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

const getAllClasses = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.find({ _id: userId, user_type: "Admin" });
    if (!user) {
      return res
        .status(400)
        .json({ status: false, message: "Only Admin can access class." });
    }
    const classes = await Class.find();
    res.status(200).json({
      status: true,
      message: "Classes retrieved successfully!",
      classes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
});

const getClassById = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  try {
    const userId = req.user.id;
    const user = await User.find({ _id: userId, user_type: "Admin" });
    if (!user) {
      return res
        .status(400)
        .json({ status: false, message: "Only Admin can access classes." });
    }
    // Fetch the class by ID and populate incharge details
    const singleClass = await Class.findById(classId);
    if (!singleClass) {
      return res
        .status(404)
        .json({ status: false, message: "Class not found." });
    }

    res.status(200).json({
      status: true,
      message: "Class retrieved successfully!",
      class: singleClass,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
});

const updateClass = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  const { name, type } = req.body;
  try {
    const userId = req.user.id;
    const user = await User.find({ _id: userId, user_type: "Admin" });
    if (!user) {
      return res
        .status(400)
        .json({ status: false, message: "Only Admin can access classes." });
    }

    // Build the update fields
    const updateFields = {};
    if (name) updateFields.name = name;
    if (type) updateFields.type = type;

    // Update the class
    const updatedClass = await Class.findByIdAndUpdate(classId, updateFields, {
      new: true,
      runValidators: true,
    }).populate("incharge", "name email");

    if (!updatedClass) {
      return res
        .status(404)
        .json({ status: false, message: "Class not found." });
    }

    res.status(200).json({
      status: true,
      message: "Class updated successfully!",
      class: updatedClass,
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

const deleteClass = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  try {
    const userId = req.user.id;
    const user = await User.find({ _id: userId, user_type: "Admin" });
    if (!user) {
      return res
        .status(400)
        .json({ status: false, message: "Only Admin can access classes." });
    }

    // Delete the class by ID
    const deletedClass = await Class.findByIdAndDelete(classId);
    if (!deletedClass) {
      return res
        .status(404)
        .json({ status: false, message: "Class not found." });
    }

    res
      .status(200)
      .json({ status: true, message: "Class deleted successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

module.exports = {
  createClass,
  getAllClasses,
  getClassById,
  updateClass,
  deleteClass,
  LoginByClass,
};
