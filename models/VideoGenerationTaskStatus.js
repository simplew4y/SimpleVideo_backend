const { DataTypes } = require('sequelize');

let VideoGenerationTaskStatus;

// Initialize model
const init = (sequelizeInstance) => {
  VideoGenerationTaskStatus = sequelizeInstance.define('VideoGenerationTaskStatus', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
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
    external_task_id: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'pending'
    },
    result_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    error_message: {
      type: DataTypes.TEXT,
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
    tableName: 'video_generation_task_statuses',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_task_statuses_task_id',
        fields: ['task_id']
      },
      {
        name: 'idx_task_statuses_status',
        fields: ['status']
      },
      {
        name: 'idx_task_statuses_created_at',
        fields: ['created_at']
      }
    ]
  });
  
  return VideoGenerationTaskStatus;
};

module.exports = { 
  VideoGenerationTaskStatus: () => VideoGenerationTaskStatus,
  init 
}; 