let reviewModel = require('../schemas/reviews');

module.exports = {
    GetAllReviews: async function () {
        return await reviewModel.find({ isDeleted: false })
            .populate('product', 'title') // Populate only title
            .populate('user', 'username'); // Populate only username
    },

    GetReviewById: async function (id) {
        return await reviewModel.findOne({ _id: id, isDeleted: false })
            .populate('product')
            .populate('user');
    },

    CreateReview: async function (reviewData) {
        const newReview = new reviewModel({
            product: reviewData.product,
            user: reviewData.user,
            rating: reviewData.rating,
            comment: reviewData.comment
        });
        return await newReview.save();
    },

    UpdateReview: async function (id, reviewData) {
        return await reviewModel.findByIdAndUpdate(id, reviewData, { new: true });
    },

    DeleteReview: async function (id) {
        return await reviewModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    }
};