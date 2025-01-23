const asyncHandler = require('express-async-handler');
const Result = require('../models/result.model');
const Question = require('../models/question.model');
const User = require('../models/user.model');
const Category = require('../models/category.model'); // Assuming you have a Category model

// Controller to handle saving quiz results
const submitQuizResults = asyncHandler(async (req, res) => {
    const { category_id, answers } = req.body;
    const user_id = req.user.id;
    console.log(category_id, answers, user_id);
    // Find the user
    const user = await User.findById(user_id);
    if (!user) {
        return res.status(400).json({ error: 'User not found' });
    }

    // Find the category
    const category = await Category.findById(category_id);
    if (!category) {
        return res.status(400).json({ error: 'Category not found' });
    }

    // Find the questions for the given category
    const questions = await Question.find({ category_id });

    // Calculate the marks
    let marks = 0;
    const results = await Promise.all(
        answers.map(async (answer) => {
            const question = questions.find(q => q._id.toString() === answer.question_id);
            if (!question) {
                throw new Error('Invalid question ID');
            }
            const isCorrect = question.correctAnswerIndex === answer.user_answer;
            if (isCorrect) marks += 1;

            return {
                question_id: question._id,
                user_answer: answer.user_answer,
                correct: isCorrect
            };
        })
    );

    // Save the result
    const result = await Result.create({
        user_id,
        category_id,
        answers: results,
        marks
    });

    res.status(200).json({ message: 'Quiz submitted successfully', result });
});

const getUserResults = asyncHandler(async (req, res) => {
    const user_id = req.user.id;

    // Find all results for the user and populate the category (name and image)
    const results = await Result.find({ user_id })
        .populate('category_id', 'name image') // Populating category details like name and image
        .select('-user_id') // Optionally, exclude the user_id from the result
        .sort({ createdAt: -1 }); // Sort by most recent result first

    if (results.length === 0) {
        return res.status(404).json({ error: 'No results found for this user' });
    }

    res.status(200).json({ message: 'User results fetched successfully', results });
});


// 2. Get Detailed Analysis of a Specific Result
const getResultAnalysis = asyncHandler(async (req, res) => {
    const { result_id } = req.params;

    // Find the result by ID and populate the necessary details (excluding options population)
    const result = await Result.findById(result_id)
        .populate({
            path: 'answers.question_id',
            select: 'title options correctAnswerIndex explanation', // No need to populate options here
        })
        .populate('category_id');

    if (!result) {
        return res.status(404).json({ error: 'Result not found' });
    }

    const analysis = result.answers.map(answer => {
        const question = answer.question_id;
        const selectedOption = question.options[answer.user_answer]; // user_answer stores the index of the selected option
        const correctOption = question.options[question.correctAnswerIndex];
        const isCorrect = answer.correct ? 'Correct' : 'Wrong';

        return {
            question_title: question.title,
            options: question.options, // Directly use the options array (no population needed)
            user_option: selectedOption || 'No answer', // Handle case if no answer is selected
            correct_option: correctOption || 'No answer', // Handle case if no correct option is found
            explanation: question.explanation || 'No explanation provided',
            isCorrect,
            correct_answer_index: question.correctAnswerIndex,
            selected_option_index: answer.user_answer
        };
    });

    res.status(200).json({ message: 'Result analysis fetched successfully', analysis });
});



module.exports = {
    submitQuizResults,
    getUserResults,
    getResultAnalysis
};

