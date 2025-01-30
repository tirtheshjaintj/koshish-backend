const asyncHandler = require("express-async-handler");
const Result = require("../models/result.model.js");

// Get all results
const getAllResults = asyncHandler(async (req, res) => {
  const results = await Result.find({}).populate("eventId classId");
  res.status(200).json(results);
});

// Create a new result
const createResult = asyncHandler(async (req, res) => {
  const { eventId, classId, position } = req.body;

  if (!eventId || !classId || !position) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const newResult = new Result({ eventId, classId, position });
    await newResult.save();
    res.status(201).json({ message: "Result created successfully", newResult });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update result
const updateResult = asyncHandler(async (req, res) => {
  const { resultId } = req.params;
  const { position } = req.body;

  if (!position || !Array.isArray(position) || position.length !== 3) {
    return res.status(400).json({ message: "Invalid positions format" });
  }

  const updatedResult = await Result.findByIdAndUpdate(
    resultId,
    { position },
    { new: true }
  );

  if (!updatedResult) {
    return res.status(404).json({ message: "Result not found" });
  }

  res.status(200).json({ message: "Result updated successfully", updatedResult });
});

// Delete result
const deleteResult = asyncHandler(async (req, res) => {
  const { resultId } = req.params;

  const deletedResult = await Result.findByIdAndDelete(resultId);

  if (!deletedResult) {
    return res.status(404).json({ message: "Result not found" });
  }

  res.status(200).json({ message: "Result deleted successfully" });
});

module.exports = {
  getAllResults,
  createResult,
  updateResult,
  deleteResult,
};
