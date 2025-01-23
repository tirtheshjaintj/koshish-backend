const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Question title is required'],
        minlength: [10, 'Title must be at least 10 characters long'],
        maxlength: [500, 'Title cannot exceed 500 characters'],
        trim: true
    },
    options: {
        type: [String],
        validate: {
            validator: function (options) {
                return options.length === 4;
            },
            message: 'Exactly 4 options are required'
        },
        required: [true, 'Options are required']
    },
    correctAnswerIndex: {
        type: Number,
        required: [true, 'Correct answer index is required'],
        min: [0, 'Correct answer index must be between 0 and 3'],
        max: [3, 'Correct answer index must be between 0 and 3'],
        validate: {
            validator: function (value) {
                return this.options && value < this.options.length;
            },
            message: 'Correct answer index must point to a valid option'
        }
    },
    explanation: {
        type: String,
        required: [true, 'Explanation is required'],
        minlength: [20, 'Explanation must be at least 20 characters long'],
        maxlength: [2000, 'Explanation cannot exceed 2000 characters']
    },
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Category ID is required']
    },
    level: {
        type: String,
        required: [true, 'Question level is required'],
        enum: {
            values: ['easy', 'medium', 'hard'],
            message: 'Level must be either easy, medium, or hard'
        }
    }
}, {
    timestamps: true // Automatically add createdAt and updatedAt fields
});

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
