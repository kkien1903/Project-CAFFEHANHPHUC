let mongoose = require('mongoose');
let productSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique:true
    },
    sku: {
        type: String,
        required: true,
        unique: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        default: ""
    }, price: {
        type: Number,
        default: 0
    },
    category: {
        type: mongoose.Types.ObjectId,
        ref: 'category',
        required: true
    },
    beanType: {
        type: String,
        enum: ['Arabica', 'Robusta', 'Blend', 'Other'],
        default: 'Blend'
    },
    roastLevel: {
        type: String,
        enum: ['Light', 'Medium', 'Dark', 'Espresso', 'Other'],
        default: 'Medium'
    },
    origin: {
        type: String,
        default: ''
    },
    sizeOptions: {
        type: [String],
        default: []
    },
    isAvailable: {
        type: Boolean,
        default: true,
        required: true
    },
    images: {
        type: [String],
        default: ['https://niteair.co.uk/wp-content/uploads/2023/08/default-product-image.png']
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})
module.exports = mongoose.model('product', productSchema);