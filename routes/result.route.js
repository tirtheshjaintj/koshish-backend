const {Router} = require('express');
const { createResult, getResultByEventId, deleteResult, declareResultForEvent, finalResult } = require('../controllers/results.controller.js');
const { restrictLogIn } = require('../middlewares/authCheck.js');
const { check} = require("express-validator");
const { validate } = require('../middlewares/validate.js');

const resultRouter = Router();

resultRouter.get('/get/:eventId',
  [
    check("eventId").isMongoId().withMessage("Invalid Event ID."),
    check("year").isNumeric().withMessage("Year must be a number.")
  ],
  validate
  ,getResultByEventId);
resultRouter.get('/getResult',restrictLogIn);
resultRouter.post(
    "/add",
    [
      check("eventId").isMongoId().withMessage("Invalid Event ID."),
      check("result")
        .isArray({ min: 3, max: 3 })
        .withMessage("Result array must contain exactly 3 entries."),
      check("result.*").isMongoId().withMessage("Invalid MongoId in result array.")
    ],
    validate,
    createResult
);
resultRouter.delete('/delete/:id',restrictLogIn,deleteResult);
resultRouter.get('/declare/:eventId',restrictLogIn,declareResultForEvent);
resultRouter.get("/finalResult",finalResult);


module.exports = resultRouter;