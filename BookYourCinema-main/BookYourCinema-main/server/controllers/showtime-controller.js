const Showtime = require('../models/Showtime');
const Reservation = require('../models/Reservation');

exports.addShowtime = async (req, res) => {
  try {
    const { movieId, theaterId, showDate, showTime, price, totalSeats = 60 } = req.body;
    const capacity = Number(totalSeats);
    if (!movieId || !theaterId || !showDate || !showTime || !Number.isFinite(capacity) || capacity < 1 || capacity > 300 || Number(price) <= 0) {
      return res.status(422).json({ message: 'Choose a movie, theater, date, time, positive price and capacity from 1 to 300.' });
    }

    const seats = Array.from({ length: capacity }, (_, index) => `S${index + 1}`);
    const showtime = await Showtime.create({
      movieId,
      theaterId,
      showDate,
      showTime,
      price: Number(price),
      screens: [{ screenId: 'Screen 1', totalSeats: capacity, seatingLayout: seats }]
    });
    return res.status(201).json(showtime);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.getShowtime = async (req, res) => {
  try {
    const filter = {};
    if (req.query.movieId) filter.movieId = req.query.movieId;
    if (req.query.theaterId) filter.theaterId = req.query.theaterId;
    if (req.query.from) filter.showDate = { $gte: new Date(req.query.from) };
    const shows = await Showtime.find(filter)
      .populate('movieId', 'title posterUrl')
      .populate('theaterId', 'name location')
      .sort({ showDate: 1, showTime: 1 });
    return res.json(shows);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.searchShowtime = async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.id).populate('movieId').populate('theaterId');
    if (!showtime) return res.status(404).json({ message: 'Showtime not found.' });
    return res.json(showtime);
  } catch (error) {
    return res.status(400).json({ message: 'Invalid showtime id.' });
  }
};

exports.updateShowtime = async (req, res) => {
  try {
    const showtime = await Showtime.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!showtime) return res.status(404).json({ message: 'Showtime not found.' });
    return res.json(showtime);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.deleteShowtime = async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.id);
    if (!showtime) return res.status(404).json({ message: 'Showtime not found.' });
    if (await Reservation.exists({ showtimeId: showtime._id })) {
      return res.status(409).json({ message: 'This showtime has bookings and cannot be deleted.' });
    }
    await showtime.deleteOne();
    return res.json({ message: `${showtime.showTime} showtime deleted.` });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
