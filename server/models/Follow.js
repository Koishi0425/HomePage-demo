const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
  follower_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // 关注者
  following_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // 被关注者
  created_at: { type: Date, default: Date.now }
});

followSchema.index({ follower_id: 1, following_id: 1 }, { unique: true });

module.exports = mongoose.model('Follow', followSchema);
