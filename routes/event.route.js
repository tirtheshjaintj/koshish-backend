const express = require("express");
const { body, param } = require("express-validator");
const { createEvent, getAllEvents, getEventById, updateEvent } = require("../controllers/event.controller.js");
const { validate } = require("../middlewares/validate.js");
const { restrictLogIn } = require("../middlewares/authCheck.js");

const router = express.Router();


router.post(
    "/create",
    restrictLogIn,
    [
        body("name").notEmpty().withMessage("Event name is required."),
        body("type").notEmpty().withMessage("Event type is required."),
        body("part_type").notEmpty().withMessage("Participation type is required."),
        body("description").notEmpty().withMessage("Description is required."),
        body("rules").isArray().withMessage("Rules should be an array."),
        body("maxStudents").isInt({ min: 1 }).withMessage("Max students should be a positive number."),
        body("minStudents").isInt({ min: 1 }).withMessage("Min students should be a positive number."),
        body("location").notEmpty().withMessage("Location is required."),
        body("points").isArray().withMessage("Points should be an array."),
    ],
    validate,
    createEvent
);


router.get("/", restrictLogIn, getAllEvents);


router.get(
    "/:id",
    restrictLogIn,
    [param("id").isMongoId().withMessage("Invalid event ID.")],
    validate,
    getEventById
);


router.put(
    "/update/:id",
    restrictLogIn,
    [
        param("id").isMongoId().withMessage("Invalid event ID."),
        body("name").optional().notEmpty().withMessage("Event name is required."),
        body("type").optional().notEmpty().withMessage("Event type is required."),
        body("part_type").optional().notEmpty().withMessage("Participation type is required."),
        body("description").optional().notEmpty().withMessage("Description is required."),
        body("rules").optional().isArray().withMessage("Rules should be an array."),
        body("maxStudents").optional().isInt({ min: 1 }).withMessage("Max students should be a positive number."),
        body("minStudents").optional().isInt({ min: 1 }).withMessage("Min students should be a positive number."),
        body("location").optional().notEmpty().withMessage("Location is required."),
        body("convenor").optional().notEmpty().withMessage("Convenor details are required."),
        body("points").optional().isArray().withMessage("Points should be an array."),
    ],
    validate,
    updateEvent
);

module.exports = router;