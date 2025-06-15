// backend/routes/scheduleRoutes.js
const express = require('express');
const router = express.Router();

const { Schedule } = require('../controllers/scheduleController');
const authMiddleware = require('../middleware/authMiddleware'); // authMiddleware is already a function here

// --- Define Schedule Routes ---

// Route to create a new schedule (POST request, requires authentication)
router.post('/', authMiddleware, Schedule.createSchedule);

// NEW: Route to get all schedules for the authenticated user
router.get('/schedules/user', authMiddleware, Schedule.getSchedulesForUser);

// NEW: Route to delete a specific schedule by ID
router.delete('/schedules/:id', authMiddleware, Schedule.deleteSchedule);

module.exports = router;