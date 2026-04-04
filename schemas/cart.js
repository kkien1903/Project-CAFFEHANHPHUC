let mongoose = require('mongoose');
let itemCartSchema = mongoose.Schema({
    product: {
        type: mongoose.Types.ObjectId,
        ref: 'product',
    },
    quantity: {
        type: Number,
        min: 1,
        default: 1
    },
    size: {
        type: String,
        required: true
    }
}, {
    _id: false
})
let cartSchema = mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'user',
        unique: true,
        required: true
    },
    items: {
        type: [itemCartSchema],
        default: []
    }
})

module.exports = new mongoose.model('cart', cartSchema)