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
        const { product, quantity } = req.body;
        const updatedCart = await cartController.AddItemToCart(req.userId, product, quantity);
        res.send(updatedCart);
    } catch (error) {
        res.status(500).send({ message: "Lỗi khi thêm sản phẩm: " + error.message });
    }
});

router.post('/decrease-items', checkLogin, async function (req, res, next) {
    try {
        const { product, quantity } = req.body;
        const updatedCart = await cartController.DecreaseItemInCart(req.userId, product, quantity);
        res.send(updatedCart);
    } catch (error) {
        res.status(500).send({ message: "Lỗi khi giảm sản phẩm: " + error.message });
    }
});

module.exports = router;