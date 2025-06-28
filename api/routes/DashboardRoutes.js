// File: backend/routes/DashboardRoutes.js

const Express = require('express');
const Router = Express.Router();

const DashboardController = require('../controllers/DashboardController');
const Protect = require('../middleware/AuthMiddleware'); // Corrected import to match default export and PascalCase

Router.get('/', Protect, DashboardController.GetDashboardSchedules); // Using PascalCase for Router and Protect

module.exports = Router;