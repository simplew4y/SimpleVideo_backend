// app.js
const express = require('express');
const app = express();
const authRoutes = require('./routes/authRoutes');
const videoRoutes = require('./routes/videoRoutes');
const helloRoutes = require('./routes/helloRoutes');
const initializeDatabase = require('./config/initDb');

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/hello', helloRoutes);  // 添加新的路由

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