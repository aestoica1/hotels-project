const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const HotelSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

// Mongoose Middleware To Delete Associated Reviews afterwards when we delete a hotel
// findByIdAndDelete triggers the following middleware: findOneAndDelete()
// it's a query middleware and it's executed after the hooked method and all of its pre middleware have completed
HotelSchema.post('findOneAndDelete', async function(doc) {
    // what was deleted was passed to our middleware function(doc)
    // so if there were reviews in the array we can delete them based upon that particular object ids
   if (doc) {
    // delete all reviews where their id field is in our doc that was just deleted in its review array
       await Review.deleteMany(({
           _id: {
               $in:doc.reviews,
           }
       }))
   }
});

module.exports = mongoose.model('Hotel', HotelSchema);