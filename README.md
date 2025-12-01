# 插画展示平台 (Illustration Platform)

## 项目简介
这是一个基于 Vue3 + MongoDB 的插画展示平台，支持用户上传插画、制作个性化主页。

## 技术栈
- **前端**: Vue 3, Vite, Element Plus, Pinia, Vue Draggable
- **后端**: Node.js, Express, MongoDB, Mongoose
- **数据库**: MongoDB

## 目录结构
- `client/`: 前端项目代码
- `server/`: 后端项目代码
- `docker-compose.yml`: Docker 部署配置

## 本地开发指南

### 1. 环境准备
- Node.js (v16+)
- MongoDB (本地运行在 27017 端口)

### 2. 启动后端
```bash
cd server
npm install
# 确保本地 MongoDB 已启动
# 初始化数据库（可选，首次运行）
node init-mongo.js
# 启动服务
npm run dev
```
后端服务运行在 `http://localhost:3000`

### 3. 启动前端
```bash
cd client
npm install
npm run dev
```
前端服务运行在 `http://localhost:5173`

## 部署指南

### 使用 Docker Compose
```bash
docker-compose up --build -d
```

### 手动部署
1. **后端**: 使用 PM2 运行 `server/app.js`
2. **前端**: 运行 `npm run build` 生成 `dist` 目录，使用 Nginx 托管
3. **数据库**: 确保 MongoDB 运行并可访问

## API 文档
详见后端代码 `server/routes` 目录。

## 核心功能
- **主页制作**: 拖拽组件，实时预览，JSON 存储配置。
- **瀑布流**: 首页展示插画，支持无限滚动。
- **用户系统**: 注册、登录、个人资料。
