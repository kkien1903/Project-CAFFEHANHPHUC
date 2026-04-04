var express = require('express');
var router = express.Router();
const paymentController = require('../controllers/payments');
const { checkLogin, checkRole } = require('../utils/authHandler');

// Create a new payment for a reservation
router.post('/', checkLogin, async function (req, res, next) {
    try {
        const { reservation, method } = req.body;
        if (!reservation || !method) {
            return res.status(400).send({ message: "Reservation ID and payment method are required." });
        }
        const paymentData = {
            user: req.userId,
            reservation,
            method
        };
        const newPayment = await paymentController.CreatePayment(paymentData);
        // In a real application, you would redirect the user to the payment gateway here
        // or return the necessary info for the frontend to do so.
        res.status(201).send(newPayment);
    } catch (error) {
        res.status(500).send({ message: "Lỗi khi tạo thanh toán: " + error.message });
    }
});

// Get all payments (Admin only)
router.get('/', checkLogin, checkRole('ADMIN'), async function (req, res, next) {
    try {
        const payments = await paymentController.GetAllPayments();
        res.send(payments);
    } catch (error) {
        res.status(500).send({ message: "Lỗi khi lấy danh sách thanh toán: " + error.message });
    }
});

// Get a specific payment by ID
router.get('/:id', checkLogin, async function (req, res, next) {
    try {
        const payment = await paymentController.GetPaymentById(req.params.id);
        if (!payment) {
            return res.status(404).send({ message: "Payment not found." });
        }
        // Ensure user owns the payment or is an admin
        if (payment.user._id.toString() !== req.userId && req.userRole !== 'ADMIN') {
            return res.status(403).send({ message: "Bạn không có quyền truy cập thanh toán này." });
        }
        res.send(payment);
    } catch (error) {
        res.status(500).send({ message: "Lỗi: " + error.message });
    }
});

// Example webhook for a successful payment
router.post('/webhook/success', async function (req, res, next) {
    try {
        // In a real webhook, you would validate the request source
        const { paymentId, transactionDetails } = req.body;
        const updatedPayment = await paymentController.HandleSuccessfulPayment(paymentId, transactionDetails);
        res.status(200).send({ message: "Payment updated successfully.", payment: updatedPayment });
    } catch (error) {
        // Log the error but send a generic response to the webhook provider
        console.error("Webhook error:", error);
        res.status(500).send({ message: "Internal server error." });
    }
});


module.exports = router;