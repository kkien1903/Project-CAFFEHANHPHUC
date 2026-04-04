let cartModel = require('../schemas/cart');
const productModel = require('../schemas/products');

module.exports = {
    GetCartByUserId: async function (userId) {
        const cart = await cartModel.findOne({ user: userId })
            .populate({
                path: 'items.product',
                model: 'product',
                select: 'title price images slug'
            });
        return cart;
    },
    AddItemToCart: async function (userId, productId, quantity, size) {
        const product = await productModel.findById(productId);
        if (!product) {
            throw new Error("Sản phẩm không tồn tại.");
        }
        if (!size || !product.sizeOptions.includes(size)) {
            throw new Error(`Size '${size}' không hợp lệ cho sản phẩm này.`);
        }

        let currentCart = await cartModel.findOne({ user: userId });

        // If cart doesn't exist, create one. This is a good practice.
        if (!currentCart) {
            currentCart = new cartModel({ user: userId, items: [] });
        }

        const index = currentCart.items.findIndex(
            item => item.product.equals(productId) && item.size === size
        );

        if (index < 0) {
            currentCart.items.push({ product: productId, quantity: quantity, size: size });
        } else {
            currentCart.items[index].quantity += quantity;
        }

        await currentCart.save();
        return await currentCart.populate({ path: 'items.product' });
    },
    DecreaseItemInCart: async function (userId, productId, quantity, size) {
        let currentCart = await cartModel.findOne({ user: userId });

        // If no cart, do nothing.
        if (!currentCart) {
            return null;
        }

        const index = currentCart.items.findIndex(
            item => item.product.equals(productId) && item.size === size
        );

        if (index > -1) {
            if (currentCart.items[index].quantity > quantity) {
                currentCart.items[index].quantity -= quantity;
            } else {
                // If quantity to decrease is same or more, remove the item
                currentCart.items.splice(index, 1);
            }
        }

        await currentCart.save();
        return await currentCart.populate({ path: 'items.product' });
    },
    RemoveItemFromCart: async function (userId, productId, size) {
        let currentCart = await cartModel.findOne({ user: userId });
        if (!currentCart) {
            return null;
        }
        const index = currentCart.items.findIndex(
            item => item.product.equals(productId) && item.size === size
        );
        if (index > -1) {
            currentCart.items.splice(index, 1);
        }
        await currentCart.save();
        return await currentCart.populate({ path: 'items.product' });
    },
    ClearCart: async function (userId) {
        let currentCart = await cartModel.findOne({ user: userId });
        if (!currentCart) {
            // If no cart exists, we can treat it as already clear.
            // Return a structure consistent with an empty cart.
            return { user: userId, items: [] };
        }
        currentCart.items = [];
        await currentCart.save();
        // Return the now-empty cart, no need to populate since items is empty.
        return currentCart;
    }
};