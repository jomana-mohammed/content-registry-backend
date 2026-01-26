const {body , validationResult } = require('express-validator');

exports.registerValidation = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .isLength({min:6})
        .withMessage('Password must be at least 6 characters')
        .trim(),
    body('username')
        .isLength({min:3 , max:30})
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores')
        .trim()
]

exports.loginValidation = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];


exports.contentValidation = [
    body('title')
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ max: 100 })
        .withMessage('Title cannot exceed 100 characters')
        .trim()
        .escape(),
    body('content')
        .optional()
        .isLength({ max: 10000 })
        .withMessage('Content cannot exceed 10000 characters')
        .trim()
];


exports.validate = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(400).json({
        success: false,
        errors: errors.array().map(err => ({
            field: err.path,
            message: err.msg
        }))
        });
    }
    next();
};

