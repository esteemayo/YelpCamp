const md5 = require('md5');
const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'Please tell us your firstName.']
    },
    lastName: {
        type: String,
        required: [true, 'Please tell us your lastName.']
    },
    username: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        required: [true, 'Please tell us your username.']
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        required: [true, 'Please provide your email.'],
        validate: [validator.isEmail, 'Please provide a valid email address.']
    },
    emailToken: String,
    password: String,
    isVerified: {
        type: Boolean,
        default: false
    },
    avatar: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    isAdmin: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

userSchema.plugin(passportLocalMongoose);

userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual('gravatar').get(function() {
    const hash = md5(this.email);

    return `https://gravatar.com/avatar/${hash}?s=200`;
});

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.resetPasswordExpires = Date.now() + 60 * 60 * 1000;    // 1hr

    return resetToken;
}

const User = mongoose.model('User', userSchema);

module.exports = User;