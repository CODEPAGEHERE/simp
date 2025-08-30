const express = require('express');
const router = express.Router();
const SignupController = require('../controllers/SignupController');
const { Login } = require('../controllers/LoginController');
const { LoginLimiter, SignupLimiter } = require('../middleware/RateLimiter');
const LogoutController = require('../controllers/LogoutController');
const GetMeController = require('../controllers/GetMeController');
const authenticate = require('../middleware/Authenticate');



router.post('/signup', SignupLimiter, SignupController.Signup);
router.post('/login', LoginLimiter, Login);
router.post('/logout', LogoutController.Logout);

router.get('/me', authenticate, GetMeController.GetMe);

module.exports = router;
