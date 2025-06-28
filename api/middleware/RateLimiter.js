const rateLimit = require('express-rate-limit');

// Login Rate Limiter (4 attempts in 15 minutes)
const LoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 4, // Max 4 login attempts per IP per windowMs
  message: {
    Message: 'Too many failed login attempts, please try again after 15 minutes.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Signup Rate Limiter (5 attempts in 1 hour)
const SignupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Max 5 signup attempts per IP per hour
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