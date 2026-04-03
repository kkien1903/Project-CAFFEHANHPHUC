var express = require('express');
var router = express.Router();
let orderModel = require('../schemas/orders');

/* GET orders listing. */
router.get('/', async function (req, res, next) {
  let orders = await orderModel.find({ isDeleted: false })
    .populate('user')
    .populate('items.product');
  res.send(orders);
});

router.get('/:id', async function (req, res, next) {
  try {
    let result = await orderModel.findOne({ _id: req.params.id, isDeleted: false })
      .populate('user')
      .populate('items.product');
    if (result) {
      res.send(result);
    } else {
      res.status(404).send({ message: "Order not found" });
    }
  } catch (error) {
    res.status(404).send({ message: "Invalid Order ID or Order not found" });
  }
});

router.post('/', async function (req, res, next) {
  try {
    const { user, items, shippingAddress, paymentMethod } = req.body;

    // Calculate totalAmount based on items
    let totalAmount = 0;
    if (items && items.length > 0) {
      items.forEach(item => {
        totalAmount += item.quantity * item.price;
      });
    }

    let newItem = new orderModel({
      user,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod
    });
    await newItem.save();
    res.status(201).send(newItem);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

router.put('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    const { items, ...updateData } = req.body;

    // Recalculate totalAmount if items are updated
    if (items && items.length > 0) {
      let totalAmount = 0;
      items.forEach(item => {
        totalAmount += item.quantity * item.price;
      });
      updateData.totalAmount = totalAmount;
    }

    let updatedItem = await orderModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedItem) {
      return res.status(404).send({ message: "Order not found" });
    }
    res.send(updatedItem);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

router.delete('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let updatedItem = await orderModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!updatedItem) return res.status(404).send({ message: "Order not found" });
    res.send(updatedItem);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});
module.exports = router;