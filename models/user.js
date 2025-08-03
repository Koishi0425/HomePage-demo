const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  homepageContent: [{ type: String }]  // 存储主页元素内容
});

module.exports = mongoose.model('User', userSchema);
