const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  illustration_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Illustration', required: true },
  created_at: { type: Date, default: Date.now }
});

likeSchema.index({ user_id: 1, illustration_id: 1 }, { unique: true });

module.exports = mongoose.model('Like', likeSchema);
