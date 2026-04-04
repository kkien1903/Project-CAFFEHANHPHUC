let orderModel = require('../schemas/orders');

module.exports = {
    GetAllOrders: async function () {
        return await orderModel.find({ isDeleted: false })
            .populate('user', 'username email')
            .populate('items.product', 'title price');
    },

    GetOrderById: async function (id) {
        return await orderModel.findOne({ _id: id, isDeleted: false })
            .populate('user')
            .populate('items.product');
    },

    CreateOrder: async function (orderData) {
        const { user, items, shippingAddress, paymentMethod } = orderData;

        // It's better to fetch product prices from DB to ensure accuracy
        // For now, we trust the input `item.price`
        let totalAmount = 0;
        if (items && items.length > 0) {
            items.forEach(item => {
                totalAmount += item.quantity * item.price;
            });
        }

        const newOrder = new orderModel({
            user,
            items,
            totalAmount,
            shippingAddress,
            paymentMethod
        });
        return await newOrder.save();
    },

    UpdateOrder: async function (id, updateData) {
        const { items, ...otherData } = updateData;

        // Recalculate totalAmount if items are part of the update
        if (items && Array.isArray(items)) {
            let totalAmount = 0;
            items.forEach(item => {
                totalAmount += item.quantity * item.price;
            });
            otherData.totalAmount = totalAmount;
            otherData.items = items; // make sure items are included in the update
        }

        return await orderModel.findByIdAndUpdate(id, otherData, { new: true });
    },

    DeleteOrder: async function (id) {
        return await orderModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    }
};