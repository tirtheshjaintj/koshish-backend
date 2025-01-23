const express = require('express');
const { check, validationResult } = require('express-validator');
const { addQuestion, getQuestions, getQuestionsAll } = require('../controllers/question.controller');
const { validate } = require('../middlewares/validate');
const { restrictLogIn } = require('../middlewares/authCheck');
const router = express.Router();

// Route to add a new question or bulk questions
router.post(
    '/add',
    [
        // Custom validation for checking if the request is an array or a single question
        check('questions')
            .custom((value) => Array.isArray(value) || typeof value === 'object')
            .withMessage('Questions should either be an array of objects or a single object'),

        // Validate if it's an array, loop through each question to validate
        check('questions.*.title')
            .isString()
            .withMessage('Title must be a string')
            .isLength({ min: 10, max: 500 })
            .withMessage('Title must be between 10 and 500 characters'),

        check('questions.*.options')
            .isArray({ min: 4, max: 4 })
            .withMessage('Options must be an array of exactly 4 strings'),

        check('questions.*.options.*')
            .isString()
            .withMessage('Each option must be a string'),

        check('questions.*.correctAnswerIndex')
            .isInt({ min: 0, max: 3 })
            .withMessage('Correct answer index must be a number between 0 and 3'),

        check('questions.*.explanation')
            .isString()
            .withMessage('Explanation must be a string')
            .isLength({ min: 20, max: 2000 })
            .withMessage('Explanation must be between 20 and 2000 characters'),

        check('questions.*.category_id')
            .isMongoId()
            .withMessage('Category ID must be a valid MongoDB ID'),

        check('questions.*.level')
            .isIn(['easy', 'medium', 'hard'])
            .withMessage('Level must be one of easy, medium, or hard'),

        // If it's an array of questions, validate all entries
        check('questions')
            .custom((value) => {
                if (Array.isArray(value)) {
                    return value.every((question) => {
                        return (
                            question.title &&
                            Array.isArray(question.options) &&
                            question.options.length === 4 &&
                            typeof question.correctAnswerIndex === 'number' &&
                            typeof question.explanation === 'string' &&
                            typeof question.category_id === 'string' &&
                            ['easy', 'medium', 'hard'].includes(question.level)
                        );
                    });
                }
                return true;
            })
            .withMessage('Invalid question format in array'),

    ],
    validate,
    addQuestion
);

router.post(
    '/bulk_add',
    validate,
    addQuestion
);

router.get("/:category_id",
    check("category_id")
        .isMongoId()
        .withMessage('Category ID must be a valid MongoDB ID'),
    restrictLogIn,
    validate,
    getQuestions
);

router.get("/:category_id/all",
    check("category_id")
        .isMongoId()
        .withMessage('Category ID must be a valid MongoDB ID'),
    validate,
    getQuestionsAll
);

module.exports = router;
