const { DataTypes } = require('sequelize');

let UserCredit;

// Initialize model
const init = (sequelizeInstance) => {
  UserCredit = sequelizeInstance.define('UserCredit', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    level: {
      type: DataTypes.STRING(20),
      allowNull: false
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
    credits_balance: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    total_credits_purchased: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    total_credits_used: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    last_purchase_date: {
      type: DataTypes.DATE,
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
    tableName: 'user_credits',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_user_credits_user_id',
        fields: ['user_id']
      }
    ]
  });
  
  return UserCredit;
};

module.exports = { 
  UserCredit: () => UserCredit,
  init 
}; 