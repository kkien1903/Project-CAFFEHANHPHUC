const paymentModel = require('../schemas/payments');
const reservationModel = require('../schemas/reservations');
const mongoose = require('mongoose');

module.exports = {
    CreatePayment: async function (paymentData) {
        const { user, reservation, method } = paymentData;

        const reservationDoc = await reservationModel.findById(reservation);
        if (!reservationDoc) {
            throw new Error("Reservation không tồn tại.");
        }
        if (reservationDoc.status !== 'actived') {
            throw new Error(`Reservation đang ở trạng thái ${reservationDoc.status}, không thể thanh toán.`);
        }

        const newPayment = new paymentModel({
            user,
            reservation,
            method,
            amount: reservationDoc.totalAmount, // Get amount from reservation to ensure correctness
            currency: 'VND',
            status: 'pending'
        });

        return await newPayment.save();
    },
    GetPaymentById: async function (id) {
        return await paymentModel.findById(id)
            .populate('user', 'username')
            .populate('reservation');
    },
    GetAllPayments: async function () {
        return await paymentModel.find({})
            .populate('user', 'username')
            .populate('reservation', 'totalAmount status')
            .sort({ createdAt: -1 });
    },
    HandleSuccessfulPayment: async function (paymentId, transactionDetails) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const payment = await paymentModel.findById(paymentId).session(session);
            if (!payment) {
                throw new Error("Payment không tồn tại.");
            }
            if (payment.status === 'paid') {
                // Already processed
                await session.abortTransaction();
                session.endSession();
                return payment;
            }

            // Update payment
            payment.status = 'paid';
            payment.paidAt = new Date();
            payment.transactionId = transactionDetails.id; // Example field
            payment.providerResponse = transactionDetails.response; // Example field
            await payment.save({ session });

            // Update reservation
            await reservationModel.findByIdAndUpdate(payment.reservation, { status: 'paid' }, { session });

            // Here you would also decrease inventory stock
            // This part is complex and depends on your inventory logic

            await session.commitTransaction();
            session.endSession();
            return payment;

        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    },
    HandleFailedPayment: async function (paymentId, transactionDetails) {
        const payment = await paymentModel.findById(paymentId);
        if (!payment) {
            throw new Error("Payment không tồn tại.");
        }
        payment.status = 'failed';
        payment.failedAt = new Date();
        payment.providerResponse = transactionDetails.response;
        return await payment.save();
    }
};