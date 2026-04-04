var express = require('express');
var router = express.Router();
let { checkLogin, checkRole } = require('../utils/authHandler.js')
let cartController = require('../controllers/carts');

router.get('/', checkLogin, async function (req, res, next) {
    try {
        const cart = await cartController.GetCartByUserId(req.userId);
        // If user has no cart yet, return a standard empty cart structure
        if (!cart) {
            return res.send({ user: req.userId, items: [] });
        }
        res.send(cart);
    } catch (error) {
        res.status(500).send({ message: "Lỗi khi lấy giỏ hàng: " + error.message });
    }
});

router.post('/add-items', checkLogin, async function (req, res, next) {
    try {
        const { product, quantity, size } = req.body;
        if (!product || !quantity || !size) {
            return res.status(400).send({ message: "Cần cung cấp đủ ID sản phẩm, số lượng và size." });
        }
        const updatedCart = await cartController.AddItemToCart(req.userId, product, quantity, size);
        res.send(updatedCart);
    } catch (error) {
        res.status(400).send({ message: "Lỗi khi thêm sản phẩm: " + error.message });
    }
});

router.post('/decrease-items', checkLogin, async function (req, res, next) {
    try {
        const { product, quantity, size } = req.body;
        if (!product || !quantity || !size) {
            return res.status(400).send({ message: "Cần cung cấp đủ ID sản phẩm, số lượng và size." });
        }
        const updatedCart = await cartController.DecreaseItemInCart(req.userId, product, quantity, size);
        res.send(updatedCart);
    } catch (error) {
        res.status(400).send({ message: "Lỗi khi giảm sản phẩm: " + error.message });
    }
});

router.post('/remove-item', checkLogin, async function (req, res, next) {
    try {
        const { product, size } = req.body; // need product ID and size
        if (!product || !size) return res.status(400).send({ message: "Cần có ID sản phẩm và size." });

        const updatedCart = await cartController.RemoveItemFromCart(req.userId, product, size);
        res.send(updatedCart);
    } catch (error) {
        res.status(400).send({ message: "Lỗi khi xóa sản phẩm: " + error.message });
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