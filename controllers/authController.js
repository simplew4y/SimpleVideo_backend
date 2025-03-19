// controllers/authController.js
const { User } = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// 检查必要的环境变量
if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  console.error('错误: JWT_SECRET 和 JWT_REFRESH_SECRET 必须在环境变量中设置');
  process.exit(1);
}

// 日志记录函数
const logUserLogin = (user, loginType) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 用户登录 - ID: ${user.id}, 邮箱: ${user.email}, 用户名: ${user.username}, 登录方式: ${loginType}`);
};

const generateTokens = (user) => {
  try {
    const accessToken = jwt.sign(
      { 
        id: user.id, 
        role: user.role,
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  } catch (error) {
    console.error('Token generation error:', error);
    throw new Error('令牌生成失败');
  }
};

const register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    let user = await User().findOne({ where: { email } });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user = await User().create({ username, email, password: hashedPassword });
    const { accessToken, refreshToken } = generateTokens(user);
    res.json({
      userId: user.id,
      accessToken,
      refreshToken,
      expiresIn: 3600,
      role: user.role,
      createdAt: user.created_at,
      preferences: user.preferences
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: '注册过程中发生错误' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User().findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const { accessToken, refreshToken } = generateTokens(user);
    
    // 记录用户登录日志
    logUserLogin(user, '邮箱密码');

    res.json({
      userId: user.id,
      accessToken,
      refreshToken,
      expiresIn: 3600,
      role: user.role,
      createdAt: user.created_at,
      preferences: user.preferences
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: '登录过程中发生错误' });
  }
};

const googleLogin = async (req, res) => {
  const { email, name, picture, sub, given_name, family_name } = req.body;
  
  try {
    console.log(`[Google登录] 尝试使用邮箱 ${email} 登录`);
    
    // 查找用户
    let user = await User().findOne({ where: { email } });
    
    if (!user) {
      console.log(`[Google登录] 用户 ${email} 首次登录，创建新账户`);
      // 创建新用户
      user = await User().create({
        username: name,
        email,
        google_id: sub,
        picture,
        given_name,
        family_name,
        role: 'user',  // 设置默认角色
        preferences: {
          theme: 'light',
          notifications: true,
          language: 'en'
        }
      });
      console.log(`[Google登录] 新用户创建成功，ID: ${user.id}`);
    } else {
      console.log(`[Google登录] 用户已存在，更新 Google 账号信息`);
      // 更新现有用户的 Google 信息
      await user.update({
        google_id: sub,
        picture,
        given_name,
        family_name,
        username: name // 更新用户名为 Google 账号名称
      });
      console.log(`[Google登录] 用户信息更新成功，ID: ${user.id}`);
    }

    // 生成令牌
    const { accessToken, refreshToken } = generateTokens(user);

    // 记录用户登录日志
    logUserLogin(user, 'Google');

    // 返回用户信息和令牌
    res.json({
      userId: user.id,
      accessToken,
      refreshToken,
      expiresIn: 3600, // 1小时过期
      role: user.role,
      createdAt: user.created_at,
      preferences: user.preferences,
      profile: {
        email: user.email,
        name: user.username,
        picture: user.picture,
        given_name: user.given_name,
        family_name: user.family_name
      }
    });
  } catch (err) {
    console.error('[Google登录错误]:', err);
    res.status(500).json({ 
      message: '登录过程中发生错误',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

module.exports = { register, login, googleLogin };