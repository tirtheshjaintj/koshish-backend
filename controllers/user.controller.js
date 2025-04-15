const User = require('../models/user.model');
const { setUser } = require('../helpers/jwt.helper');
const sendMail = require('../helpers/mail.helper');
const crypto = require('crypto');
const asyncHandler = require("express-async-handler");

const validUserTypes = ["Admin", "Convenor"];

const signup = asyncHandler(async (req, res) => {
    const { name, email, phone_number, password, user_type } = req.body;
    try {
        const admin_user = req.user;
        if (!admin_user || admin_user.user_type != "Admin") return res.status(404).json({ status: false, message: "Only Admin can create a new user." });

        if (!validUserTypes.includes(user_type)) {
            return res.status(400).json({ status: false, message: 'Invalid user type. Must be Admin, Teacher, or Convenor.' });
        }

        // Check if the user with the given email already exists and is verified
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ status: false, message: 'User already exists with this email.' });
        }

        // Check if the user with the given phone number already exists and is verified
        const existingUser2 = await User.findOne({ phone_number });
        if (existingUser2) {
            return res.status(400).json({ status: false, message: 'User already exists with this phone number.' });
        }

        const user = await User.create({ name, email, phone_number, user_type, password });
        const mailStatus = await sendMail('PCTE Koshish Planning: Account Created Successfully', email, `PCTE Koshish Planning: Account Created Successfully`);
        const token = setUser(user);
        res.status(201).json({ status: true, message: 'Account Created Successfully!', token });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ status: false, message: 'Invalid email or password.' });
        }

        const isMatch = await user.isPasswordCorrect(password);
        if (!isMatch) {
            return res.status(400).json({ status: false, message: 'Invalid email or password.' });
        }

        const token = setUser(user);
        const mailStatus = await sendMail(
            'PCTE Koshish Planning: You Logged In as User on new Device',
            user.email,
            `Your account has been logged in on a new device.`
        );

        if (!mailStatus) {
            console.error("Failed to send login notification email.");
        }

        return res.status(200).json({ status: true, message: 'Login successful!', token, data: user });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
});

const updateUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { name, email, phone_number, user_type, is_active, password } = req.body;

    try {
        const user = req.user;
        if (user && user.user_type !== "Admin") {
            return res.status(401).json({ status: false, message: 'Not Allowed' });
        }

        const userToUpdate = await User.findById(userId);
        if (!userToUpdate) {
            return res.status(404).json({ status: false, message: 'User not found.' });
        }

        // Update only provided fields
        if (name) userToUpdate.name = name;
        if (email) userToUpdate.email = email;
        if (phone_number) userToUpdate.phone_number = phone_number;
        if (user_type) userToUpdate.user_type = user_type;
        if (typeof is_active !== 'undefined') userToUpdate.is_active = is_active;

        if (password) userToUpdate.password = password;

        const updatedUser = await userToUpdate.save();

        if (!updatedUser) {
            return res.status(400).json({ status: false, message: 'User not found.' });
        }


        const updatedUserData = userToUpdate.toObject();
        delete updatedUserData.password;
        res.status(200).json({ status: true, message: 'Details updated successfully!', user: updatedUserData });

    } catch (error) {
        res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
});

