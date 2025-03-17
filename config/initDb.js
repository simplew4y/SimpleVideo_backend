const { sequelize, createConnection } = require('./database');
const { init: initUser } = require('../models/User');
const { init: initVideoGenerationTaskDefinition } = require('../models/VideoGenerationTaskDefinition');
const { init: initVideoGenerationTaskStatus } = require('../models/VideoGenerationTaskStatus');
const { init: initUserSubscription } = require('../models/UserSubscription');
const { init: initUserCredit } = require('../models/UserCredit');
const { init: initUserFavorite } = require('../models/UserFavorite');
const { init: initOAuthConnection } = require('../models/OAuthConnection');

async function initializeDatabase() {
  try {
    // Create database
    await sequelize.query('CREATE DATABASE simplevideo').catch(err => {
      if (err.parent.code !== '42P04') {
        throw err;
      }
    });

    // Close postgres connection
    await sequelize.close();

    // Create new connection to simplevideo database
    const newSequelize = createConnection('simplevideo');
    
    // Test connection
    await newSequelize.authenticate();
    
    // Initialize all models with new connection
    const User = initUser(newSequelize);
    const VideoGenerationTaskDefinition = initVideoGenerationTaskDefinition(newSequelize);
    const VideoGenerationTaskStatus = initVideoGenerationTaskStatus(newSequelize);
    const UserSubscription = initUserSubscription(newSequelize);
    const UserCredit = initUserCredit(newSequelize);
    const UserFavorite = initUserFavorite(newSequelize);
    const OAuthConnection = initOAuthConnection(newSequelize);
    
    // 设置模型之间的关联关系
    // User与VideoGenerationTaskDefinition的关联
    User.hasMany(VideoGenerationTaskDefinition, { foreignKey: 'user_id' });
    VideoGenerationTaskDefinition.belongsTo(User, { foreignKey: 'user_id' });
    
    // VideoGenerationTaskDefinition与VideoGenerationTaskStatus的关联
    VideoGenerationTaskDefinition.hasOne(VideoGenerationTaskStatus, { foreignKey: 'task_id' });
    VideoGenerationTaskStatus.belongsTo(VideoGenerationTaskDefinition, { foreignKey: 'task_id' });
    
    // User与UserSubscription的关联
    User.hasMany(UserSubscription, { foreignKey: 'user_id' });
    UserSubscription.belongsTo(User, { foreignKey: 'user_id' });
    
    // User与UserCredit的关联
    User.hasOne(UserCredit, { foreignKey: 'user_id' });
    UserCredit.belongsTo(User, { foreignKey: 'user_id' });
    
    // User与UserFavorite的关联
    User.hasMany(UserFavorite, { foreignKey: 'user_id' });
    UserFavorite.belongsTo(User, { foreignKey: 'user_id' });
    
    // VideoGenerationTaskDefinition与UserFavorite的关联
    VideoGenerationTaskDefinition.hasMany(UserFavorite, { foreignKey: 'task_id' });
    UserFavorite.belongsTo(VideoGenerationTaskDefinition, { foreignKey: 'task_id' });
    
    // User与OAuthConnection的关联
    User.hasMany(OAuthConnection, { foreignKey: 'user_id' });
    OAuthConnection.belongsTo(User, { foreignKey: 'user_id' });
    
    // Sync models
    await newSequelize.sync({ alter: true });
    
    console.log('Database initialized successfully');
    return newSequelize;
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

module.exports = initializeDatabase;
