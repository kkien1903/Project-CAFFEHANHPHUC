const reservationModel = require('../schemas/reservations');
const productModel = require('../schemas/products');
const mongoose = require('mongoose');

module.exports = {
    CreateReservation: async function (userId, items) {
        let totalAmount = 0;
        const processedItems = [];

        // Fetch all product prices in one go to be efficient
        const productIds = items.map(item => item.product);
        const products = await productModel.find({ '_id': { $in: productIds } });
        const productPriceMap = new Map(products.map(p => [p._id.toString(), p.price]));

        for (const item of items) {
            const price = productPriceMap.get(item.product);
            if (!price) {
                throw new Error(`Sản phẩm với ID ${item.product} không tồn tại hoặc không có giá.`);
            }
            const subtotal = price * item.quantity;
            totalAmount += subtotal;
            processedItems.push({
                product: item.product,
                quantity: item.quantity,
                price: price,
                subtotal: subtotal
            });
        }

        const newReservation = new reservationModel({
            user: userId,
            items: processedItems,
            totalAmount: totalAmount,
            // Reservation expires in 30 minutes
            expiredAt: new Date(Date.now() + 30 * 60 * 1000)
        });

        return await newReservation.save();
    },
    GetReservationById: async function (id) {
        return await reservationModel.findOne({ _id: id, isDeleted: false })
            .populate('user', 'username email')
            .populate('items.product', 'title images');
    },
    GetAllUserReservations: async function (userId) {
        return await reservationModel.find({ user: userId, isDeleted: false })
            .populate('items.product', 'title images')
            .sort({ createdAt: -1 });
    },

    GetAllReservations: async function () {
        return await reservationModel.find({ isDeleted: false })
            .populate('user', 'username email')
            .populate('items.product', 'title')
            .sort({ createdAt: -1 });
    },
    UpdateReservationStatus: async function (id, status) {
        return await reservationModel.findByIdAndUpdate(id, { status: status }, { new: true });
    },
    CancelReservation: async function (id) {
        return await reservationModel.findByIdAndUpdate(id, { status: 'cancelled' }, { new: true });
    }
};