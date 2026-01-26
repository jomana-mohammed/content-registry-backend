const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    try {
        let token;

        // Check authorization header
        const authHeader = req.headers.authorization || req.headers.Authorization;
        
        console.log('Full auth header:', authHeader);

        if (authHeader) {
        // Handle "Bearer token" format
        if (authHeader.startsWith('Bearer ') || authHeader.startsWith('bearer ')) {
            // Split and get token, trim any whitespace
            const parts = authHeader.split(' ');
            token = parts[1] ? parts[1].trim() : null;
        } else {
            // If no "Bearer" prefix, assume the header IS the token
            token = authHeader.trim();
        }
        }

        console.log('Extracted token:', token ? token.substring(0, 30) + '...' : 'NONE');

        if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route. No token provided.'
        });
        }

        try {
        // Verify token
        console.log('Verifying with JWT_SECRET:', process.env.JWT_SECRET ? 'EXISTS' : 'MISSING');
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token decoded successfully. User ID:', decoded.id);

        // Get user from token
        const user = await User.findById(decoded.id);

        if (!user) {
            console.log('User not found in database for ID:', decoded.id);
            return res.status(401).json({
            success: false,
            message: 'User not found'
            });
        }

        req.user = user;
        console.log('User authenticated:', user.username);
        next();

        } catch (error) {
        console.error('Token verification failed:', error.name, error.message);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
            success: false,
            message: 'Token expired'
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
            success: false,
            message: 'Invalid token: ' + error.message
            });
        }
        
        return res.status(401).json({
            success: false,
            message: 'Token verification failed: ' + error.message
        });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        next(error);
    }
};