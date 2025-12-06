const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// 获取通知列表
router.get('/', auth, asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient_id: req.user.id })
    .populate('sender_id', 'username avatar_url')
    .populate('illustration_id', 'title image_url')
    .sort({ created_at: -1 })
    .limit(50);

  res.json({ code: 200, msg: 'success', data: notifications });
}));

// 标记为已读
router.put('/read/:notificationId', auth, asyncHandler(async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.notificationId, { is_read: true });
  res.json({ code: 200, msg: 'success', data: null });
}));

// 全部标记为已读
router.put('/read-all', auth, asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient_id: req.user.id, is_read: false }, { is_read: true });
  res.json({ code: 200, msg: 'success', data: null });
}));

// 获取未读数量
router.get('/unread-count', auth, asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({ recipient_id: req.user.id, is_read: false });
  res.json({ code: 200, msg: 'success', data: { count } });
}));

module.exports = router;
