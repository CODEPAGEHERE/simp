// File: backend/routes/AuthRoutes.js

const express = require('express');
const router = express.Router();

// Your existing imports for Signup and Login controllers:
const SignupController = require('../controllers/SignupController');
const { login } = require('../controllers/LoginController'); // Keep this exactly as you have it!

// NEW: Import the GetMeController
const GetMeController = require('../controllers/GetMeController');

// Import middleware
const { protect } = require('../middleware/AuthMiddleware'); // Assuming this exists and is correct
const { LoginLimiter, SignupLimiter } = require('../middleware/RateLimiter'); // Your existing rate limiters


router.post('/signup', SignupLimiter, SignupController.signup);
router.post('/login', LoginLimiter, login); // Keep this exactly as you have it!

// NEW: Route to get current authenticated user's details, protected by middleware
router.get('/me', protect, GetMeController.GetMe); // This is the /auth/me endpoint

module.exports = router;