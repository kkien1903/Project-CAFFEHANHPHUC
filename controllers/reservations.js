const reservationModel = require('../schemas/reservations');
const productModel = require('../schemas/products');
const mongoose = require('mongoose');
const inventoryController = require('./inventories');

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
            
            // Kiểm tra tồn kho trước khi giữ chỗ
            const inventoryItem = await inventoryController.GetInventoryByProductId(item.product);
            if (!inventoryItem || inventoryItem.stock < item.quantity) {
                throw new Error(`Sản phẩm (ID: ${item.product}) không đủ số lượng trong kho để giữ chỗ.`);
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

        const savedReservation = await newReservation.save();

        // Trừ tồn kho sau khi đã tạo giữ chỗ thành công
        for (const item of processedItems) {
            await inventoryController.DecreaseStock(item.product, item.quantity);
        }

        return savedReservation;
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
        const reservation = await reservationModel.findById(id);
        if (!reservation) throw new Error("Không tìm thấy đơn giữ chỗ");

        // Hoàn lại kho nếu đơn đang 'actived' bị đổi thành 'expired' hoặc 'cancelled'
        if (reservation.status === 'actived' && (status === 'expired' || status === 'cancelled')) {
            for (const item of reservation.items) {
                await inventoryController.IncreaseStock(item.product, item.quantity);
            }
        }
        
        reservation.status = status;
        return await reservation.save();
    },
    CancelReservation: async function (id) {
        const reservation = await reservationModel.findById(id);
        if (!reservation) throw new Error("Không tìm thấy đơn giữ chỗ");

        if (reservation.status === 'actived') {
            for (const item of reservation.items) {
                await inventoryController.IncreaseStock(item.product, item.quantity);
            }
        }
        reservation.status = 'cancelled';
        return await reservation.save();
    }
};