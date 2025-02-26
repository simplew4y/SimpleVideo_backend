// config/database.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create initial connection to postgres database
const sequelize = new Sequelize('postgres', 'apple', '253126', {
  host: 'localhost',
  dialect: 'postgres',
  port: 5432,
  logging: console.log,
});

// Function to create new database connection
function createConnection(dbName = 'postgres') {
  return new Sequelize(dbName, 'apple', '253126', {
    host: 'localhost',
    dialect: 'postgres',
    port: 5432,
    logging: console.log,
  });
}

module.exports = {
  sequelize,
  createConnection,
  Sequelize
};