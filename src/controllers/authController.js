const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { use } = require('react');


const generateToken = (userId) => {
    return jwt.sign({ id : userId }, process.env.JWT_SECRET, 
        {
            expiresIn : '7d'
        }
    )
}

exports.register = async (req, res, next) => {
    try {
        const { email, password, username } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ 
        $or: [{ email }, { username }] 
        });

        if (existingUser) {
        const field = existingUser.email === email ? 'Email' : 'Username';
        return res.status(400).json({
            success: false,
            message: `${field} already exists`
    });
    }

    // Create new user
    const user = await User.create({
        email,
        password,
        username
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
        success: true,
        token,
        user: {
            id: user._id,
            email: user.email,
            username: user.username
        }
    });
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Please provide email and password'
        });
        }

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials'
        });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
        return res.status(401).json({
            success: false,
            message: 'Invalid Password'
        });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
        success: true,
        token,
        user: {
            id: user._id,
            email: user.email,
            username: user.username
        }
    });
    } catch (error) {
        next(error);
    }
};

exports.getUser = async(req , res , next) =>{
    try{
        const user = await User.findById(req.user.id);

        if(!user){
            return res.status(404).json({
                success : false, 
                message : 'User not found' 
            });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                username: user.username
            }
        })
    }
    catch(error){
        next(error)
    }
}