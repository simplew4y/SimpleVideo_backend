const { DataTypes } = require('sequelize');

let User;

// Initialize model
const init = (sequelizeInstance) => {
  User = sequelizeInstance.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true // 可以为NULL，因为谷歌登录的用户可能没有密码
    },
    google_id: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: true
    },
    profile_image: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  
  return User;
};

module.exports = { 
  User: () => User, // 返回函数以确保在初始化后访问
  init 
};