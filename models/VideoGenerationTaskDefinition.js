const { DataTypes } = require('sequelize');

let VideoGenerationTaskDefinition;

// Initialize model
const init = (sequelizeInstance) => {
  VideoGenerationTaskDefinition = sequelizeInstance.define('VideoGenerationTaskDefinition', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    task_type: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    model: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    high_quality: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    prompt: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    negative_prompt: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    aspect_ratio: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    camera_type: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    camera_value: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    cfg: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    additional_params: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    start_img_path: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    end_img_path: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    credits: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'video_generation_task_definitions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false, // 没有updated_at字段
    indexes: [
      {
        name: 'idx_task_definitions_user_id',
        fields: ['user_id']
      },
      {
        name: 'idx_task_definitions_task_type',
        fields: ['task_type']
      },
      {
        name: 'idx_task_definitions_created_at',
        fields: ['created_at']
      }
    ]
  });
  
  return VideoGenerationTaskDefinition;
};

module.exports = { 
  VideoGenerationTaskDefinition: () => VideoGenerationTaskDefinition,
  init 
}; 