const Express = require('express');
const Router = Express.Router();

const SignupController = require('../controllers/SignupController');
const { Login } = require('../controllers/LoginController');
const GetMeController = require('../controllers/GetMeController');

const { Protect } = require('../middleware/AuthMiddleware'); // CHANGED: Destructured Protect as named export from AuthMiddleware
const { LoginLimiter, SignupLimiter } = require('../middleware/RateLimiter');

Router.post('/signup', SignupLimiter, SignupController.Signup);
Router.post('/login', LoginLimiter, Login);

Router.get('/me', Protect, GetMeController.GetMe);

module.exports = Router;