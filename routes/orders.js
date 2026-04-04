var express = require('express');
var router = express.Router();
let orderController = require('../controllers/orders');
let orderModel = require('../schemas/orders');
let { checkLogin, checkRole } = require('../utils/authHandler.js');

/* GET orders listing. */
router.get('/', checkLogin, async function (req, res, next) {
  try {
    let findQuery = { isDeleted: false };

    // If the user is not an admin, they can only see their own orders.
    if (req.userRole !== 'ADMIN') {
      findQuery.user = req.userId;
    }

    let orders = await orderModel.find(findQuery)
      .populate('user', 'username email fullName')
      .populate('items.product', 'title price sku');

    res.send(orders);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get('/:id', checkLogin, async function (req, res, next) {
  try {
    let order = await orderController.GetOrderById(req.params.id);
    if (order) {
      // Ensure user can only see their own order, unless they are an admin
      if (order.user._id.toString() !== req.userId && req.userRole !== 'ADMIN') {
        return res.status(403).send({ message: "Bạn không có quyền xem đơn hàng này." });
      }
      res.send(order);
    } else {
      res.status(404).send({ message: "id not found" });
    }
  } catch (error) {
    // Forward error to the error handler
    next(error);
  }
});

router.post('/', checkLogin, async function (req, res, next) {
  try {
    const { shippingAddress, paymentMethod } = req.body;
    if (!shippingAddress) {
      return res.status(400).send({ message: "Địa chỉ giao hàng là bắt buộc." });
    }
    const newOrder = await orderController.CreateOrderFromCart(req.userId, { shippingAddress, paymentMethod });
    res.status(201).send(newOrder);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

router.put('/:id', checkLogin, checkRole("ADMIN"), async function (req, res, next) {
  try {
    let id = req.params.id;
    // Only allow updating specific fields like 'status'
    const { status } = req.body;
    if (!status) return res.status(400).send({ message: "Chỉ có thể cập nhật trạng thái (status)." });
    
    const updatedOrder = await orderController.UpdateOrder(id, { status });
    if (!updatedOrder) return res.status(404).send({ message: "id not found" });
    res.send(updatedOrder);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

router.delete('/:id', checkLogin, checkRole("ADMIN"), async function (req, res, next) {
  try {
    // Soft delete the order
    let updatedItem = await orderController.DeleteOrder(req.params.id);
    if (!updatedItem) return res.status(404).send({ message: "id not found" });
    res.send(updatedItem);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});
module.exports = router;