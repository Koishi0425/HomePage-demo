const app = require('./app');
const port = process.env.PORT || 3000; // 使用 3000 或其他非 27017 的端口

app.listen(port, () => {
  console.log(`Express 服务器运行在 http://127.0.0.1:${port}`);
});