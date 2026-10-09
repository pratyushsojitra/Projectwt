const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing. Add it to server/.env before starting the API.');
  }
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Database connected');
};

module.exports = connectDB