const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require ('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utilities/ExpressError');
const methodOverride = require('method-override');
const User = require('./models/user');

// Routes
const userRoutes = require('./routes/users');
const hotelsRoutes = require('./routes/hotels');
const reviewsRoutes = require('./routes/reviews');

// configuring passport
const passport = require('passport');
const LocalStrategy = require('passport-local');

mongoose.connect('mongodb://localhost:27017/hotels');

mongoose.connect('mongodb://localhost:27017/hotels')
    .then(() => {
        console.log("Database Connected")
    })
    .catch(err => {
        console.log("Connection Error:")
        console.log(err)
    })

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};

app.use(session(sessionConfig))
app.use(flash());

// passport
app.use(passport.initialize());
// for persistent login sessions
// this needs to be before session
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    console.log(req.session);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// Use Routes
app.use('/', userRoutes);
app.use('/hotels', hotelsRoutes);
app.use('/hotels/:id/reviews', reviewsRoutes);

app.get('/', (req, res) => {
    res.render('home');
});

app.all('*', (req, res, next) => {
   new ExpressError('Page Not Found', 404);
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if(!err.message) err.message = "Oh no, something went wrong!"
    res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
    console.log('Serving On Port 3000')
});

