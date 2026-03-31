const express = require('express');
const router = express.Router();
const {
    getUsers,
    deleteUser,
    verifyDoctor,
    getAppointments,
    getPayments,
} = require('../controllers/adminController');

// All routes here are already protected by API Gateway (Admin Only)

router.get('/users', getUsers);
router.delete('/user/:id', deleteUser);
router.put('/verify-doctor/:id', verifyDoctor);
router.get('/appointments', getAppointments);
router.get('/payments', getPayments);

module.exports = router;
