const { validationResult } = require('express-validator');
const Question = require('../models/question.model');
const Category = require('../models/category.model'); // Assuming you have a Category model
const asyncHandler = require("express-async-handler");
const mongoose = require('mongoose');

// Controller to add a new question
const addQuestion = asyncHandler(async (req, res) => {
    const questionsData = req.body; // This could be a single question or an array of questions.
    try {
        // Check if the request body is an array or a single object
        const isBulk = Array.isArray(questionsData);
        // If it's an array, handle bulk insertion
        if (isBulk) {
            const questionsToInsert = [];
            // Loop through each question in the array and validate the category
            for (let questionData of questionsData) {
                const { title, options, correctAnswerIndex, explanation, category_id, level } = questionData;

                // Ensure the category exists
                const categoryExists = await Category.findById(category_id);
                if (!categoryExists) {
                    return res.status(400).json({ message: `Invalid category ID for question: ${title}` });
                }

                const question = new Question({
                    title,
                    options,
                    correctAnswerIndex,
                    explanation,
                    category_id,
                    level,
                });

                questionsToInsert.push(question);
            }

            // Bulk save the questions
            const savedQuestions = await Question.insertMany(questionsToInsert);
            return res.status(201).json({ message: 'Questions added successfully', questions: savedQuestions });
        } else {
            // Handle single question insertion
            const { title, options, correctAnswerIndex, explanation, category_id, level } = questionsData;

            // Ensure the category exists
            const categoryExists = await Category.findById(category_id);
            if (!categoryExists) {
                return res.status(400).json({ message: 'Invalid category ID' });
            }

            const question = new Question({
                title,
                options,
                correctAnswerIndex,
                explanation,
                category_id,
                level,
            });

            const savedQuestion = await question.save();
            return res.status(201).json({ message: 'Question added successfully', question: savedQuestion });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});



const getQuestions = asyncHandler(async (req, res) => {
    const { category_id } = req.params;
    const categoryExists = await Category.findById(category_id);
    if (!categoryExists) {
        return res.status(400).json({ message: 'Invalid category ID' });
    }
    const questions = await Question.aggregate([
        { $match: { category_id: new mongoose.Types.ObjectId(category_id) } }, // Match the specified category_id
        { $sample: { size: 15 } },   // Randomly select 15 documents
        {
            $project: {
                correctAnswerIndex: 0, // Exclude the 'correctAnswerIndex' field
                // Add any other fields you want to include here
            },
        },
    ]);
    // Check if no questions are found for the given category
    if (questions.length === 0) {
        return res.status(404).json({ status: false, category_id, message: "No questions found for this category" });
    }
    return res.status(200).json({ status: true, message: "Questions Are Ready", data: questions });
});

const getQuestionsAll = asyncHandler(async (req, res) => {
    const { category_id } = req.params;
    const categoryExists = await Category.findById(category_id);
    console.log(categoryExists);
    if (!categoryExists) {
        return res.status(400).json({ message: 'Invalid category ID' });
    }
    const questions = await Question.find({ category_id });

    if (questions.length === 0) {
        return res.status(404).json({ status: false, category_id, message: "No questions found for this category" });
    }

    return res.status(200).json({ status: true, message: "Questions Are Ready", data: questions });
});

module.exports = { addQuestion, getQuestions, getQuestionsAll };
