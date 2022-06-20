const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new Schema({
    email: {
        type: String, 
        required: true,
        unique: true
    }
});

// This is going to add on to our Schema a username, a field for password
// It's going to make sure usernames are unique
// It's going to give us additional methods that we can use
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);
