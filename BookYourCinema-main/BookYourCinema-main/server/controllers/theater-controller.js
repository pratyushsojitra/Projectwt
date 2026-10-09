const Theater = require('../models/Theater');
const Showtime = require('../models/Showtime');

exports.addTheater = async (req, res) => {
  try {
    const theater = await Theater.create(req.body);
    return res.status(201).json(theater);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.getTheater = async (req, res) => {
  try {
    return res.json(await Theater.find().sort({ name: 1 }));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.searchTheater = async (req, res) => {
  try {
    const theater = await Theater.findById(req.params.id);
    if (!theater) return res.status(404).json({ message: 'Theater not found.' });
    return res.json(theater);
  } catch (error) {
    return res.status(400).json({ message: 'Invalid theater id.' });
  }
};

exports.updateTheater = async (req, res) => {
  try {
    const theater = await Theater.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!theater) return res.status(404).json({ message: 'Theater not found.' });
    return res.json(theater);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.deleteTheater = async (req, res) => {
  try {
    const theater = await Theater.findById(req.params.id);
    if (!theater) return res.status(404).json({ message: 'Theater not found.' });
    if (await Showtime.exists({ theaterId: theater._id })) {
      return res.status(409).json({ message: 'Delete this theater showtimes before deleting the theater.' });
    }
    await theater.deleteOne();
    return res.json({ message: `${theater.name} deleted.` });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
