const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define the schema
const adminSchema = new mongoose.Schema({
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
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        validate: {
            validator: function (v) {
                return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
            },
            message: props => `${props.value} is not a valid email!`
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        validate: {
            validator: function (v) {
                return /^.{8,}$/.test(v);
            },
            message: props => `Password must be at least 8 characters long.`
        }
    },
    otp: {
        type: String,
        validate: {
            validator: function (val) {
                return !val || val?.length == 6;
            },
            message: () => `OTP must be 6 digits`
        }
    },
    google_id: {
        type: String,
        validate: {
            validator: function (v) {
                return !v || /^\d{21}$/.test(v);
            },
            message: props => `Not Valid Google ID`
        },
        unique: true,
        sparse: true // Allows multiple `null` values
    }
}, { timestamps: true });

// Middleware to hash password and generate OTP before saving
userSchema.pre('save', async function (next) {

    try {

        if (this.isModified('password')) {
            this.password = await bcrypt.hash(this.password, 12);
        }

        next();
    } catch (error) {
        next(error);
    }

});

// Method to check if the password is correct
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Compile the model
const Admin = mongoose.model('Admin', userSchema);

module.exports = Admin;
