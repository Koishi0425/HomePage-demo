const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/homepagedemo')
  .then(() => {
    console.log("MongoDB 连接成功！");
  })
  .catch(err => {
    console.error("MongoDB 连接失败:", err.message);
  });