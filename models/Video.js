const { Model, DataTypes } = require('sequelize');
const { User } = require('./User');

class Video extends Model {}

const init = (sequelizeInstance) => {
  Video.init({
    model: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    taskType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    inputData: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    videoUrl: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending',
    },
  }, {
    sequelize: sequelizeInstance,
    modelName: 'Video'
  });

  // Set up associations
  Video.belongsTo(User);
  User.hasMany(Video);

  return Video;
};

module.exports = { Video, init };