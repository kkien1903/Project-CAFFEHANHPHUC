var express = require('express');
var router = express.Router();
let orderController = require('../controllers/orders');
let { checkLogin } = require('../utils/authHandler.js');

/* GET orders listing. */
router.get('/', checkLogin, async function (req, res, next) {
  try {
    // Add role check if only admins can see all orders
    let orders = await orderController.GetAllOrders();
    res.send(orders);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get('/:id', checkLogin, async function (req, res, next) {
  try {
    let result = await orderController.GetOrderById(req.params.id);
    if (result) {
      // Add check to ensure user can only see their own order, unless they are admin
      res.send(result);
    } else {
      res.status(404).send({ message: "Order not found" });
    }
  } catch (error) {
    res.status(400).send({ message: "Invalid Order ID" });
  }
});

router.post('/', checkLogin, async function (req, res, next) {
  try {
    let newItem = await orderController.CreateOrder({
      ...req.body,
      user: req.userId // Assign logged in user to the order
    });
    res.status(201).send(newItem);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

router.put('/:id', checkLogin, async function (req, res, next) {
  try {
    // Add role check, only admin should update orders
    let updatedItem = await orderController.UpdateOrder(req.params.id, req.body);
    if (!updatedItem) {
      return res.status(404).send({ message: "Order not found" });
    }
    res.send(updatedItem);
  } catch (err) {
    res.status(400).send({ message: "Invalid ID or update failed" });
  }
});

router.delete('/:id', checkLogin, async function (req, res, next) {
  try {
    // Add role check, only admin should delete orders
    let updatedItem = await orderController.DeleteOrder(req.params.id);
    if (!updatedItem) return res.status(404).send({ message: "Order not found" });
    res.send(updatedItem);
  } catch (err) {
    res.status(400).send({ message: "Invalid ID or delete failed" });
  }
});
module.exports = router;