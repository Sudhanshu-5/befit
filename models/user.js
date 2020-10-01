var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var userSchema = new mongoose.Schema({
    username: {
        type: String,
        index: {
            unique: true,
            dropDups: true
        }
    },
    password: String,
    gender: String,
    email: {
        type: String,
        unique: [true, "Email must be unique"],
        required: true
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("user", userSchema);