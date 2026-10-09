const Reservation = require('../models/Reservation');
const User = require('../models/User');
const Showtime = require('../models/Showtime');

const availableSeatsFor = (showtime) => {
  const configuredSeats = showtime.screens.flatMap((screen) =>
    Array.isArray(screen.seatingLayout)
      ? screen.seatingLayout.filter((seat) => typeof seat === 'string')
      : []
  );
  if (configuredSeats.length) return configuredSeats;
  const capacity = showtime.screens.reduce((total, screen) => total + Number(screen.totalSeats || 0), 0);
  return Array.from({ length: capacity }, (_, index) => `S${index + 1}`);
};

exports.createReservation = async (req, res) => {
  let claimedSeats = false;
  let showtimeId;
  let seats;

  try {
    const { showtimeId: requestedShowtimeId, seats: requestedSeats } = req.body;
    if (!requestedShowtimeId || !Array.isArray(requestedSeats) || !requestedSeats.length || requestedSeats.length > 10) {
      return res.status(422).json({ message: 'Choose a showtime and select between 1 and 10 seats.' });
    }
    seats = [...new Set(requestedSeats.map((seat) => String(seat)))];
    if (seats.length !== requestedSeats.length) return res.status(422).json({ message: 'The same seat cannot be selected twice.' });

    const showtime = await Showtime.findById(requestedShowtimeId);
    if (!showtime) return res.status(404).json({ message: 'Showtime not found.' });
    const user = await User.findById(req.auth.id);
    if (!user) return res.status(404).json({ message: 'Customer account not found.' });
    const startsAt = new Date(showtime.showDate);
    if (startsAt.getUTCHours() === 0 && startsAt.getUTCMinutes() === 0) {
      const [hours, minutes] = showtime.showTime.split(':').map(Number);
      if (Number.isFinite(hours) && Number.isFinite(minutes)) startsAt.setHours(hours, minutes, 0, 0);
    }
    if (startsAt <= new Date()) return res.status(409).json({ message: 'This showtime has already started.' });
    const validSeats = availableSeatsFor(showtime);
    if (seats.some((seat) => !validSeats.includes(seat))) {
      return res.status(422).json({ message: 'One or more selected seats are not available in this screen.' });
    }

    showtimeId = showtime._id;
    const claim = await Showtime.updateOne(
      { _id: showtimeId, bookedSeats: { $nin: seats } },
      { $addToSet: { bookedSeats: { $each: seats } } }
    );
    if (!claim.modifiedCount) return res.status(409).json({ message: 'One or more seats were just booked. Please choose again.' });
    claimedSeats = true;

    const reservation = await Reservation.create({
      users: req.auth.id,
      movies: showtime.movieId,
      showtimeId,
      seats,
      totalPrice: showtime.price * seats.length
    });
    await User.updateOne({ _id: req.auth.id }, { $addToSet: { bookings: reservation._id } });
    return res.status(201).json(reservation);
  } catch (error) {
    if (claimedSeats) await Showtime.updateOne({ _id: showtimeId }, { $pull: { bookedSeats: { $in: seats } } });
    return res.status(400).json({ message: error.message });
  }
};

exports.getReservation = async (req, res) => {
  try {
    const reservations = await Reservation.find({ users: req.auth.id })
      .populate('movies', 'title posterUrl')
      .populate('showtimeId');
    return res.json(reservations);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('users', 'username email')
      .populate('movies', 'title')
      .populate('showtimeId', 'showDate showTime')
      .sort({ createdAt: -1 });
    return res.json(reservations);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.checkIn = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: 'Reservation not found.' });
    reservation.checkIn = true;
    await reservation.save();
    return res.json({ message: 'Check-in complete.', reservation });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findOne({ _id: req.params.id, users: req.auth.id });
    if (!reservation) return res.status(404).json({ message: 'Reservation not found.' });
    await Promise.all([
      Showtime.updateOne({ _id: reservation.showtimeId }, { $pull: { bookedSeats: { $in: reservation.seats } } }),
      User.updateOne({ _id: req.auth.id }, { $pull: { bookings: reservation._id } }),
      Reservation.deleteOne({ _id: reservation._id })
    ]);
    return res.json({ message: 'Reservation cancelled.' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
