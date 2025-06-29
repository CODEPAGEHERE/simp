const Express = require('express');
const Router = Express.Router();

const ScheduleController = require('../controllers/ScheduleController');

const { Protect } = require('../middleware/AuthMiddleware'); 

Router.post('/', Protect, ScheduleController.CreateSchedule); 

Router.get('/schedules/user', Protect, ScheduleController.GetSchedulesForUser); 

Router.delete('/schedules/:id', Protect, ScheduleController.DeleteSchedule); 

module.exports = Router;