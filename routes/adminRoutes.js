const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/adminController');

// Define the route for getting dashboard statistics
router.get('/dashboard_stats', getDashboardStats);

module.exports = router;
