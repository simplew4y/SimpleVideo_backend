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

// 配置 CORS 中间件
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://your-production-domain.com'  // 生产环境域名
    : 'http://localhost:5173',              // 开发环境域名
  credentials: true,                        // 允许携带凭证（cookies）
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
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
app.use('/api/32', threeTwoRoutes);  // 更新路由路径
app.use('/api/hello', helloRoutes);  // 添加新的路由
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

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;