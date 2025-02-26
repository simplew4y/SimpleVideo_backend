// models/Video.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Video = sequelize.define('Video', {
  model: {
    type: DataTypes.STRING, // 'klings' 或 'runway'
    allowNull: false,
  },
  taskType: {
    type: DataTypes.STRING, // 'text-to-video' 或 'image-to-video'
    allowNull: false,
  },
  inputData: {
    type: DataTypes.TEXT, // 用户输入的文本或图片URL
    allowNull: false,
  },
  videoUrl: {
    type: DataTypes.STRING, // 生成的视频链接
  },
  status: {
    type: DataTypes.STRING, // 'pending', 'completed', 'failed'
    defaultValue: 'pending',
  },
});

Video.belongsTo(User); // 视频任务属于某个用户
User.hasMany(Video);

module.exports = Video;