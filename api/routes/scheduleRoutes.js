// File: backend/routes/scheduleRoutes.js

const Express = require('express');
const Router = Express.Router();

const ScheduleController = require('../controllers/ScheduleController');

const AuthMiddleware = require('../middleware/AuthMiddleware'); // Changed to PascalCase

Router.post('/', AuthMiddleware, ScheduleController.CreateSchedule);

Router.get('/schedules/user', AuthMiddleware, ScheduleController.GetSchedulesForUser);

Router.delete('/schedules/:id', AuthMiddleware, ScheduleController.DeleteSchedule);

module.exports = Router;