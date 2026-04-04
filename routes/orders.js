var express = require('express');
var router = express.Router();
let orderController = require('../controllers/orders');
let orderModel = require('../schemas/orders');
let { checkLogin } = require('../utils/authHandler.js');

/* GET orders listing. */
router.get('/', checkLogin, async function (req, res, next) {
  try {
    // Add role check if only admins can see all orders
    let orders = await orderModel.find({ isDeleted: false })
      .populate('user', 'username email')
      .populate('items.product', 'title price');
    res.send(orders);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get('/:id', checkLogin, async function (req, res, next) {
  try {
    let result = await orderModel.find({ _id: req.params.id, isDeleted: false });
    if (result.length > 0) {
      // Add check to ensure user can only see their own order, unless they are admin
      res.send(result);
    } else {
      res.status(404).send({ message: "id not found" });
    }
  } catch (error) {
    res.status(404).send({ message: "id not found" });
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
    let id = req.params.id;
    let updatedItem = await orderModel.findById(id);
    if (!updatedItem) return res.status(404).send({ message: "id not found" });

    for (const key of Object.keys(req.body)) {
      updatedItem[key] = req.body[key];
    }
    await updatedItem.save();

    res.send(updatedItem);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

router.delete('/:id', checkLogin, async function (req, res, next) {
  try {
    // Add role check, only admin should delete orders
    let updatedItem = await orderModel.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );
    if (!updatedItem) return res.status(404).send({ message: "id not found" });
    res.send(updatedItem);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});
module.exports = router;