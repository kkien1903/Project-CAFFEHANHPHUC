var express = require('express');
var router = express.Router();
let reviewController = require('../controllers/reviews');
let reviewModel = require('../schemas/reviews');
let { checkLogin } = require('../utils/authHandler.js');

/* GET reviews listing. */
router.get('/', async function (req, res, next) {
  try {
    let filter = { isDeleted: false };
    // Lọc theo sản phẩm nếu có truyền lên productId
    if (req.query.product) {
      filter.product = req.query.product;
    }
    let reviews = await reviewModel.find(filter)
      .populate('product', 'title')
      .populate('user', 'username')
      .sort({ createdAt: -1 }); // Sắp xếp đánh giá mới nhất lên đầu
    res.send(reviews);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get('/:id', async function (req, res, next) {
  try {
    let result = await reviewModel.find({ _id: req.params.id, isDeleted: false });
    if (result.length > 0) {
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
    let newItem = await reviewController.CreateReview({
      product: req.body.product,
      user: req.userId, // Automatically assign logged in user
      rating: req.body.rating,
      comment: req.body.comment
    });
    res.status(201).send(newItem);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

router.put('/:id', checkLogin, async function (req, res, next) {
  try {
    // Add logic to ensure only the user who wrote the review or an admin can update it
    let id = req.params.id;
    let updatedItem = await reviewModel.findById(id);
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

router.delete('/:id', async function (req, res, next) {
  try {
    // Add logic to ensure only admin can delete
    let updatedItem = await reviewModel.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );
    if (!updatedItem) {
      return res.status(404).send({ message: "id not found" });
    }
    res.send(updatedItem);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});
module.exports = router;