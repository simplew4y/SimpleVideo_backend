/**
 * Runway API 授权中间件
 * 为所有 Runway API 请求自动添加授权头
 */
const axios = require('axios');
require('dotenv').config();

// Runway API 密钥
const RUNWAY_API_KEY = process.env.RUNWAY_API_KEY || process.env.THREE_TWO_API_KEY;

// 创建一个预配置的axios实例，专门用于Runway API请求
const runwayAxios = axios.create({
  baseURL: 'https://api.302.ai',
  headers: {
    'Authorization': `Bearer ${RUNWAY_API_KEY}`
  }
});

/**
 * 直接请求Runway API
 * @param {string} path - API路径
 * @param {Object} options - 请求选项
 * @returns {Promise<Object>} API响应
 */
const requestRunwayApi = async (path, options = {}) => {
  const { method = 'get', data = null, headers = {} } = options;
  
  try {
    const response = await runwayAxios({
      method,
      url: path,
      data,
      headers
    });
    
    return response.data;
  } catch (error) {
    console.error('Runway API 请求失败:', error);
    throw new Error(`Runway API 请求失败: ${error.response?.data?.message || error.message}`);
  }
};

module.exports = {
  runwayAxios,
  requestRunwayApi
}; 