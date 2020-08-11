const mongoose = require('mongoose');
const { sha256 } = require('./secure');

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    hashedPassword: {
        type: String,
        required: true
    },
    requestedCode: {
        type: Boolean,
        default: false
    },
    verificationCode: {
        type: String,
        default: ''
    },
    timeIssued: {
        type: Date,
        default: Date.now()
    }
});

userSchema.methods.comparePassword = function(input) {
    return sha256(input) === this.hashedPassword;
}

userSchema.methods.sinceIssued = function() {
    return Date.now() - this.timeIssued;
}

userSchema.methods.compareCodes = function(code) {
    return code.toString() === this.verificationCode;
}

module.exports = mongoose.model('User', userSchema);
