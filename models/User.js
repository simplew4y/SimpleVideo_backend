const { Sequelize, sequelize } = require('../config/database');

const User = sequelize.define('User', {
  username: {
    type: Sequelize.DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: Sequelize.DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: Sequelize.DataTypes.STRING,
    allowNull: false,
  },
});

// Initialize model
const init = (sequelizeInstance) => {
  User.init(User.rawAttributes, {
    sequelize: sequelizeInstance,
    modelName: 'User'
  });
  return User;
};

module.exports = { User, init };