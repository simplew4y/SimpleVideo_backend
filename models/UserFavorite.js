const { DataTypes } = require('sequelize');

let UserFavorite;

// Initialize model
const init = (sequelizeInstance) => {
  UserFavorite = sequelizeInstance.define('UserFavorite', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    task_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'video_generation_task_definitions',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'user_favorites',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      {
        name: 'idx_user_favorites_user_id',
        fields: ['user_id']
      },
      {
        unique: true,
        fields: ['user_id', 'task_id']
      }
    ]
  });
  
  return UserFavorite;
};

module.exports = { 
  UserFavorite: () => UserFavorite,
  init 
}; 