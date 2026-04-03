var express = require('express');
var router = express.Router();
let reviewModel = require('../schemas/reviews');

/* GET reviews listing. */
router.get('/', async function (req, res, next) {
  let reviews = await reviewModel.find({ isDeleted: false })
    .populate('product')
    .populate('user');
  res.send(reviews);
});

router.get('/:id', async function (req, res, next) {
  try {
    let result = await reviewModel.findOne({ _id: req.params.id, isDeleted: false })
      .populate('product')
      .populate('user');
    if (result) {
      res.send(result);
    } else {
      res.status(404).send({ message: "Review not found" });
    }
  } catch (error) {
    res.status(404).send({ message: "Invalid Review ID or Review not found" });
  }
});

router.post('/', async function (req, res, next) {
  try {
    let newItem = new reviewModel({
      product: req.body.product,
      user: req.body.user,
      rating: req.body.rating,
      comment: req.body.comment
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
    let updatedItem = await reviewModel.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedItem) {
      return res.status(404).send({ message: "Review not found" });
    }
    res.send(updatedItem);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

router.delete('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let updatedItem = await reviewModel.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );
    if (!updatedItem) {
      return res.status(404).send({ message: "Review not found" });
    }
    res.send(updatedItem);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});
module.exports = router;