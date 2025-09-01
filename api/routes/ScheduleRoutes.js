const Express = require('express');
const Router = Express.Router();

const ScheduleController = require('../controllers/ScheduleController');
const AuthGate = require('../middleware/AuthGate');

Router.post('/schedules', AuthGate, ScheduleController.CreateSchedule);

Router.get('/schedules/user', AuthGate, ScheduleController.GetSchedulesForUser);

Router.delete('/schedules/:id', AuthGate, ScheduleController.DeleteSchedule);

module.exports = Router;
