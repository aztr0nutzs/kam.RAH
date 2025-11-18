
const express = require('express');
const { registerUser, loginUser, getProfile } = require('../controllers/userController');
const { body } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post(
    '/register',
    [
        body('name', 'Name is required').not().isEmpty(),
        body('email', 'Please include a valid email').isEmail(),
        body('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
    ],
    registerUser
);

router.post(
    '/login',
    [
        body('email', 'Please include a valid email').isEmail(),
        body('password', 'Password is required').exists(),
    ],
    loginUser
);

router.get('/me', protect, getProfile);

module.exports = router;
