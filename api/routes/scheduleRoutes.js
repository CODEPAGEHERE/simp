// backend/routes/scheduleRoutes.js
const express = require('express');
const router = express.Router();

const { Schedule } = require('../controllers/schedulecontroller');
const authMiddleware = require('../middleware/authmiddleware'); // authMiddleware is already a function here

// --- Define Schedule Routes ---

// Route to create a new schedule (POST request, requires authentication)
router.post('/', authmiddleware, Schedule.createSchedule);

// NEW: Route to get all schedules for the authenticated user
router.get('/schedules/user', authmiddleware, Schedule.getSchedulesForUser);

// NEW: Route to delete a specific schedule by ID
router.delete('/schedules/:id', authmiddleware, Schedule.deleteSchedule);

module.exports = router;