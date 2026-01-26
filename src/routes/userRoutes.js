const express = require('express');
const { getUserProfile } = require('../controllers/userController');

const router = express.Router();

router.get('/:username', getUserProfile);

module.exports = router;