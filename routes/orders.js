var express = require('express');
var router = express.Router();
let orderController = require('../controllers/orders');
let orderModel = require('../schemas/orders');
let paymentModel = require('../schemas/payments');
let { checkLogin, checkRole } = require('../utils/authHandler.js');

// Lấy TẤT CẢ đơn hàng cho trang Admin
router.get('/all', checkLogin, checkRole('ADMIN'), async function (req, res, next) {
  try {
    let orders = await orderModel.find({ isDeleted: false })
      .populate('user', 'username email')
      .populate('items.product', 'title price images sizeOptions')
      .sort({ createdAt: -1 });
    res.send(orders);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Lấy đơn hàng của cá nhân user đang đăng nhập
router.get('/', checkLogin, async function (req, res, next) {
  try {
    let orders = await orderModel.find({ user: req.userId, isDeleted: false })
      .populate('user', 'username email')
      .populate('items.product', 'title price images sizeOptions')
      .sort({ createdAt: -1 }); // Đưa đơn hàng mới nhất lên trên cùng
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

// User tự hủy đơn hàng của mình
router.put('/:id/cancel', checkLogin, async function (req, res, next) {
  try {
    let id = req.params.id;
    let order = await orderModel.findOne({ _id: id, user: req.userId, isDeleted: false });
    
    if (!order) return res.status(404).send({ message: "Không tìm thấy đơn hàng." });
    if (order.status !== 'PENDING') return res.status(400).send({ message: "Chỉ có thể hủy đơn hàng đang chờ xử lý." });

    order.status = 'CANCELLED';
    await order.save();

    // Cập nhật trạng thái Payment sang đã hủy
    await paymentModel.findOneAndUpdate({ order: id }, { status: 'cancelled', cancelledAt: new Date() });

    res.send(order);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

// Cập nhật trạng thái đơn hàng và đồng bộ sang Thanh toán
router.put('/:id/status', checkLogin, checkRole('ADMIN'), async function (req, res, next) {
  try {
    let id = req.params.id;
    let { status } = req.body;
    
    let updatedItem = await orderModel.findByIdAndUpdate(id, { status: status }, { new: true });
    if (!updatedItem) return res.status(404).send({ message: "id not found" });

    // Tự động đồng bộ trạng thái Payment dựa trên đơn hàng
    if (status === 'COMPLETED') {
      await paymentModel.findOneAndUpdate({ order: id }, { status: 'paid', paidAt: new Date() });
    } else if (status === 'CANCELLED') {
      await paymentModel.findOneAndUpdate({ order: id }, { status: 'cancelled', cancelledAt: new Date() });
    }

    res.send(updatedItem);
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