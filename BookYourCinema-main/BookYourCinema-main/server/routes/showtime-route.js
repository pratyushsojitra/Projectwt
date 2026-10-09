const express = require('express');
const { addShowtime, getShowtime, searchShowtime, updateShowtime, deleteShowtime } = require('../controllers/showtime-controller');
const authenticate = require('../middleware/auth');

const route = express.Router();

// Add showtime
route.post('/', authenticate('admin'), addShowtime)

// Get all show
route.get('/', getShowtime)

// Search showtime
route.get('/:id', searchShowtime)

// Update showtime
route.patch('/:id', authenticate('admin'), updateShowtime)

// Delete showtime
route.delete('/:id', authenticate('admin'), deleteShowtime)

module.exports = route