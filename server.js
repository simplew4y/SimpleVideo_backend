// server.js
const app = require('./app');
const initializeDatabase = require('./config/initDb');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Initialize database
    const sequelize = await initializeDatabase();
    
    // Start server after database is initialized
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();