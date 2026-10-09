const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/user', require('./routes/user-route'));
app.use('/admin', require('./routes/admin-route'));
app.use('/movies', require('./routes/movie-route'));
app.use('/theaters', require('./routes/theater-route'));
app.use('/showtime',  require('./routes/showtime-route'));
app.use('/reservation',  require('./routes/reservation-route'));

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

const start = async () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is missing. Add it to server/.env before starting the API.');
  }
  await connectDB();
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`Server running on port ${port}`));
};

if (require.main === module) {
  start().catch((error) => {
    console.error(`Server startup failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = app;