const Express = require('express');
const Router = Express.Router();

const DashboardController = require('../controllers/DashboardController');
//const { Protect } = require('../middleware/AuthMiddleware'); // CHANGED: Destructured Protect as named export from AuthMiddleware

Router.get('/',  DashboardController.GetDashboardSchedules);

module.exports = Router;
