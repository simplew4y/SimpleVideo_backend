// config/database.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create initial connection to postgres database
const sequelize = new Sequelize('postgres', 'postgres.xjuugabhwazqtdkktuhn', '253126hfhL!', {
  host: 'aws-0-ap-southeast-1.pooler.supabase.com',
  dialect: 'postgres',
  port: 6543,
  logging: console.log,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    },
    keepAlive: true,
    family: 4
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Function to create new database connection
function createConnection(dbName = 'postgres') {
  return new Sequelize(dbName, 'postgres.xjuugabhwazqtdkktuhn', '253126hfhL!', {
    host: 'aws-0-ap-southeast-1.pooler.supabase.com',
    dialect: 'postgres',
    port: 6543,
    logging: console.log,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      },
      keepAlive: true,
      family: 4
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
}

module.exports = {
  sequelize,
  createConnection,
  Sequelize
};