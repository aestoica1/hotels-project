const express = require('express');

// Express Router likes to keep params separate
// By default we won't have access to an id from a different route in this rroute eg: hotel id in reviews
// With mergeParams, all the params from app.js will be merged along with those in this file so we'll have access to the hotel id
const router = express.Router({mergeParams: true});

const catchAsync = require('../utilities/catchAsync');
const { reviewSchema } = require('../schemas');
const ExpressError = require('../utilities/ExpressError');

const Hotel = require('../models/hotel');
const Review = require('../models/review');

const validateReview = (req, res, next) => {
    // Check for an error as part of he object we get back from
    // doing reviewSchema.validate with req.body
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
    // we need to delete the reference of the review, the object ID inside hotels.reviews
    // $pull operator: it's going to take the reviewId and pull anything with that id out of reviews and reviews is an array of ID's
    await Hotel.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    // delete the entire review
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review deleted');
    res.redirect(`/hotels/${id}`);
}));

module.exports = router;