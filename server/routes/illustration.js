const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const multer = require('multer');
const path = require('path');
const Illustration = require('../models/Illustration');
const auth = require('../middleware/auth');

// Local storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// 搜索接口 - 必须在 /:id 之前
router.get('/search', asyncHandler(async (req, res) => {
  const { keyword, page = 1, limit = 20 } = req.query;
  if (!keyword) {
    return res.json({ code: 200, msg: 'success', data: [] });
  }

  const illustrations = await Illustration.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'user_id',
        foreignField: '_id',
        as: 'user_id'
      }
    },
    { $unwind: '$user_id' },
    {
      $match: {
        $or: [
          { title: { $regex: keyword, $options: 'i' } },
          { description: { $regex: keyword, $options: 'i' } },
          { tags: { $regex: keyword, $options: 'i' } },
          { 'user_id.username': { $regex: keyword, $options: 'i' } }
        ]
      }
    },
    { $sort: { created_at: -1 } },
    { $skip: (page - 1) * limit },
    { $limit: parseInt(limit) },
    {
      $project: {
        _id: 1,
        title: 1,
        image_url: 1,
        description: 1,
        likes_count: 1,
        tags: 1,
        created_at: 1,
        'user_id._id': 1,
        'user_id.username': 1,
        'user_id.avatar_url': 1
      }
    }
  ]);

  res.json({ code: 200, msg: 'success', data: illustrations });
}));

// 获取作品详情
router.get('/:id', asyncHandler(async (req, res) => {
  const illustration = await Illustration.findById(req.params.id)
    .populate('user_id', 'username avatar_url');
  
  if (!illustration) {
    return res.status(404).json({ code: 404, msg: 'error', error: '作品不存在' });
  }

  res.json({ code: 200, msg: 'success', data: illustration });
}));

router.get('/', asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const illustrations = await Illustration.find()
    .sort({ created_at: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('user_id', 'username avatar_url');

  res.json({ code: 200, msg: 'success', data: illustrations });
}));

// 单独的文件上传接口（用于主页编辑器）
router.post('/upload', auth, upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ code: 400, msg: 'error', error: 'No file uploaded' });
  }

  // 只返回文件URL，不创建illustration记录
  const file_url = `/uploads/${req.file.filename}`;
  res.json({ code: 200, msg: 'success', data: { image_url: file_url } });
}));

router.post('/', auth, upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ code: 400, msg: 'error', error: 'No image uploaded' });
  }

  const { title, description, tags } = req.body;
  // In production, replace this with OSS URL
  const image_url = `/uploads/${req.file.filename}`;

  const illustration = await Illustration.create({
    user_id: req.user.id,
    title,
    image_url,
    description,
    tags: tags ? JSON.parse(tags) : []
  });

  res.status(201).json({ code: 200, msg: 'success', data: illustration });
}));

module.exports = router;
