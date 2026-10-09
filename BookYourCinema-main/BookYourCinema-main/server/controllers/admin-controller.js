const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const adminResponse = (admin) => ({
  id: admin._id,
  adminName: admin.adminName,
  email: admin.email
});

const createToken = (admin) => jwt.sign(
  { id: admin._id.toString(), role: 'admin' },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

exports.signup = async (req, res) => {
  try {
    const { adminName, email, password, phone } = req.body;
    if (![adminName, email, password, phone].every((value) => typeof value === 'string' && value.trim())) {
      return res.status(422).json({ message: 'Name, email, password and phone are required.' });
    }
    if (password.length < 8) return res.status(422).json({ message: 'Password must be at least 8 characters.' });

    const normalizedEmail = email.trim().toLowerCase();
    if (await Admin.exists({ email: normalizedEmail })) {
      return res.status(409).json({ message: 'An admin account with this email already exists.' });
    }

    const admin = await Admin.create({
      adminName: adminName.trim(),
      email: normalizedEmail,
      password: await bcrypt.hash(password, 10),
      phone: phone.trim()
    });
    return res.status(201).json({
      message: 'Admin account created successfully.',
      token: createToken(admin),
      user: adminResponse(admin)
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(422).json({ message: 'Email and password are required.' });

    const admin = await Admin.findOne({ email: email.trim().toLowerCase() });
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    return res.json({
      message: 'Signed in successfully.',
      token: createToken(admin),
      user: adminResponse(admin)
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
