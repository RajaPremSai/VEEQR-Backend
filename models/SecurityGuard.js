const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const securityGuardSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String, required: true },
  empNumber: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  contactNumber: { type: String },
  securityGuardId: { type: String, required: true, unique: true },
  role: { type: String, default: 'SECURITY_GUARD' },
  assignedGates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Gate' }]
}, { timestamps: true });

securityGuardSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

securityGuardSchema.methods.matchPassword = function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('SecurityGuard', securityGuardSchema); 