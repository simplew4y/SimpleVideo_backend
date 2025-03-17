const { DataTypes } = require('sequelize');

let UserSubscription;

// Initialize model
const init = (sequelizeInstance) => {
  UserSubscription = sequelizeInstance.define('UserSubscription', {
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
    plan_type: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    auto_renew: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    price_paid: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    payment_method: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    subscription_interval: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    credits_per_period: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    next_renewal_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cancellation_date: {
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
    tableName: 'user_subscriptions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_user_subscriptions_user_id',
        fields: ['user_id']
      },
      {
        name: 'idx_user_subscriptions_status',
        fields: ['status']
      },
      {
        name: 'idx_user_subscriptions_end_date',
        fields: ['end_date']
      }
    ]
  });
  
  return UserSubscription;
};

module.exports = { 
  UserSubscription: () => UserSubscription,
  init 
}; 