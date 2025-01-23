const express = require('express');
const { check, validationResult } = require('express-validator');
const { submitQuizResults, getUserResults, getResultAnalysis } = require('../controllers/result.controller');
const { validate } = require('../middlewares/validate');
const { restrictLogIn } = require('../middlewares/authCheck');
const router = express.Router();

// Middleware to validate request body
const validateQuizResults = [
    check('category_id').not().isEmpty().withMessage('Category ID is required'),
    check('answers').isArray().withMessage('Answers should be an array of objects'),
    check('answers.*.question_id').isMongoId().not().isEmpty().withMessage('Question ID is required'),
    check('answers.*.user_answer').isNumeric().withMessage('User answer must be a number')
];


// POST route for submitting quiz results
router.post('/submit-quiz', restrictLogIn, validateQuizResults, validate, submitQuizResults);
router.get('/user-results', restrictLogIn, getUserResults);
router.get('/result-analysis/:result_id', restrictLogIn, getResultAnalysis);
module.exports = router;
