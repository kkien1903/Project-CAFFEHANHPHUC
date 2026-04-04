var express = require('express');
var router = express.Router();
let reviewController = require('../controllers/reviews');
let { checkLogin, checkRole } = require('../utils/authHandler.js');

/* GET reviews listing. */
router.get('/', async function (req, res, next) {
  try {
    // Can be public, or add checkLogin if only logged-in users can see reviews
    let reviews = await reviewController.GetAllReviews();
    res.send(reviews);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async function (req, res, next) { // Can be public
  try {
    let result = await reviewController.GetReviewById(req.params.id);
    if (result) {
      res.send(result);
    } else {
      res.status(404).send({ message: "id not found" });
    }
  } catch (error) {
    next(error);
  }
});

router.post('/', checkLogin, async function (req, res, next) {
  try {
    let newItem = await reviewController.CreateReview({
      ...req.body,
      user: req.userId, // Automatically assign logged in user
    });
    res.status(201).send(newItem);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', checkLogin, async function (req, res, next) {
  try {
    const reviewId = req.params.id;
    const review = await reviewController.GetReviewById(reviewId);

    if (!review) {
      return res.status(404).send({ message: "Review not found" });
    }

    // Ensure only the user who wrote the review or an admin can update it
    if (review.user._id.toString() !== req.userId && req.userRole !== 'ADMIN') {
      return res.status(403).send({ message: "Bạn không có quyền cập nhật review này." });
    }

    // Prevent user from changing the product or user associated with the review
    const { product, user, ...updateData } = req.body;

    const updatedReview = await reviewController.UpdateReview(reviewId, updateData);
    res.send(updatedReview);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', checkLogin, checkRole("ADMIN"), async function (req, res, next) {
  try {
    // Only admins can soft-delete reviews
    let updatedItem = await reviewController.DeleteReview(req.params.id);
    if (!updatedItem) {
      return res.status(404).send({ message: "id not found" });
    }
    res.send(updatedItem);
  } catch (err) {
    next(err);
  }
});
module.exports = router;