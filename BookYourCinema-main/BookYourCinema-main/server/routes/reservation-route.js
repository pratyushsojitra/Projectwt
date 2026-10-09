const express = require('express');
const { createReservation, getReservation, getAllReservations, checkIn, deleteReservation } = require('../controllers/reservation-controller');
const authenticate = require('../middleware/auth');
const route = express.Router();

route.post('/', authenticate('user'), createReservation);
route.get('/', authenticate('admin'), getAllReservations);
route.get('/mine', authenticate('user'), getReservation);
route.patch('/:id/check-in', authenticate('admin'), checkIn);
route.delete('/:id', authenticate('user'), deleteReservation);

module.exports = route;
