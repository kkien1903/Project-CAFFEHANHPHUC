let orderModel = require('../schemas/orders');
const productModel = require('../schemas/products');

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
        if (!items || items.length === 0) {
            throw new Error("Đơn hàng phải có ít nhất một sản phẩm.");
        }

        // Fetch product prices from DB to ensure accuracy
        const productIds = items.map(item => item.product);
        const products = await productModel.find({ '_id': { $in: productIds } });
        const productPriceMap = new Map(products.map(p => [p._id.toString(), p.price]));

        let totalAmount = 0;
        const processedItems = [];

        for (const item of items) {
            const price = productPriceMap.get(item.product.toString());
            if (price === undefined) {
                throw new Error(`Sản phẩm với ID ${item.product} không tồn tại hoặc không có giá.`);
            }
            processedItems.push({
                product: item.product,
                quantity: item.quantity,
                price: price // Use price from DB
            });
            totalAmount += item.quantity * price;
        }

        const newOrder = new orderModel({
            user,
            items: processedItems,
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