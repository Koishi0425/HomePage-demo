const mongoose = require('mongoose');

const illustrationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  image_url: { type: String, required: true },
  description: { type: String },
  tags: [{ type: String }],
  likes_count: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Illustration', illustrationSchema);
