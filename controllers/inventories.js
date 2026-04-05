let inventoryModel = require('../schemas/inventories');

module.exports = {
    GetAllInventories: async function () {
        return await inventoryModel.find({})
            .populate({
                path: 'product',
                select: 'title price category images isDeleted',
                match: { isDeleted: false }
            });
    },

    GetInventoryByProductId: async function (productId) {
        return await inventoryModel.findOne({ product: productId }).populate('product');
    },

    UpdateInventory: async function (productId, updateData) {
        return await inventoryModel.findOneAndUpdate({ product: productId }, updateData, { new: true, upsert: true });
    },

    IncreaseStock: async function (productId, quantity) {
        const inventoryItem = await inventoryModel.findOne({ product: productId });
        if (inventoryItem) {
            inventoryItem.stock += quantity;
            return await inventoryItem.save();
        }
        throw new Error(`Không tìm thấy kho hàng cho sản phẩm ID: ${productId}`);
    },

    DecreaseStock: async function (productId, quantity) {
        const inventoryItem = await inventoryModel.findOne({ product: productId });
        if (inventoryItem) {
            if (inventoryItem.stock >= quantity) {
                inventoryItem.stock -= quantity;
                inventoryItem.soldCount += quantity; // Tăng số lượng đã bán
                return await inventoryItem.save();
            } else {
                throw new Error("Sản phẩm không đủ số lượng trong kho.");
            }
        }
        throw new Error(`Không tìm thấy kho hàng cho sản phẩm ID: ${productId}`);
    }
};