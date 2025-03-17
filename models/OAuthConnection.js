const { DataTypes } = require('sequelize');

let OAuthConnection;

// Initialize model
const init = (sequelizeInstance) => {
  OAuthConnection = sequelizeInstance.define('OAuthConnection', {
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
    provider: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    provider_user_id: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    access_token: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    refresh_token: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    token_expires_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    profile_data: {
      type: DataTypes.JSONB,
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
    tableName: 'oauth_connections',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_oauth_connections_user_id',
        fields: ['user_id']
      },
      {
        unique: true,
        fields: ['provider', 'provider_user_id']
      }
    ]
  });
  
  return OAuthConnection;
};

module.exports = { 
  OAuthConnection: () => OAuthConnection,
  init 
}; 