const verifyOtp = asyncHandler(async (req, res) => {
    const { otp } = req.body;
    const { userid } = req.params;

    try {
        const user = await User.findOne({ _id: userid, otp });
        if (!user) {
            return res.status(400).json({ status: false, message: 'Invalid OTP' });
        }

        await User.findByIdAndUpdate(user._id, { otp: null });
        const mailStatus = await sendMail(
            'PCTE Koshish Planning: Account Verified Successfully ✅',
            user.email,
            `Hello ${user.name}, Congratulations 🎉 your account is now verified.`
        );
        if (!mailStatus) {
            res.status(500).json({ status: false, message: 'Failed to send verification email.' });
        }
        const token = setUser(user);
        res.status(200).json({ status: true, message: 'Verification successful!', token });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
});

const resendOtp = asyncHandler(async (req, res) => {
    const { userid } = req.params;
    try {
        const user = await User.findOne({ _id: userid });
        if (!user) {
            return res.status(400).json({ status: false, message: 'User not found or already verified.' });
        }
        const newOtp = crypto.randomInt(100000, 999999).toString();
        await User.findByIdAndUpdate(user._id, { otp: newOtp });
        const mailStatus = await sendMail('PCTE Koshish Planning: Your new OTP Code', user.email, `Your new OTP code is ${newOtp}`);

        if (mailStatus) {
            res.status(200).json({ status: true, message: 'New OTP sent successfully!' });
        } else {
            res.status(500).json({ status: false, message: 'Failed to send OTP.' });
        }
    } catch (error) {
        res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
});

const getUser = asyncHandler(async (req, res) => {
    try {
        const user = req.user;
        user.password = undefined;
        user.otp = undefined;
        user.google_id = undefined;
        if (!user) return res.status(404).json({ status: false, message: 'User Not Found' });
        return res.status(200).json({ status: true, message: "User Fetched", user });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
});


const getFaculty = asyncHandler(async (req, res) => {
    try {
        const user = req.user;
        if (user && user.user_type != "Admin") return res.status(404).json({ status: false, message: 'Not Allowed' });
        const faculty = await User.find({ user_type: { $in: ["Teacher", "Convenor"] } })
            .select("-password -otp -__v");
        return res.status(200).json({ status: true, message: "Faculty Fetched", data: faculty });
    } catch {
        res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
});

const forgotPassword = asyncHandler(async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ status: false, message: 'No Account Exists' });

        const otp = crypto.randomInt(100000, 999999).toString(); // Generate OTP
        user.otp = otp; // Save OTP in the user document
        await user.save();

        const mailStatus = await sendMail(`PCTE Koshish Planning: Your OTP Code ${otp} to Reset Password`, user.email, `Your OTP code to Reset Password is ${otp}`);

        if (mailStatus) {
            res.status(200).json({ status: true, message: 'OTP Sent to your Email!' });
        } else {
            res.status(500).json({ status: false, message: 'Failed to send OTP.' });
        }
    } catch (error) {
        res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
});

const changePassword = asyncHandler(async (req, res) => {
    try {
        const { email, otp, password } = req.body;
        const user = await User.findOne({ email, otp });
        if (!user) return res.status(404).json({ status: false, message: 'OTP Not Correct' });
        user.password = password;
        user.otp = null;
        await user.save();
        const mailStatus = await sendMail('PCTE Koshish Planning: Password Changed Successfully ✅', user.email, `PCTE Koshish Planning: Password Changed Successfully ✅`);
        return res.status(200).json({ status: true, message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to send OTP.' });
    }
});

const google_login = asyncHandler(async (req, res) => {
    const { email, google_id, name } = req.body;
    try {
        // Check if the user exists
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ status: false, message: "Account Not Found" });
        } else {
            // If the user exists, validate Google ID
            if (user.google_id && user.google_id !== google_id) {
                return res.status(400).json({ status: false, message: 'Invalid Google ID' });
            }
            // Associate the Google ID with the user
            user.google_id = google_id;
            await user.save();
        }

        user.otp = null;
        await user.save();
        // Generate JWT token for the user
        const token = setUser(user);
        // Notify user about login via email (optional step)
        const mailStatus = await sendMail(
            'PCTE Koshish Planning: You Logged In as User on new Device',
            email,
            `Dear ${name},\n\nYour account has been logged in on a new device.\n\nIf this wasn't you, please contact our support team immediately.`
        );
        if (!mailStatus) {
            console.error("Failed to send login notification email.");
        }
        // Respond with success
        return res.status(200).json({ status: true, message: 'Login successful!', token });
    } catch (error) {
        console.error("Google Login Error:", error);
        return res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
});




module.exports = {
    signup,
    login,
    updateUser,
    verifyOtp,
    resendOtp,
    getUser,
    forgotPassword,
    changePassword,
    google_login,
    getFaculty
};
