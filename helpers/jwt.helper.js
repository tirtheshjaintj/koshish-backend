const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const JWT_SECRET = process.env.JWT_SECRET;
const expiresIn = process.env.TOKEN_EXPIRATION;

function setUser(user) {
    return jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn });
}
async function getUser (token) {
    if (!token) return null; 
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // console.log(decoded)
        const user = await User.findById(decoded.id)
        return user;
    } catch (err) {
        console.log(err);
        return null;
    }
}

module.exports = { getUser, setUser };
