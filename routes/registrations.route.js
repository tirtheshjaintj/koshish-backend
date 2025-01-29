const express = require("express");
const router = express.Router();

const {
    createRegistration,
    getAllRegistrations,
    getRegistrationById,
    updateRegistration,
    deleteRegistration
} = require("../controllers/registeration.controller.js");


router.post("/", createRegistration);


router.get("/", getAllRegistrations);


router.get("/:registrationId", getRegistrationById);


router.put("/:registrationId", updateRegistration);


router.delete("/:registrationId", deleteRegistration);

module.exports = router;
