const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

const KLING_API_URL = 'https://api.302ai.cn/klingai/m2v_txt2video';
const KLING_TASK_URL = 'https://api.302.ai/klingai/task';

class KlingService {
  static async generateVideo(prompt, options = {}) {
    const formData = new FormData();
    
    // Required parameters
    formData.append('prompt', prompt);
    formData.append('negative_prompt', options.negative_prompt || '');
    formData.append('cfg', options.cfg || '0.5');
    formData.append('aspect_ratio', options.aspect_ratio || '1:1');
    
    // Camera settings
    if (options.camera_type) {
      formData.append('camera_type', options.camera_type);
      formData.append('camera_value', options.camera_value || '0');
    }

    const config = {
      method: 'post',
      url: KLING_API_URL,
      headers: {
        'Authorization': `Bearer ${process.env.KLING_API_KEY}`,
        ...formData.getHeaders()
      },
      data: formData
    };

    try {
      const response = await axios(config);
      
      if (response.data.result !== 1) {
        throw new Error(response.data.message || 'Failed to generate video');
      }

    return response.data;
    } catch (error) {
      console.error('Kling API error:', error);
      throw new Error('Failed to generate video: ' + (error.response?.data?.message || error.message));
    }
  }

  static async checkTaskStatus(taskId) {
    // Implement status check endpoint if available
    // This would be used to poll for task completion
    throw new Error('Not implemented');
  }

  static async getTaskResult(taskId) {
    const config = {
      method: 'get',
      url: `${KLING_TASK_URL}/${taskId}/fetch`,
      headers: {
        'Authorization': `Bearer ${process.env.KLING_API_KEY}`
      }
    };

    try {
      const response = await axios(config);
      
      if (response.data.result !== 1) {
        throw new Error(response.data.message || 'Failed to fetch task result');
      }

      // Extract useful information from response
      const { status, works } = response.data.data;
      const videoUrl = works?.[0]?.resource?.resource;
      const coverUrl = works?.[0]?.cover?.resource;

      return {
        status,
        videoUrl,
        coverUrl,
        rawResponse: response.data
      };
    } catch (error) {
      console.error('Kling API error:', error);
      throw new Error('Failed to fetch task result: ' + (error.response?.data?.message || error.message));
    }
  }
}

module.exports = KlingService;
