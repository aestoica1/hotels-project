const express = require('express');
const router = express.Router();

const catchAsync = require('../utilities/catchAsync');
const { hotelSchema } = require('../schemas');
const { isLoggedIn } = require('../middleware');

const ExpressError = require('../utilities/ExpressError');
const Hotel = require('../models/hotel');

// Joi Validation Middlewares
const validateHotel = (req, res, next) => {
    const { error } = hotelSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
};

// Index Hotels
router.get('/', catchAsync(async (req, res, next) => {
    const hotels = await Hotel.find({});
    res.render('hotels/index', {hotels});
}));

// Create Hotel
router.get('/new', isLoggedIn, (req, res) => {
    res.render('hotels/new');
});

router.post('/', isLoggedIn, validateHotel, catchAsync(async (req, res, next) => {
    const hotel = new Hotel (req.body.hotel);
    await hotel.save();
    req.flash('success', 'Successfully made a new hotel');
    res.redirect(`hotels/${hotel._id}`);
}));

// Show Hotel
router.get('/:id', catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const hotel = await Hotel.findById(id).populate('reviews');
    if (!hotel) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/hotels');
    }
    res.render('hotels/show', { hotel });
}));

// Edit & Update Hotel
router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const hotel = await Hotel.findById(id);
    if (!hotel) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/hotels');
    }
    res.render('hotels/edit', { hotel });
}));

router.put('/:id', isLoggedIn, validateHotel,catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const hotel = await Hotel.findByIdAndUpdate(id, {...req.body.hotel}, {new: true});
    req.flash('success', 'Successfully updated hotel');
    res.redirect(`/hotels/${hotel._id}`);
}));

// Delete Hotel
router.delete('/:id', isLoggedIn, catchAsync(async (req, res, next) => {
    const {id} = req.params;
    await Hotel.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted hotel');
    res.redirect('/hotels');
}));

module.exports = router;