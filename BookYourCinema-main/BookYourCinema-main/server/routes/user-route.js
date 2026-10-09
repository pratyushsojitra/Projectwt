const express = require('express');
const { signup, signIn, getBookings } = require('../controllers/user-controller');
const authenticate = require('../middleware/auth');
const route = express.Router();

route.post('/signup', signup);
route.post('/signin', signIn);
route.get('/bookings', authenticate('user'), getBookings);

module.exports = route;
