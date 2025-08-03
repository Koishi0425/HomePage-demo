const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.get('/user/homepage', async (req, res) => {
  const user = await User.findOne({ username: req.query.username });
  if (user) {
    res.json(user.homepageContent);
  } else {
    res.status(404).send('User not found');
  }
});

router.put('/user/homepage', async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (user) {
    user.homepageContent = req.body.homepageContent;
    await user.save();
    res.status(200).send('Homepage updated');
  } else {
    res.status(404).send('User not found');
  }
});

module.exports = router;
