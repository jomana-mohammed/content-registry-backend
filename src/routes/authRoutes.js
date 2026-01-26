const express = require('express');
const { register, login, getUser } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { 
    registerValidation, 
    loginValidation, 
    validate 
} = require('../middleware/validation');

const router = express.Router();

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.get('/me', protect, getUser);

module.exports = router;