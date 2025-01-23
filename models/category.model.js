const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        validate: {
            validator: function (v) {
                return /^[a-zA-Z\s]+$/.test(v);
            },
            message: props => `${props.value} is not a valid name! Only letters and spaces are allowed.`
        }
    },
    image: {
        type: String,
        required: [true, 'Image URL is required'],
        validate: {
            validator: function (v) {
                return /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(v); // Simple URL validation
            },
            message: props => `${props.value} is not a valid URL!`
        }
    }
});

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
