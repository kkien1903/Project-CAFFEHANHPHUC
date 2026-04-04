let cartModel = require('../schemas/cart');

module.exports = {
    GetCartByUserId: async function (userId) {
        let cart = await cartModel.findOne({ user: userId }).populate('items.product');
        if (cart) {
            return cart.items;
        }
        return []; // Return empty array if no cart
    },

    AddItemToCart: async function (userId, product, quantity) {
        let currentCart = await cartModel.findOne({ user: userId });

        // If cart doesn't exist, create one. This is a good practice.
        if (!currentCart) {
            currentCart = new cartModel({ user: userId, items: [] });
        }

        const index = currentCart.items.findIndex(e => e.product.equals(product));

        if (index < 0) {
            currentCart.items.push({ product: product, quantity: quantity });
        } else {
            currentCart.items[index].quantity += quantity;
        }

        await currentCart.save();
        return await currentCart.populate('items.product');
    },

    DecreaseItemInCart: async function (userId, product, quantity) {
        let currentCart = await cartModel.findOne({ user: userId });

        // If no cart, do nothing.
        if (!currentCart) {
            return null;
        }

        const index = currentCart.items.findIndex(e => e.product.equals(product));

        if (index > -1) {
            if (currentCart.items[index].quantity > quantity) {
                currentCart.items[index].quantity -= quantity;
            } else {
                // If quantity to decrease is same or more, remove the item
                currentCart.items.splice(index, 1);
            }
        }

        await currentCart.save();
        return await currentCart.populate('items.product');
    }
};