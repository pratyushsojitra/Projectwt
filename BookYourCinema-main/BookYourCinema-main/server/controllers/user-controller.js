const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const createToken = (user) => jwt.sign(
  { id: user._id.toString(), role: 'user' },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

exports.signup = async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;
    if (![username, email, password, phone].every((value) => typeof value === 'string' && value.trim())) {
      return res.status(422).json({ message: 'Name, email, password and phone are required.' });
    }
    if (password.length < 8) {
      return res.status(422).json({ message: 'Password must be at least 8 characters.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const user = await User.create({
      username: username.trim(),
      email: normalizedEmail,
      password: await bcrypt.hash(password, 10),
      phone: phone.trim()
    });

    return res.status(201).json({
      message: 'Account created successfully.',
      token: createToken(user),
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(422).json({ message: 'Email and password are required.' });

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    return res.json({
      message: 'Signed in successfully.',
      token: createToken(user),
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const user = await User.findById(req.auth.id).select('bookings').populate({
      path: 'bookings',
      populate: [{ path: 'movies', select: 'title posterUrl' }, { path: 'showtimeId' }]
    });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    return res.json(user.bookings);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
