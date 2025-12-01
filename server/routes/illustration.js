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

router.get('/', asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const illustrations = await Illustration.find()
    .sort({ created_at: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('user_id', 'username avatar_url');

  res.json({ code: 200, msg: 'success', data: illustrations });
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

router.get('/search', asyncHandler(async (req, res) => {
  const { keyword } = req.query;
  if (!keyword) return res.json({ code: 200, msg: 'success', data: [] });

  // Simple regex search for title. For author search, we'd need an aggregation or separate query.
  // Here we implement a basic aggregation to search both.
  const illustrations = await Illustration.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'user_id',
        foreignField: '_id',
        as: 'author'
      }
    },
    { $unwind: '$author' },
    {
      $match: {
        $or: [
          { title: { $regex: keyword, $options: 'i' } },
          { 'author.username': { $regex: keyword, $options: 'i' } }
        ]
      }
    },
    {
      $project: {
        title: 1,
        image_url: 1,
        description: 1,
        likes_count: 1,
        created_at: 1,
        'author.username': 1,
        'author.avatar_url': 1,
        'author._id': 1
      }
    }
  ]);

  res.json({ code: 200, msg: 'success', data: illustrations });
}));

module.exports = router;
