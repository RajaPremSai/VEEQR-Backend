const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

announcementSchema.index({ date: -1 });

module.exports = mongoose.model('Announcement', announcementSchema); 