const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    product: {
        type: mongoose.Types.ObjectId,
        ref: 'product',
        required: true
    },
    stock: {
        type: Number,
        default: 0
    },
    soldCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('inventory', inventorySchema);