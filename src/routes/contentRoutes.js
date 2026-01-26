const express = require('express');
const {
    createContent,
    getContentById,
    getUserContent,
    getMyContent,
    updateContent,
    deleteContent
} = require('../controllers/contentController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { contentValidation, validate } = require('../middleware/validation');

const router = express.Router();

// Create content
router.post(
    '/', 
    protect, 
    upload.single('file'), 
    contentValidation, 
    validate, 
    createContent
);

// Get my content
router.get('/my-content', protect, getMyContent);

// Get user content by userId
router.get('/user/:userId', getUserContent);

// Get specific content by ID
router.get('/:id', getContentById);

// Update content
router.patch(
    '/:id',
    protect,
    upload.single('file'), // Allow file upload for file replacement
    contentValidation,
    validate,
    updateContent
);

// Delete content
router.delete('/:id', protect, deleteContent);

module.exports = router;