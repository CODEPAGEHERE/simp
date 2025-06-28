// This file: backend/routes/DashboardRoutes.js

const express = require('express');
const router = express.Router();

const DashboardController = require('../controllers/DashboardController'); // PascalCase import
const { protect } = require('../middleware/authmiddleware');

router.get('/', protect, DashboardController.GetDashboardSchedules); // PascalCase function call

module.exports = router;