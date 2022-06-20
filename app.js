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
// allows us to plug in multiple strategies for auth
const passport = require('passport');
const LocalStrategy = require('passport-local');
// configuring passport

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
// we would like passport to use the local strategy that we downloaded in required
// and for that LS the auth method it's going to be located on our user model and it's called authenticate
passport.use(new LocalStrategy(User.authenticate()));
// this is telling passport of to serialize a user
// serialize: how do we store a user in the session
passport.serializeUser(User.serializeUser());
// deserialize: how do we get a user out of that session
passport.deserializeUser(User.deserializeUser());
// passport

app.use((req, res, next) => {
    console.log(req.session);
    // we have access to them on every single template
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

