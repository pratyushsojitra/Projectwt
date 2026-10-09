const express = require('express');
const { signup, signIn } = require('../controllers/admin-controller');
const route = express.Router();

route.post('/signup', signup);
route.post('/signin', signIn);

module.exports = route;
