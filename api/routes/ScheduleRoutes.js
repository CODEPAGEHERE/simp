const Express = require('express');
const Router = Express.Router();

const ScheduleController = require('../controllers/ScheduleController');

//const { Protect } = require('../middleware/AuthMiddleware');

//Router.post('/', Protect, ScheduleController.CreateSchedule);

Router.get('/schedules/user',  ScheduleController.GetSchedulesForUser);

Router.delete('/schedules/:id',  ScheduleController.DeleteSchedule);

module.exports = Router;
