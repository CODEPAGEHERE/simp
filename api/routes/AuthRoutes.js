// File: backend/routes/AuthRoutes.js

const express = require('express');
const router = express.Router();

// Your existing imports for Signup and Login controllers:
const SignupController = require('../controllers/SignupController');
const { login } = require('../controllers/LoginController'); // Keep this exactly as you have it!

// NEW: Import the GetMeController
const GetMeController = require('../controllers/GetMeController');

// Import middleware
// ***********************************************************************************
// *** THIS IS THE ONLY LINE IN THIS FILE THAT NEEDS TO BE CHANGED ***
// 
// OLD LINE (causing the problem): const { protect } = require('../middleware/AuthMiddleware'); 
// 
// NEW LINE (the fix):
const protect = require('../middleware/AuthMiddleware'); // Correctly imports the default export of your authMiddleware.js
// ***********************************************************************************

const { LoginLimiter, SignupLimiter } = require('../middleware/RateLimiter'); // Your existing rate limiters


router.post('/signup', SignupLimiter, SignupController.signup);
router.post('/login', LoginLimiter, login); // Keep this exactly as you have it!

// NEW: Route to get current authenticated user's details, protected by middleware
router.get('/me', protect, GetMeController.GetMe); // This line now receives a function for `protect`

module.exports = router;