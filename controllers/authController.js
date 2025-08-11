const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Manager = require('../models/Manager');
const SecurityGuard = require('../models/SecurityGuard');

function signToken(subject) {
  return jwt.sign(
    { id: subject._id.toString(), role: subject.role },
    process.env.JWT_SECRET || 'dev_secret',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
}

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

  // Try in this order: Manager, SecurityGuard, User
  const collections = [
    { model: Manager, role: 'MANAGER' },
    { model: SecurityGuard, role: 'SECURITY_GUARD' },
    { model: User, role: 'USER' },
  ];

  for (const { model } of collections) {
    const doc = await model.findOne({ email }).select('+password');
    if (doc && await doc.matchPassword(password)) {
      const token = signToken(doc);
      const profile = doc.toObject();
      delete profile.password;
      return res.json({ token, profile });
    }
  }
  return res.status(401).json({ message: 'Invalid credentials' });
}; 