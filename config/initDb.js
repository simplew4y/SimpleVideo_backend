const { sequelize, createConnection } = require('./database');
const { init: initUser } = require('../models/User');
const { init: initVideo } = require('../models/Video');

async function initializeDatabase() {
  try {
    // Create database
    await sequelize.query('CREATE DATABASE simplevideo').catch(err => {
      if (err.parent.code !== '42P04') {
        throw err;
      }
    });

    // Close postgres connection
    await sequelize.close();

    // Create new connection to simplevideo database
    const newSequelize = createConnection('simplevideo');
    
    // Test connection
    await newSequelize.authenticate();
    
    // Initialize all models with new connection
    initUser(newSequelize);
    initVideo(newSequelize);
    
    // Sync models
    await newSequelize.sync({ alter: true });
    
    console.log('Database initialized successfully');
    return newSequelize;
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

module.exports = initializeDatabase;
