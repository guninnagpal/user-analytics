const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  session_id: { type: String, required: true, index: true },
  type: { type: String, enum: ['page_view', 'click'], required: true },
  url: { type: String, required: true, index: true },
  timestamp: { type: Date, required: true },
  // only for click events
  x: Number,
  y: Number,
  page_width: Number,
  page_height: Number,
});

eventSchema.index({ session_id: 1, timestamp: 1 });
eventSchema.index({ url: 1, type: 1 });

module.exports = mongoose.model('Event', eventSchema);
