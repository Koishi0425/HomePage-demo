const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // 接收者
  sender_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // 发送者
  type: { type: String, enum: ['like', 'comment', 'follow'], required: true },
  illustration_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Illustration' }, // 点赞/评论时关联的作品
  comment_content: { type: String }, // 评论内容预览
  is_read: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

notificationSchema.index({ recipient_id: 1, created_at: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
