// app.js
const express = require('express');
const app = express();
const authRoutes = require('./routes/authRoutes');
const threeTwoRoutes = require('./routes/threeTwoRoutes');
const helloRoutes = require('./routes/helloRoutes');
const deerRoutes = require('./routes/deerRoutes');  // 添加新的路由
const initializeDatabase = require('./config/initDb');
const fileUpload = require('express-fileupload');
const cors = require('cors');

// 配置CORS中间件
app.use(cors({
  origin: '*', // 允许所有域名的请求，在生产环境中应该设置为特定域名
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 重要：这些中间件的顺序很重要
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }, // 限制文件大小为 50MB
  createParentPath: true,
  debug: true  // 添加调试模式
}));

app.use('/api/auth', authRoutes);
app.use('/api/302', threeTwoRoutes);  // 更新路由路径
app.use('/hello', helloRoutes);  // 添加新的路由
app.use('/api/deer', deerRoutes);  // 添加新的路由路径

// Initialize database before starting the server
const startServer = async () => {
  try {
    const sequelize = await initializeDatabase();
    // Store sequelize instance for use in models
    app.set('sequelize', sequelize);
    console.log('Database initialization complete');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
};

// Only start server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = app;