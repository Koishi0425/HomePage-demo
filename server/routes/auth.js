const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { z } = require('zod');
const User = require('../models/User');
const Homepage = require('../models/Homepage');

const registerSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6)
});

router.post('/register', asyncHandler(async (req, res) => {
  const validation = registerSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ code: 400, msg: 'error', error: validation.error.errors });
  }

  const { username, email, password } = req.body;

  const userExists = await User.findOne({ $or: [{ email }, { username }] });
  if (userExists) {
    return res.status(400).json({ code: 400, msg: 'error', error: 'User already exists' });
  }

  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  const user = await User.create({
    username,
    email,
    password_hash
  });

  // Initialize empty homepage
  await Homepage.create({ user_id: user._id });

  res.status(201).json({ code: 200, msg: 'success', data: { id: user._id, username: user.username } });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (user && (await bcrypt.compare(password, user.password_hash))) {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
    res.json({
      code: 200,
      msg: 'success',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          avatar_url: user.avatar_url
        }
      }
    });
  } else {
    res.status(401).json({ code: 401, msg: 'error', error: 'Invalid credentials' });
  }
}));

router.get('/users/:userId', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId).select('-password_hash');
  if (!user) {
    return res.status(404).json({ code: 404, msg: 'error', error: 'User not found' });
  }
  
  const homepage = await Homepage.findOne({ user_id: user._id, is_published: true });
  
  res.json({
    code: 200,
    msg: 'success',
    data: {
      user,
      homepage: homepage ? homepage.components_config : null
    }
  });
}));

module.exports = router;
