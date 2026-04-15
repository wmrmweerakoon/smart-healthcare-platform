const express = require('express');
const router = express.Router();
const {
    createPayment,
    verifyPayment,
    getMyPayments,
    getAllPayments,
    getPaymentById,
} = require('../controllers/paymentController');

// POST /create-payment  — Create a new payment intent
router.post('/create-payment', createPayment);

// POST /verify-payment  — Verify / confirm a payment
router.post('/verify-payment', verifyPayment);

// GET  /my-payments     — Get payments for authenticated user
router.get('/my-payments', getMyPayments);

// GET  /all             — Get all payments (admin usage)
router.get('/all', getAllPayments);

// GET  /:id             — Get a single payment by ID
router.get('/:id', getPaymentById);

module.exports = router;
