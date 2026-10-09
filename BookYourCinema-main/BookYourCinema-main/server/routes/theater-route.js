const express = require('express')
const { addTheater, getTheater, searchTheater, deleteTheater, updateTheater } = require('../controllers/theater-controller')
const authenticate = require('../middleware/auth')

const route = express.Router()

// Add theater
route.post('/', authenticate('admin'), addTheater);

// Get theater
route.get('/', getTheater);

// Search theater
route.get('/:id', searchTheater);

// Update theater
route.patch('/:id', authenticate('admin'), updateTheater);

// Delete theater
route.delete('/:id', authenticate('admin'), deleteTheater);

module.exports = route