const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

// DeerAPI 基础 URL
const DEER_BASE_URL = 'https://api.deerapi.com';

// 定义不同的 API 端点
const DEER_ENDPOINTS = {
  TEXT_TO_VIDEO: '/api/v1/videos/text2video',
  TASKS: '/api/v1/tasks'
};

// 相机运动类型枚举
const CAMERA_TYPES = {
  DOWN_BACK: 'down_back',
  FORWARD_UP: 'forward_up',
  LEFT_TURN_FORWARD: 'left_turn_forward',
  RIGHT_TURN_FORWARD: 'right_turn_forward',
  SIMPLE: 'simple'
};

class DeerService {
  /**
   * 文本生成视频
   * @param {string} prompt - 正向文本提示
   * @param {Object} options - 其他选项
   * @returns {Promise} API 响应
   */
  static async generateVideo(prompt, options = {}) {
    try {
      // 打印请求参数
      console.log('DeerAPI 请求参数:', {
        prompt,
        ...options
      });

      // 构建请求数据
      const requestData = {
        prompt,
        ...options
      };

      // 如果有相机控制参数，进行格式化
      if (options.camera_control) {
        requestData.camera_control = {
          type: options.camera_control.type,
          config: {
            horizontal: options.camera_control.config?.horizontal,
            vertical: options.camera_control.config?.vertical,
            pan: options.camera_control.config?.pan,
            tilt: options.camera_control.config?.tilt,
            roll: options.camera_control.config?.roll,
            zoom: options.camera_control.config?.zoom
          }
        };
      }

      // 打印完整请求信息
      console.log('DeerAPI 请求数据:', requestData);
      console.log('请求URL:', `${DEER_BASE_URL}${DEER_ENDPOINTS.TEXT_TO_VIDEO}`);

      const response = await axios.post(
        `${DEER_BASE_URL}${DEER_ENDPOINTS.TEXT_TO_VIDEO}`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.DEER_API_KEY}`
          }
        }
      );

      return response.data;
    } catch (error) {
      // 打印详细错误信息
      console.error('DeerAPI 错误详情:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      
      throw new Error(`DeerAPI 文生视频失败: ${error.message}`);
    }
  }

  /**
   * 检查任务状态
   * @param {string} taskId - 任务ID
   */
  static async checkTaskStatus(taskId) {
    try {
      const response = await axios.get(
        `${DEER_BASE_URL}${DEER_ENDPOINTS.TASKS}/${taskId}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.DEER_API_KEY}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('DeerAPI 任务状态查询错误:', error);
      throw new Error(`获取任务状态失败: ${error.message}`);
    }
  }
}

// 导出常量和服务类
DeerService.ENDPOINTS = DEER_ENDPOINTS;
DeerService.CAMERA_TYPES = CAMERA_TYPES;

module.exports = DeerService; 