const mongoose = require('mongoose');
const cities = require('./cities');
const Hotel = require('../models/hotel');
const {descriptors, places} = require('./seedhelpers');

mongoose.connect('mongodb://localhost:27017/hotels');

const db = mongoose.connection;
db.on('error', console.error.bind(console, "Connection Error:"));
db.once('open', () => {
    console.log('Database Connected')
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async() => {
    await Hotel.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const hotel = new Hotel({
            title: `${sample(descriptors)} ${sample(places)} Hotel`,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            image: 'https://source.unsplash.com/collection/245338',
            description: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Vitae tenetur incidunt laborum suscipit assumenda facere sunt consequatur nostrum, earum consectetur sed iusto, vero, autem ad illo deleniti maiores libero obcaecati.',
            price: price
        })
        await hotel.save();
    }
};

seedDB().then(() => {
    mongoose.connection.close();
});