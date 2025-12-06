const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Like = require('../models/Like');
const Favorite = require('../models/Favorite');
const Comment = require('../models/Comment');
const Follow = require('../models/Follow');
const Notification = require('../models/Notification');
const Illustration = require('../models/Illustration');
const auth = require('../middleware/auth');

// 点赞
router.post('/like', auth, asyncHandler(async (req, res) => {
  const { illustrationId } = req.body;
  
  const existing = await Like.findOne({ user_id: req.user.id, illustration_id: illustrationId });
  if (existing) {
    return res.status(400).json({ code: 400, msg: 'error', error: '已经点赞过了' });
  }

  await Like.create({ user_id: req.user.id, illustration_id: illustrationId });
  await Illustration.findByIdAndUpdate(illustrationId, { $inc: { likes_count: 1 } });

  // 创建通知
  const illustration = await Illustration.findById(illustrationId);
  if (illustration && illustration.user_id.toString() !== req.user.id) {
    await Notification.create({
      recipient_id: illustration.user_id,
      sender_id: req.user.id,
      type: 'like',
      illustration_id: illustrationId
    });
  }

  res.json({ code: 200, msg: 'success', data: null });
}));

// 取消点赞
router.delete('/like/:illustrationId', auth, asyncHandler(async (req, res) => {
  const { illustrationId } = req.params;
  
  const result = await Like.findOneAndDelete({ user_id: req.user.id, illustration_id: illustrationId });
  if (result) {
    await Illustration.findByIdAndUpdate(illustrationId, { $inc: { likes_count: -1 } });
  }

  res.json({ code: 200, msg: 'success', data: null });
}));

// 收藏
router.post('/favorite', auth, asyncHandler(async (req, res) => {
  const { illustrationId } = req.body;
  
  const existing = await Favorite.findOne({ user_id: req.user.id, illustration_id: illustrationId });
  if (existing) {
    return res.status(400).json({ code: 400, msg: 'error', error: '已经收藏过了' });
  }

  await Favorite.create({ user_id: req.user.id, illustration_id: illustrationId });
  res.json({ code: 200, msg: 'success', data: null });
}));

// 取消收藏
router.delete('/favorite/:illustrationId', auth, asyncHandler(async (req, res) => {
  const { illustrationId } = req.params;
  await Favorite.findOneAndDelete({ user_id: req.user.id, illustration_id: illustrationId });
  res.json({ code: 200, msg: 'success', data: null });
}));

// 评论
router.post('/comment', auth, asyncHandler(async (req, res) => {
  const { illustrationId, content } = req.body;
  
  const comment = await Comment.create({
    user_id: req.user.id,
    illustration_id: illustrationId,
    content
  });

  // 创建通知
  const illustration = await Illustration.findById(illustrationId);
  if (illustration && illustration.user_id.toString() !== req.user.id) {
    await Notification.create({
      recipient_id: illustration.user_id,
      sender_id: req.user.id,
      type: 'comment',
      illustration_id: illustrationId,
      comment_content: content.substring(0, 50)
    });
  }

  const populated = await Comment.findById(comment._id).populate('user_id', 'username avatar_url');
  res.json({ code: 200, msg: 'success', data: populated });
}));

// 获取评论列表
router.get('/comments/:illustrationId', asyncHandler(async (req, res) => {
  const comments = await Comment.find({ illustration_id: req.params.illustrationId })
    .populate('user_id', 'username avatar_url')
    .sort({ created_at: -1 });
  res.json({ code: 200, msg: 'success', data: comments });
}));

// 关注
router.post('/follow', auth, asyncHandler(async (req, res) => {
  const { userId } = req.body;
  
  if (userId === req.user.id) {
    return res.status(400).json({ code: 400, msg: 'error', error: '不能关注自己' });
  }

  const existing = await Follow.findOne({ follower_id: req.user.id, following_id: userId });
  if (existing) {
    return res.status(400).json({ code: 400, msg: 'error', error: '已经关注过了' });
  }

  await Follow.create({ follower_id: req.user.id, following_id: userId });

  // 创建通知
  await Notification.create({
    recipient_id: userId,
    sender_id: req.user.id,
    type: 'follow'
  });

  res.json({ code: 200, msg: 'success', data: null });
}));

// 取消关注
router.delete('/follow/:userId', auth, asyncHandler(async (req, res) => {
  await Follow.findOneAndDelete({ follower_id: req.user.id, following_id: req.params.userId });
  res.json({ code: 200, msg: 'success', data: null });
}));

// 检查点赞/收藏/关注状态
router.get('/status/:illustrationId', auth, asyncHandler(async (req, res) => {
  const { illustrationId } = req.params;
  const illustration = await Illustration.findById(illustrationId);
  
  const [liked, favorited, followed] = await Promise.all([
    Like.exists({ user_id: req.user.id, illustration_id: illustrationId }),
    Favorite.exists({ user_id: req.user.id, illustration_id: illustrationId }),
    illustration ? Follow.exists({ follower_id: req.user.id, following_id: illustration.user_id }) : false
  ]);

  res.json({
    code: 200,
    msg: 'success',
    data: { liked: !!liked, favorited: !!favorited, followed: !!followed }
  });
}));

module.exports = router;
