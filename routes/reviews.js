var express = require('express');
var router = express.Router();
let reviewController = require('../controllers/reviews');
let { checkLogin } = require('../utils/authHandler.js');

/* GET reviews listing. */
router.get('/', async function (req, res, next) {
  try {
    let reviews = await reviewController.GetAllReviews();
    res.send(reviews);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get('/:id', async function (req, res, next) {
  try {
    let result = await reviewController.GetReviewById(req.params.id);
    if (result) {
      res.send(result);
    } else {
      res.status(404).send({ message: "Review not found" });
    }
  } catch (error) {
    res.status(400).send({ message: "Invalid Review ID" });
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
    let updatedItem = await reviewController.UpdateReview(req.params.id, req.body);
    if (!updatedItem) {
      return res.status(404).send({ message: "Review not found" });
    }
    res.send(updatedItem);
  } catch (err) {
    res.status(400).send({ message: "Invalid ID or update failed" });
  }
});

router.delete('/:id', async function (req, res, next) {
  try {
    // Add logic to ensure only admin can delete
    let updatedItem = await reviewController.DeleteReview(req.params.id);
    if (!updatedItem) {
      return res.status(404).send({ message: "Review not found" });
    }
    res.send(updatedItem);
  } catch (err) {
    res.status(400).send({ message: "Invalid ID or delete failed" });
  }
});
module.exports = router;