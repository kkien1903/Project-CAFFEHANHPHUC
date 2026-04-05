const mongoose = require("mongoose");

const itemOrderSchema = new mongoose.Schema({
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
    },
    price: {
        type: Number,
        required: true
    }
}, {
    _id: false
});

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Types.ObjectId,
            ref: 'user',
            required: true
        },
        items: {
            type: [itemOrderSchema],
            default: []
        },
        totalAmount: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: ['PENDING', 'SHIPPING', 'COMPLETED', 'CANCELLED', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'],
            default: 'PENDING'
        },
        shippingAddress: {
            type: String,
            required: true
        },
        fullName: {
            type: String,
            default: ''
        },
        phone: {
            type: String,
            default: ''
        },
        note: {
            type: String,
            default: ''
        },
        paymentMethod: {
            type: String,
            default: 'COD'
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("order", orderSchema);