let inventoryModel = require('../schemas/inventories');

module.exports = {
    GetAllInventories: async function () {
        return await inventoryModel.find({})
            .populate({
                path: 'product',
                select: 'title price'
            });
    },

    IncreaseStock: async function (productId, quantity) {
        const inventoryItem = await inventoryModel.findOne({ product: productId });
        if (inventoryItem) {
            inventoryItem.stock += quantity;
            return await inventoryItem.save();
        }
        return null; // Or throw an error
    },

    DecreaseStock: async function (productId, quantity) {
        const inventoryItem = await inventoryModel.findOne({ product: productId });
        if (inventoryItem) {
            if (inventoryItem.stock >= quantity) {
                inventoryItem.stock -= quantity;
                return await inventoryItem.save();
            } else {
                throw new Error("Sản phẩm không đủ số lượng");
            }
        }
        return null; // Or throw an error
    }
};