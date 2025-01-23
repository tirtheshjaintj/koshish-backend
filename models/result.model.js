const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Category ID is required']
    },
    answers: [{
        question_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question',
            required: [true, 'Question ID is required']
        },
        user_answer: {
            type: Number, // index of selected option
            required: [true, 'User answer is required']
        },
        correct: {
            type: Boolean,
            required: true
        }
    }],
    marks: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const Result = mongoose.model('Result', resultSchema);

module.exports = Result;
