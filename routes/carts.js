var express = require('express');
var router = express.Router();
let { checkLogin, checkRole } = require('../utils/authHandler.js')
let cartController = require('../controllers/carts');

router.get('/', checkLogin, async function (req, res, next) {
    try {
        const cartItems = await cartController.GetCartByUserId(req.userId);
        res.send(cartItems);
    } catch (error) {
        res.status(500).send({ message: "Lỗi khi lấy giỏ hàng: " + error.message });
    }
});

router.post('/add-items', checkLogin, async function (req, res, next) {
    try {
        const { product, quantity, size } = req.body;
        const updatedCart = await cartController.AddItemToCart(req.userId, product, quantity, size);
        res.send(updatedCart);
    } catch (error) {
        res.status(500).send({ message: "Lỗi khi thêm sản phẩm: " + error.message });
    }
});

router.post('/decrease-items', checkLogin, async function (req, res, next) {
    try {
        const { product, quantity, size } = req.body;
        const updatedCart = await cartController.DecreaseItemInCart(req.userId, product, quantity, size);
        res.send(updatedCart);
    } catch (error) {
        res.status(500).send({ message: "Lỗi khi giảm sản phẩm: " + error.message });
    }
});

router.post('/remove-item', checkLogin, async function (req, res, next) {
    try {
        const { product, size } = req.body;
        if (!product) return res.status(400).send({ message: "Product ID is required." });

        const updatedCart = await cartController.RemoveItemFromCart(req.userId, product, size);
        res.send(updatedCart);
    } catch (error) {
        res.status(500).send({ message: "Lỗi khi xóa sản phẩm: " + error.message });
    }
});

router.post('/clear', checkLogin, async function (req, res, next) {
    try {
        const updatedCart = await cartController.ClearCart(req.userId);
        res.send(updatedCart);
    } catch (error) {
        res.status(500).send({ message: "Lỗi khi làm rỗng giỏ hàng: " + error.message });
    }
});

module.exports = router;