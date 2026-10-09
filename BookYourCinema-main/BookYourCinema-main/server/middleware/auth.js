const jwt = require('jsonwebtoken');

const authenticate = (role) => (req, res, next) => {
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';

  if (!token) {
    return res.status(401).json({ message: 'Sign in to continue.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (role && payload.role !== role) {
      return res.status(403).json({ message: 'You are not allowed to perform this action.' });
    }
    req.auth = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Your session is invalid or has expired.' });
  }
};

module.exports = authenticate;
