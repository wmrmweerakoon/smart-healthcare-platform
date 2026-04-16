const express = require('express');
const router = express.Router();
const {
    getUsers,
    deleteUser,
    verifyDoctor,
    getAppointments,
    getPayments,
    getDashboardStats,
    getPlatformAnalytics,
    addUser,
    updateUser,
    cancelAppointment,
    rescheduleAppointment,
} = require('../controllers/adminController');

// All routes here are already protected by API Gateway (Admin Only)

router.get('/users', getUsers);
router.post('/user', addUser);
router.put('/user/:id', updateUser);
router.delete('/user/:id', deleteUser);
router.put('/verify-doctor/:id', verifyDoctor);
router.get('/appointments', getAppointments);
router.put('/appointment/cancel/:id', cancelAppointment);
router.put('/appointment/reschedule/:id', rescheduleAppointment);
router.get('/payments', getPayments);
router.get('/stats', getDashboardStats);
router.get('/analytics', getPlatformAnalytics);




module.exports = router;
