const express = require('express');
const router = express.Router();


const { Schedule } = require('../controllers/scheduleController'); 



const authMiddleware = require('../middleware/authMiddleware'); 

// --- Define Schedule Routes ---


router.post('/', authMiddleware, Schedule.createSchedule); 




module.exports = router;