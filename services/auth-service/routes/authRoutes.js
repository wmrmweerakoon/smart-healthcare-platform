const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getMe,
    registerValidation,
    loginValidation,
    adminCreateUser,
    updateExistingUser,
    getUserById,
} = require('../controllers/authController');


// ... existing routes ...

// Internal Admin routes
router.post('/internal/admin/create-user', adminCreateUser);
router.put('/internal/admin/update-user/:id', updateExistingUser);
router.get('/internal/user/:id', getUserById);


const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Protected routes
router.get('/me', protect, getMe);

module.exports = router;
