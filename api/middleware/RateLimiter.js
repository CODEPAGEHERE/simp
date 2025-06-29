const RateLimit = require('express-rate-limit');

const LoginLimiter = RateLimit({
    windowMs: 15 * 60 * 1000,
    max: 4,
    message: {
        Message: 'Too many failed login attempts, please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const SignupLimiter = RateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: {
        Message: 'Too many account creation attempts , please try again after an hour.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    LoginLimiter,
    SignupLimiter,
};