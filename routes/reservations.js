var express = require('express');
var router = express.Router();
const reservationController = require('../controllers/reservations');
const reservationModel = require('../schemas/reservations');
const { checkLogin, checkRole } = require('../utils/authHandler');

// Create a new reservation from cart items
router.post('/', checkLogin, async function (req, res, next) {
    try {
        const { items } = req.body;
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).send({ message: "Items are required to create a reservation." });
        }
        const newReservation = await reservationController.CreateReservation(req.userId, items);
        res.status(201).send(newReservation);
    } catch (error) {
        res.status(500).send({ message: "Lỗi khi tạo reservation: " + error.message });
    }
});

// Get all reservations for the logged-in user
router.get('/', checkLogin, async function (req, res, next) {
    try {
        const reservations = await reservationModel.find({ user: req.userId, isDeleted: false })
            .populate('items.product', 'title images')
            .sort({ createdAt: -1 });
        res.send(reservations);
    } catch (error) {
        res.status(500).send({ message: "Lỗi khi lấy danh sách reservation: " + error.message });
    }
});

// Get all reservations (Admin only)
router.get('/all', checkLogin, checkRole('ADMIN'), async function (req, res, next) {
    try {
        const reservations = await reservationModel.find({ isDeleted: false })
            .populate('user', 'username email')
            .populate('items.product', 'title')
            .sort({ createdAt: -1 });
        res.send(reservations);
    } catch (error) {
        res.status(500).send({ message: "Lỗi khi lấy tất cả reservation: " + error.message });
    }
});


// Get a specific reservation by ID
router.get('/:id', checkLogin, async function (req, res, next) {
    try {
        const reservation = await reservationModel.find({ _id: req.params.id, isDeleted: false });
        if (reservation.length > 0) {
            // Ensure the user owns the reservation or is an admin
            if (reservation[0].user.toString() !== req.userId && req.userRole !== 'ADMIN') {
                return res.status(403).send({ message: "Bạn không có quyền truy cập reservation này." });
            }
            res.send(reservation);
        } else {
            return res.status(404).send({ message: "id not found" });
        }
    } catch (error) {
        res.status(404).send({ message: "id not found" });
    }
});

// Cancel a reservation
router.put('/:id/cancel', checkLogin, async function (req, res, next) {
    try {
        const reservation = await reservationController.GetReservationById(req.params.id);
        if (!reservation) {
            return res.status(404).send({ message: "Reservation not found." });
        }
        if (reservation.user._id.toString() !== req.userId) {
            return res.status(403).send({ message: "Bạn không có quyền hủy reservation này." });
        }
        if (reservation.status !== 'actived') {
            return res.status(400).send({ message: `Không thể hủy reservation với trạng thái ${reservation.status}.` });
        }
        const cancelledReservation = await reservationController.CancelReservation(req.params.id);
        res.send(cancelledReservation);
    } catch (error) {
        res.status(500).send({ message: "Lỗi khi hủy reservation: " + error.message });
    }
});

module.exports = router;