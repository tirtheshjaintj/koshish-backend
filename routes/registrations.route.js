const express = require("express");
const router = express.Router();
const {check}=require("express-validator");
const {
    createRegistration,
    getAllRegistrations,
    getRegistrationById,
    updateRegistration,
    deleteRegistration
} = require("../controllers/registeration.controller.js");
const { restrictLogIn } = require("../middlewares/authCheck.js");
const { validate } = require("../middlewares/validate.js");

const registrationValidationRules = [
    check("eventId").isMongoId().withMessage("Valid Event ID is required"),
    check("students")
        .isArray({ min: 1 })
        .withMessage("Students must be an array with at least one entry")
        .custom((students) => students.every(s => typeof s === "string" && s.trim().length > 0))
        .withMessage("Each student must be a non-empty string"),
    validate // Middleware to check validation errors
];

const idValidationRules = [
    check("registrationId").isMongoId().withMessage("Invalid Registration ID"),
    validate
];
// Create a registration (POST)
router.post("/", restrictLogIn, registrationValidationRules, createRegistration);

// Get all registrations (GET)
router.get("/", restrictLogIn, getAllRegistrations);

// router.get("/classRegistrations" ,restrictLogIn , getClassRegisterations)

// Get a single registration by ID (GET)
router.get("/:registrationId", restrictLogIn, idValidationRules, getRegistrationById);

// Update a registration (PUT)
router.put("/:registrationId", restrictLogIn, idValidationRules, registrationValidationRules, updateRegistration);

// Delete a registration (DELETE)
router.delete("/:registrationId", restrictLogIn, idValidationRules, deleteRegistration);

module.exports = router;
