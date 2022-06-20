const express = require('express');

const router = express.Router({mergeParams: true});

const catchAsync = require('../utilities/catchAsync');
const { reviewSchema } = require('../schemas');
const ExpressError = require('../utilities/ExpressError');

const Hotel = require('../models/hotel');
const Review = require('../models/review');

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
};

// Create Review For A Hotel
router.post('/', validateReview, catchAsync(async (req, res) => {
    const hotel = await Hotel.findById(req.params.id);
    const review = new Review(req.body.review);
    hotel.reviews.push(review);
    await review.save();
    await hotel.save();
    req.flash('success', 'Created new review');
    res.redirect(`/hotels/${hotel._id}`);
}));

// Delete Review
router.delete('/:reviewId', catchAsync( async (req, res) => {
    const {id, reviewId} = req.params;
    await Hotel.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review deleted');
    res.redirect(`/hotels/${id}`);
}));

module.exports = router;