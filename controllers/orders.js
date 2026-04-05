let orderModel = require('../schemas/orders');
const productModel = require('../schemas/products');
const cartModel = require('../schemas/cart');
const paymentModel = require('../schemas/payments');
const inventoryController = require('./inventories');
const mongoose = require('mongoose');

module.exports = {
    // Hàm tạo đơn hàng chuẩn: Luôn luôn tạo mới (không bao giờ ghi đè đơn cũ)
    CreateOrder: async function (orderData) {
        const newOrder = new orderModel(orderData);
        const savedOrder = await newOrder.save();

        // Tự động sinh Payment liên kết chờ thanh toán
        const newPayment = new paymentModel({
            user: orderData.user,
            order: savedOrder._id,
            method: orderData.paymentMethod ? orderData.paymentMethod.toLowerCase() : 'cod',
            amount: orderData.totalAmount,
            status: 'pending'
        });
        await newPayment.save();

        // Trừ số lượng tồn kho và tăng lượt bán
        if (orderData.items && orderData.items.length > 0) {
            for (const item of orderData.items) {
                try {
                    await inventoryController.DecreaseStock(item.product, item.quantity);
                } catch (err) {
                    console.error("Không thể trừ tồn kho:", err.message);
                }
            }
        }

        return savedOrder;
    },

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
    CreateOrderFromCart: async function (userId, orderInfo) {
        const { shippingAddress, paymentMethod } = orderInfo;
        // Ghi chú: Đã loại bỏ Transaction để tương thích với môi trường MongoDB standalone.
        // Điều này có nghĩa là nếu có lỗi xảy ra ở giữa quá trình,
        // các thay đổi sẽ không được tự động phục hồi.

        try {
            // 1. Lấy giỏ hàng của người dùng
            const cart = await cartModel.findOne({ user: userId });
            if (!cart || cart.items.length === 0) {
                throw new Error("Giỏ hàng của bạn đang trống.");
            }

            // 2. Lấy thông tin chi tiết sản phẩm và kiểm tra
            await cart.populate({ path: 'items.product' });

            let totalAmount = 0;
            const orderItems = [];

            // 3. Xác thực tất cả các mục trong giỏ hàng trước khi thực hiện bất kỳ thay đổi nào
            for (const item of cart.items) {
                if (!item.product || item.product.isDeleted) {
                    throw new Error(`Sản phẩm "${item.product?.title || 'không xác định'}" không còn tồn tại.`);
                }
                const inventoryItem = await inventoryController.GetInventoryByProductId(item.product._id);
                if (!inventoryItem || inventoryItem.stock < item.quantity) {
                    throw new Error(`Sản phẩm "${item.product.title}" (size ${item.size}) không đủ số lượng trong kho.`);
                }
            }

            // 4. Chuẩn bị các mục cho đơn hàng và tính tổng tiền
            for (const item of cart.items) {
                const price = item.product.price;
                totalAmount += item.quantity * price;

                orderItems.push({
                    product: item.product._id,
                    quantity: item.quantity,
                    size: item.size,
                    price: price
                });
            }

            // 5. Tạo đơn hàng
            const newOrder = new orderModel({
                user: userId,
                items: orderItems,
                totalAmount,
                shippingAddress,
                paymentMethod
            });
            const savedOrder = await newOrder.save();

            // 5.1 Tạo bản ghi thanh toán tương ứng cho đơn hàng
            const newPayment = new paymentModel({
                user: userId,
                order: savedOrder._id,
                method: paymentMethod ? paymentMethod.toLowerCase() : 'cod', // Chuyển COD -> cod, BANK_TRANSFER -> bank_transfer
                amount: totalAmount,
                status: 'pending'
            });
            await newPayment.save();

            // 6. Giảm số lượng tồn kho (sau khi đã chắc chắn tạo được đơn hàng)
            // Lưu ý: Nếu bước này thất bại, đơn hàng đã được tạo nhưng tồn kho chưa bị trừ.
            // Đây là một sự đánh đổi khi không sử dụng transaction.
            for (const item of cart.items) {
                await inventoryController.DecreaseStock(item.product._id, item.quantity);
            }

            // 7. Xóa giỏ hàng
            cart.items = [];
            await cart.save();

            return savedOrder;
        } catch (error) {
            // Vì không có transaction, không thể tự động rollback.
            // Cần có cơ chế xử lý lỗi phức tạp hơn ở đây nếu muốn hệ thống an toàn tuyệt đối.
            throw error; // Ném lỗi ra để route xử lý
        }
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