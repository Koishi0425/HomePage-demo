const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes');
require('./config/db');  // 连接数据库

app.use(express.json());
app.use(userRoutes);

module.exports = app;
