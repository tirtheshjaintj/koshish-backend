const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Class = require('../models/class.model');
const JWT_SECRET = process.env.JWT_SECRET;
const expiresIn = process.env.TOKEN_EXPIRATION;

function setUser(user) {
    return jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn });
}
async function getUser(token) {
    if (!token) return null; 
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log(decoded);
        let user = await User.findById(decoded.id);
        if(!user){
            user=await Class.findById(decoded.id);
            if(user){
                user={...user._doc ,user_type:"Class"};
            }
        }
        return user;
    } catch (err) {
        console.log(err);
        return null;
    }
}


function setClassUser(classDetail) {
    return jwt.sign({ id: classDetail._id }, JWT_SECRET, { expiresIn });
}
async function getClassUser(token) {
    if (!token) return null; 
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log(decoded)
        const user = await Class.findById(decoded.id);
        
        return user;
    } catch (err) {
        console.log(err);
        return null;
    }
}

module.exports = { getUser, setUser,setClassUser,getClassUser };
