const User = require('../models/User');
const Content = require('../models/Content');


// Get user profile by username
// GET /api/user/:username
exports.getUserProfile = async (req, res, next) => {
    try {
        const { username } = req.params;

        const user = await User.findOne({ username });

        if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
        }

        const contents = await Content.find({ userId: user._id })
        .sort({ createdAt: -1 });

        res.status(200).json({
        success: true,
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt
        },
        contents
        });
    } catch (error) {
        next(error);
    }
};