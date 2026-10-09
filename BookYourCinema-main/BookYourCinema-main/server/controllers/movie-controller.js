const Movie = require('../models/Movie');
const Admin = require('../models/Admin');
const Showtime = require('../models/Showtime');
const Reservation = require('../models/Reservation');

exports.addMovie = async (req, res) => {
  try {
    const admin = await Admin.findById(req.auth.id);
    if (!admin) return res.status(404).json({ message: 'Admin account not found.' });

    const movie = await Movie.create({
      ...req.body,
      admin: admin._id,
      title: req.body.title && req.body.title.trim(),
      language: req.body.language && req.body.language.trim()
    });
    admin.movies.push(movie._id);
    await admin.save();
    return res.status(201).json(movie);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.getMovies = async (req, res) => {
  try {
    const filter = {};
    if (req.query.search) {
      const search = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.title = { $regex: search, $options: 'i' };
    }
    return res.json(await Movie.find(filter).sort({ createdAt: -1 }));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.searchMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Movie not found.' });
    return res.json({ movie });
  } catch (error) {
    return res.status(400).json({ message: 'Invalid movie id.' });
  }
};

exports.updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Movie not found.' });
    if (movie.admin.toString() !== req.auth.id) return res.status(403).json({ message: 'You cannot edit this movie.' });
    const allowed = ['title', 'posterUrl', 'trailerUrl', 'language', 'cast', 'description', 'genre', 'releaseDate', 'duration', 'rating'];
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) movie[key] = req.body[key];
    });
    await movie.save();
    return res.json(movie);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Movie not found.' });
    if (movie.admin.toString() !== req.auth.id) return res.status(403).json({ message: 'You cannot delete this movie.' });
    if (await Showtime.exists({ movieId: movie._id })) {
      return res.status(409).json({ message: 'Delete this movie showtimes before deleting the movie.' });
    }
    if (await Reservation.exists({ movies: movie._id })) {
      return res.status(409).json({ message: 'This movie has bookings and cannot be deleted.' });
    }
    await Promise.all([
      Movie.deleteOne({ _id: movie._id }),
      Admin.updateOne({ _id: movie.admin }, { $pull: { movies: movie._id } })
    ]);
    return res.json({ message: `${movie.title} deleted.` });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
