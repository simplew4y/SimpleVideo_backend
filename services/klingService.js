const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

// Kling API 基础 URL
const KLING_BASE_URL = 'https://api.302ai.cn';
const KLING_TASK_URL = 'https://api.302.ai/klingai/task';

// 定义不同的 API 端点
const KLING_ENDPOINTS = {
  STANDARD: '/klingai/m2v_txt2video',
  HIGH_QUALITY_5S: '/klingai/m2v_txt2video_hq_5s',
  HIGH_QUALITY_10S: '/klingai/m2v_txt2video_hq_10s',
  IMAGE_TO_VIDEO_5S: '/klingai/m2v_img2video',
  IMAGE_TO_VIDEO_10S: '/klingai/m2v_img2video_10s',
  IMAGE_TO_VIDEO_15: '/klingai/m2v_15_img2video',
  IMAGE_TO_VIDEO_15_10S: '/klingai/m2v_15_img2video_10s',
  IMAGE_TO_VIDEO_HQ: '/klingai/m2v_img2video_hq',
  IMAGE_TO_VIDEO_HQ_10S: '/klingai/m2v_img2video_hq_10s',
  TEXT_TO_VIDEO_16_5S: '/klingai/m2v_16_txt2video_5s',
  TEXT_TO_VIDEO_16_10S: '/klingai/m2v_16_txt2video_10s',
  TEXT_TO_VIDEO_16_HQ_5S: '/klingai/m2v_16_txt2video_hq_5s',
  TEXT_TO_VIDEO_16_HQ_10S: '/klingai/m2v_16_txt2video_hq_10s',
  IMAGE_TO_VIDEO_16_5S: '/klingai/m2v_16_img2video_5s',
  IMAGE_TO_VIDEO_16_10S: '/klingai/m2v_16_img2video_10s',
  IMAGE_TO_VIDEO_16_HQ_5S: '/klingai/m2v_16_img2video_hq_5s',
  IMAGE_TO_VIDEO_16_HQ_10S: '/klingai/m2v_16_img2video_hq_10s',
  EXTEND_VIDEO: '/klingai/m2v_extend_video'  // 新增视频扩展端点
};

class KlingService {
  /**
   * 生成视频的通用方法
   * @param {string} prompt - 提示词
   * @param {Object} options - 选项
   * @param {string} endpoint - API 端点类型
   */
  static async generateVideo(prompt, options = {}, endpoint = KLING_ENDPOINTS.STANDARD) {
    const formData = new FormData();
    
    // 必需参数
    formData.append('prompt', prompt);
    formData.append('negative_prompt', options.negative_prompt || '');
    formData.append('cfg', options.cfg || '0.5');
    formData.append('aspect_ratio', options.aspect_ratio || '1:1');
    
    // 相机设置
    if (options.camera_type) {
      formData.append('camera_type', options.camera_type);
      formData.append('camera_value', options.camera_value || '0');
    }

    // 添加端点特定的参数
    if (options.additionalParams) {
      Object.entries(options.additionalParams).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }
    
    const config = {
      method: 'post',
      url: `${KLING_BASE_URL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${process.env.KLING_API_KEY}`,
        ...formData.getHeaders()
      },
      data: formData
    };
    
    try {
      const response = await axios(config);
      
      if (response.data.result !== 1) {
        throw new Error(response.data.message || '生成视频失败');
      }

      return response.data;
    } catch (error) {
      console.error('Kling API 错误:', error);
      throw new Error('生成视频失败: ' + (error.response?.data?.message || error.message));
    }
  }

  /**
   * 从图片生成视频的通用方法
   * @param {Buffer|Stream} inputImage - 输入图片
   * @param {Buffer|Stream} tailImage - 尾部图片（可选）
   * @param {Object} options - 其他选项
   * @param {string} endpoint - API 端点类型
   */
  static async generateVideoFromImage(inputImage, tailImage = null, options = {}, endpoint = KLING_ENDPOINTS.IMAGE_TO_VIDEO_5S) {
    try {
      // 打印请求参数
      console.log('请求参数:', {
        ...options,
        inputImageSize: inputImage.length,
        tailImageSize: tailImage?.length,
        endpoint: endpoint
      });

      // 构建请求数据
      const formData = new FormData();
      formData.append('input_image', inputImage);
      if (tailImage) {
        formData.append('tail_image', tailImage);
      }
      
      // 添加其他参数
      formData.append('prompt', options.prompt || '');
      formData.append('negative_prompt', options.negative_prompt || '');
      formData.append('cfg', options.cfg || '0.5');
      formData.append('aspect_ratio', options.aspect_ratio || '1:1');
      
      // 相机设置
      if (options.camera_type) {
        formData.append('camera_type', options.camera_type);
        formData.append('camera_value', options.camera_value || '0');
      }
      
      // 添加其他可能的参数
      if (options.additionalParams) {
        Object.entries(options.additionalParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value);
          }
        });
      }

      // 打印完整请求信息
      console.log('请求头:', {
        'Content-Type': formData.getHeaders()['content-type']
      });

      const response = await axios.post(
        `${KLING_BASE_URL}${endpoint}`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${process.env.KLING_API_KEY}`
          }
        }
      );

      return response.data;
    } catch (error) {
      // 打印详细错误信息
      console.error('Kling API 错误详情:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      
      throw new Error(`图片生成视频失败: ${error.message}`);
    }
  }
  
  /**
   * 从图片生成 5 秒视频
   */
  static async generateVideoFromImage5s(inputImage, tailImage = null, options = {}) {
    return this.generateVideoFromImage(inputImage, tailImage, options, KLING_ENDPOINTS.IMAGE_TO_VIDEO_5S);
  }

  /**
   * 从图片生成 10 秒视频
   */
  static async generateVideoFromImage10s(inputImage, tailImage = null, options = {}) {
    return this.generateVideoFromImage(inputImage, tailImage, options, KLING_ENDPOINTS.IMAGE_TO_VIDEO_10S);
  }

  /**
   * 从图片生成视频 (1.5 版本模型)
   * 注意：1.5 版本可能不需要 tail_image 参数
   */
  static async generateVideoFromImage15(inputImage, options = {}) {
    try {
      // 打印请求参数
      console.log('1.5 版本请求参数:', {
        ...options,
        inputImageSize: inputImage.length,
        endpoint: KLING_ENDPOINTS.IMAGE_TO_VIDEO_15
      });

      // 构建请求数据
      const formData = new FormData();
      formData.append('input_image', inputImage);
      
      // 添加其他参数
      formData.append('prompt', options.prompt || '');
      formData.append('negative_prompt', options.negative_prompt || '');
      formData.append('cfg', options.cfg || '0.5');
      formData.append('aspect_ratio', options.aspect_ratio || '1:1');
      
      // 相机设置
      if (options.camera_type) {
        formData.append('camera_type', options.camera_type);
        formData.append('camera_value', options.camera_value || '0');
      }
      
      // 添加其他可能的参数
      if (options.additionalParams) {
        Object.entries(options.additionalParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value);
          }
        });
      }

      // 打印完整请求信息
      console.log('1.5 版本请求头:', {
        'Content-Type': formData.getHeaders()['content-type']
      });

      const response = await axios.post(
        `${KLING_BASE_URL}${KLING_ENDPOINTS.IMAGE_TO_VIDEO_15}`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${process.env.KLING_API_KEY}`
          }
        }
      );

      return response.data;
    } catch (error) {
      // 打印详细错误信息
      console.error('Kling 1.5 API 错误详情:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      
      throw new Error(`1.5 版本图片生成视频失败: ${error.message}`);
    }
  }

  /**
   * 从图片生成视频 (1.5 版本模型，10秒)
   * 注意：1.5 版本不需要 tail_image 参数
   */
  static async generateVideoFromImage15_10s(inputImage, options = {}) {
    try {
      // 打印请求参数
      console.log('1.5 版本 10s 请求参数:', {
        ...options,
        inputImageSize: inputImage.length,
        endpoint: KLING_ENDPOINTS.IMAGE_TO_VIDEO_15_10S
      });

      // 构建请求数据
      const formData = new FormData();
      formData.append('input_image', inputImage);
      
      // 添加其他参数
      formData.append('prompt', options.prompt || '');
      formData.append('negative_prompt', options.negative_prompt || '');
      formData.append('cfg', options.cfg || '0.5');
      formData.append('aspect_ratio', options.aspect_ratio || '1:1');
      
      // 相机设置
      if (options.camera_type) {
        formData.append('camera_type', options.camera_type);
        formData.append('camera_value', options.camera_value || '0');
      }
      
      // 添加其他可能的参数
      if (options.additionalParams) {
        Object.entries(options.additionalParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value);
          }
        });
      }

      // 打印完整请求信息
      console.log('1.5 版本 10s 请求头:', {
        'Content-Type': formData.getHeaders()['content-type']
      });

      const response = await axios.post(
        `${KLING_BASE_URL}${KLING_ENDPOINTS.IMAGE_TO_VIDEO_15_10S}`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${process.env.KLING_API_KEY}`
          }
        }
      );

      return response.data;
    } catch (error) {
      // 打印详细错误信息
      console.error('Kling 1.5 10s API 错误详情:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      
      throw new Error(`1.5 版本 10s 图片生成视频失败: ${error.message}`);
    }
  }

  /**
   * 生成标准质量视频
   */
  static async generateStandardVideo(prompt, options = {}) {
    return this.generateVideo(prompt, options, KLING_ENDPOINTS.STANDARD);
  }

  /**
   * 生成高质量 5 秒视频
   */
  static async generateHighQuality5sVideo(prompt, options = {}) {
    return this.generateVideo(prompt, options, KLING_ENDPOINTS.HIGH_QUALITY_5S);
  }

  /**
   * 生成高质量 10 秒视频
   */
  static async generateHighQuality10sVideo(prompt, options = {}) {
    return this.generateVideo(prompt, options, KLING_ENDPOINTS.HIGH_QUALITY_10S);
  }

  /**
   * 检查任务状态
   */
  static async checkTaskStatus(taskId) {
    const config = {
      method: 'get',
      url: `${KLING_TASK_URL}/${taskId}`,
      headers: {
        'Authorization': `Bearer ${process.env.KLING_API_KEY}`
      }
    };

    try {
      const response = await axios(config);
      
      if (response.data.result !== 1) {
        throw new Error(response.data.message || '获取任务状态失败');
      }

      return response.data;
    } catch (error) {
      console.error('Kling API 错误:', error);
      throw new Error('获取任务状态失败: ' + (error.response?.data?.message || error.message));
    }
  }

  /**
   * 获取任务结果
   */
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
        throw new Error(response.data.message || '获取任务结果失败');
      }

      // 从响应中提取有用信息
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
      console.error('Kling API 错误:', error);
      throw new Error('获取任务结果失败: ' + (error.response?.data?.message || error.message));
    }
  }

  /**
   * 从图片生成高质量视频
   */
  static async generateVideoFromImageHQ(inputImage, tailImage = null, options = {}) {
    try {
      // 打印请求参数
      console.log('图生视频 HQ 请求参数:', {
        ...options,
        inputImageSize: inputImage.length,
        tailImageSize: tailImage?.length,
        endpoint: KLING_ENDPOINTS.IMAGE_TO_VIDEO_HQ
      });

      // 构建请求数据
      const formData = new FormData();
      formData.append('input_image', inputImage);
      if (tailImage) {
        formData.append('tail_image', tailImage);
      }
      
      // 添加其他参数
      formData.append('prompt', options.prompt || '');
      formData.append('negative_prompt', options.negative_prompt || '');
      formData.append('cfg', options.cfg || '0.5');
      formData.append('aspect_ratio', options.aspect_ratio || '1:1');
      
      // 相机设置
      if (options.camera_type) {
        formData.append('camera_type', options.camera_type);
        formData.append('camera_value', options.camera_value || '0');
      }
      
      // 添加其他可能的参数
      if (options.additionalParams) {
        Object.entries(options.additionalParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value);
          }
        });
      }

      // 打印完整请求信息
      console.log('图生视频 HQ 请求头:', {
        'Content-Type': formData.getHeaders()['content-type']
      });

      const response = await axios.post(
        `${KLING_BASE_URL}${KLING_ENDPOINTS.IMAGE_TO_VIDEO_HQ}`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${process.env.KLING_API_KEY}`
          }
        }
      );

      return response.data;
    } catch (error) {
      // 打印详细错误信息
      console.error('Kling 图生视频 HQ API 错误详情:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      
      throw new Error(`图生视频 HQ 失败: ${error.message}`);
    }
  }

  /**
   * 从图片生成高质量 10s 视频
   */
  static async generateVideoFromImageHQ10s(inputImage, tailImage = null, options = {}) {
    try {
      // 打印请求参数
      console.log('图生视频 HQ 10s 请求参数:', {
        ...options,
        inputImageSize: inputImage.length,
        tailImageSize: tailImage?.length,
        endpoint: KLING_ENDPOINTS.IMAGE_TO_VIDEO_HQ_10S
      });

      // 构建请求数据
      const formData = new FormData();
      formData.append('input_image', inputImage);
      if (tailImage) {
        formData.append('tail_image', tailImage);
      }
      
      // 添加其他参数
      formData.append('prompt', options.prompt || '');
      formData.append('negative_prompt', options.negative_prompt || '');
      formData.append('cfg', options.cfg || '0.5');
      formData.append('aspect_ratio', options.aspect_ratio || '1:1');
      
      // 相机设置
      if (options.camera_type) {
        formData.append('camera_type', options.camera_type);
        formData.append('camera_value', options.camera_value || '0');
      }
      
      // 添加其他可能的参数
      if (options.additionalParams) {
        Object.entries(options.additionalParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value);
          }
        });
      }

      // 打印完整请求信息
      console.log('图生视频 HQ 10s 请求头:', {
        'Content-Type': formData.getHeaders()['content-type']
      });

      const response = await axios.post(
        `${KLING_BASE_URL}${KLING_ENDPOINTS.IMAGE_TO_VIDEO_HQ_10S}`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${process.env.KLING_API_KEY}`
          }
        }
      );

      return response.data;
    } catch (error) {
      // 打印详细错误信息
      console.error('Kling 图生视频 HQ 10s API 错误详情:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      
      throw new Error(`图生视频 HQ 10s 失败: ${error.message}`);
    }
  }

  /**
   * 生成 1.6 版本 5s 视频
   */
  static async generateVideo16_5s(prompt, options = {}) {
    try {
      // 打印请求参数
      console.log('1.6 版本 5s 文生视频请求参数:', {
        prompt,
        ...options,
        endpoint: KLING_ENDPOINTS.TEXT_TO_VIDEO_16_5S
      });

      // 构建请求数据
      const formData = new FormData();
      formData.append('prompt', prompt);
      formData.append('negative_prompt', options.negative_prompt || '');
      formData.append('cfg', options.cfg || '0.5');
      formData.append('aspect_ratio', options.aspect_ratio || '1:1');
      
      // 添加其他可能的参数
      if (options.additionalParams) {
        Object.entries(options.additionalParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value);
          }
        });
      }

      // 打印完整请求信息
      console.log('1.6 版本 5s 文生视频请求头:', {
        'Content-Type': formData.getHeaders()['content-type']
      });

      const response = await axios.post(
        `${KLING_BASE_URL}${KLING_ENDPOINTS.TEXT_TO_VIDEO_16_5S}`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${process.env.KLING_API_KEY}`
          }
        }
      );

      return response.data;
    } catch (error) {
      // 打印详细错误信息
      console.error('Kling 1.6 版本 5s 文生视频 API 错误详情:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      
      throw new Error(`1.6 版本 5s 文生视频失败: ${error.message}`);
    }
  }

  /**
   * 生成 1.6 版本 10s 视频
   */
  static async generateVideo16_10s(prompt, options = {}) {
    try {
      // 打印请求参数
      console.log('1.6 版本 10s 文生视频请求参数:', {
        prompt,
        ...options,
        endpoint: KLING_ENDPOINTS.TEXT_TO_VIDEO_16_10S
      });

      // 构建请求数据
      const formData = new FormData();
      formData.append('prompt', prompt);
      formData.append('negative_prompt', options.negative_prompt || '');
      formData.append('cfg', options.cfg || '0.5');
      formData.append('aspect_ratio', options.aspect_ratio || '1:1');
      
      // 添加其他可能的参数
      if (options.additionalParams) {
        Object.entries(options.additionalParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value);
          }
        });
      }

      // 打印完整请求信息
      console.log('1.6 版本 10s 文生视频请求头:', {
        'Content-Type': formData.getHeaders()['content-type']
      });

      const response = await axios.post(
        `${KLING_BASE_URL}${KLING_ENDPOINTS.TEXT_TO_VIDEO_16_10S}`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${process.env.KLING_API_KEY}`
          }
        }
      );

      return response.data;
    } catch (error) {
      // 打印详细错误信息
      console.error('Kling 1.6 版本 10s 文生视频 API 错误详情:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      
      throw new Error(`1.6 版本 10s 文生视频失败: ${error.message}`);
    }
  }

  /**
   * 生成 1.6 版本高清 5s 视频
   */
  static async generateVideo16_HQ_5s(prompt, options = {}) {
    try {
      // 打印请求参数
      console.log('1.6 版本高清 5s 文生视频请求参数:', {
        prompt,
        ...options,
        endpoint: KLING_ENDPOINTS.TEXT_TO_VIDEO_16_HQ_5S
      });

      // 构建请求数据
      const formData = new FormData();
      formData.append('prompt', prompt);
      formData.append('negative_prompt', options.negative_prompt || '');
      formData.append('cfg', options.cfg || '0.5');
      formData.append('aspect_ratio', options.aspect_ratio || '1:1');
      
      // 添加其他可能的参数
      if (options.additionalParams) {
        Object.entries(options.additionalParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value);
          }
        });
      }

      // 打印完整请求信息
      console.log('1.6 版本高清 5s 文生视频请求头:', {
        'Content-Type': formData.getHeaders()['content-type']
      });

      const response = await axios.post(
        `${KLING_BASE_URL}${KLING_ENDPOINTS.TEXT_TO_VIDEO_16_HQ_5S}`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${process.env.KLING_API_KEY}`
          }
        }
      );

      return response.data;
    } catch (error) {
      // 打印详细错误信息
      console.error('Kling 1.6 版本高清 5s 文生视频 API 错误详情:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      
      throw new Error(`1.6 版本高清 5s 文生视频失败: ${error.message}`);
    }
  }

  /**
   * 生成 1.6 版本高清 10s 视频
   */
  static async generateVideo16_HQ_10s(prompt, options = {}) {
    try {
      // 打印请求参数
      console.log('1.6 版本高清 10s 文生视频请求参数:', {
        prompt,
        ...options,
        endpoint: KLING_ENDPOINTS.TEXT_TO_VIDEO_16_HQ_10S
      });

      // 构建请求数据
      const formData = new FormData();
      formData.append('prompt', prompt);
      formData.append('negative_prompt', options.negative_prompt || '');
      formData.append('cfg', options.cfg || '0.5');
      formData.append('aspect_ratio', options.aspect_ratio || '1:1');
      
      // 添加其他可能的参数
      if (options.additionalParams) {
        Object.entries(options.additionalParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value);
          }
        });
      }

      // 打印完整请求信息
      console.log('1.6 版本高清 10s 文生视频请求头:', {
        'Content-Type': formData.getHeaders()['content-type']
      });

      const response = await axios.post(
        `${KLING_BASE_URL}${KLING_ENDPOINTS.TEXT_TO_VIDEO_16_HQ_10S}`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${process.env.KLING_API_KEY}`
          }
        }
      );

      return response.data;
    } catch (error) {
      // 打印详细错误信息
      console.error('Kling 1.6 版本高清 10s 文生视频 API 错误详情:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      
      throw new Error(`1.6 版本高清 10s 文生视频失败: ${error.message}`);
    }
  }

  /**
   * 从图片生成 1.6 版本 5s 视频
   * 注意：1.6 版本可能不需要 tail_image 参数，但有 image_list 参数
   */
  static async generateVideoFromImage16_5s(inputImage, options = {}) {
    try {
      // 打印请求参数
      console.log('1.6 版本 5s 图生视频请求参数:', {
        ...options,
        inputImageSize: inputImage.length,
        endpoint: KLING_ENDPOINTS.IMAGE_TO_VIDEO_16_5S
      });

      // 构建请求数据
      const formData = new FormData();
      formData.append('input_image', inputImage);
      
      // 添加其他参数
      formData.append('prompt', options.prompt || '');
      formData.append('negative_prompt', options.negative_prompt || '');
      formData.append('cfg', options.cfg || '0.5');
      formData.append('aspect_ratio', options.aspect_ratio || '1:1');
      
      // 添加 image_list 参数（如果有）
      if (options.image_list) {
        formData.append('image_list', options.image_list);
      }
      
      // 添加其他可能的参数
      if (options.additionalParams) {
        Object.entries(options.additionalParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value);
          }
        });
      }

      // 打印完整请求信息
      console.log('1.6 版本 5s 图生视频请求头:', {
        'Content-Type': formData.getHeaders()['content-type']
      });

      const response = await axios.post(
        `${KLING_BASE_URL}${KLING_ENDPOINTS.IMAGE_TO_VIDEO_16_5S}`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${process.env.KLING_API_KEY}`
          }
        }
      );

      return response.data;
    } catch (error) {
      // 打印详细错误信息
      console.error('Kling 1.6 版本 5s 图生视频 API 错误详情:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      
      throw new Error(`1.6 版本 5s 图生视频失败: ${error.message}`);
    }
  }

  /**
   * 从图片生成 1.6 版本 10s 视频
   * 注意：1.6 版本可能不需要 tail_image 参数，但有 image_list 参数
   */
  static async generateVideoFromImage16_10s(inputImage, options = {}) {
    try {
      // 打印请求参数
      console.log('1.6 版本 10s 图生视频请求参数:', {
        ...options,
        inputImageSize: inputImage.length,
        endpoint: KLING_ENDPOINTS.IMAGE_TO_VIDEO_16_10S
      });

      // 构建请求数据
      const formData = new FormData();
      formData.append('input_image', inputImage);
      
      // 添加其他参数
      formData.append('prompt', options.prompt || '');
      formData.append('negative_prompt', options.negative_prompt || '');
      formData.append('cfg', options.cfg || '0.5');
      formData.append('aspect_ratio', options.aspect_ratio || '1:1');
      
      // 添加 image_list 参数（如果有）
      if (options.image_list) {
        formData.append('image_list', options.image_list);
      }
      
      // 添加其他可能的参数
      if (options.additionalParams) {
        Object.entries(options.additionalParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value);
          }
        });
      }

      // 打印完整请求信息
      console.log('1.6 版本 10s 图生视频请求头:', {
        'Content-Type': formData.getHeaders()['content-type']
      });

      const response = await axios.post(
        `${KLING_BASE_URL}${KLING_ENDPOINTS.IMAGE_TO_VIDEO_16_10S}`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${process.env.KLING_API_KEY}`
          }
        }
      );

      return response.data;
    } catch (error) {
      // 打印详细错误信息
      console.error('Kling 1.6 版本 10s 图生视频 API 错误详情:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      
      throw new Error(`1.6 版本 10s 图生视频失败: ${error.message}`);
    }
  }

  /**
   * 从多张图片生成 1.6 版本 5s 视频
   * 支持最多 4 张图片的 URL 列表
   */
  static async generateVideoFromMultiImages16_5s(options = {}) {
    try {
      // 打印请求参数
      console.log('1.6 版本多图参考请求参数:', {
        ...options,
        endpoint: KLING_ENDPOINTS.IMAGE_TO_VIDEO_16_5S
      });

      if (!options.image_list || !Array.isArray(options.image_list) || options.image_list.length === 0) {
        throw new Error('需要提供图片列表');
      }

      if (options.image_list.length > 4) {
        throw new Error('图片列表最多只能包含4张图片');
      }

      // 构建请求数据
      const requestData = {
        prompt: options.prompt || '',
        negative_prompt: options.negative_prompt || '',
        cfg: options.cfg || '0.5',
        aspect_ratio: options.aspect_ratio || '1:1',
        image_list: options.image_list
      };

      // 打印完整请求信息
      console.log('1.6 版本多图参考请求数据:', requestData);

      const response = await axios.post(
        `${KLING_BASE_URL}${KLING_ENDPOINTS.IMAGE_TO_VIDEO_16_5S}`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.KLING_API_KEY}`
          }
        }
      );

      return response.data;
    } catch (error) {
      // 打印详细错误信息
      console.error('Kling 1.6 版本多图参考 API 错误详情:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      
      throw new Error(`1.6 版本多图参考失败: ${error.message}`);
    }
  }

  /**
   * 扩展视频
   * @param {string} taskId - 原始视频的任务ID
   * @param {string} prompt - 提示词
   * @param {Object} options - 其他选项
   */
  static async extendVideo(taskId, prompt, options = {}) {
    try {
      // 打印请求参数
      console.log('视频扩展请求参数:', {
        taskId,
        prompt,
        ...options,
        endpoint: KLING_ENDPOINTS.EXTEND_VIDEO
      });

      if (!taskId) {
        throw new Error('需要提供原始视频的任务ID');
      }

      if (!prompt) {
        throw new Error('需要提供提示词');
      }

      // 构建请求数据
      const formData = new FormData();
      formData.append('task_id', taskId);
      formData.append('prompt', prompt);
      
      // 添加其他可能的参数
      if (options.negative_prompt) {
        formData.append('negative_prompt', options.negative_prompt);
      }
      
      if (options.additionalParams) {
        Object.entries(options.additionalParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value);
          }
        });
      }

      // 打印完整请求信息
      console.log('视频扩展请求头:', {
        'Content-Type': formData.getHeaders()['content-type']
      });

      const response = await axios.post(
        `${KLING_BASE_URL}${KLING_ENDPOINTS.EXTEND_VIDEO}`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${process.env.KLING_API_KEY}`
          }
        }
      );

      return response.data;
    } catch (error) {
      // 打印详细错误信息
      console.error('Kling 视频扩展 API 错误详情:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      
      throw new Error(`视频扩展失败: ${error.message}`);
    }
  }

  /**
   * 生成 1.6 版本高清 5s 图到视频
   */
  static async generateVideoFromImage16_HQ_5s(inputImage, options = {}) {
    try {
      // 打印请求参数
      console.log('1.6 版本高清 5s 图生视频请求参数:', {
        ...options,
        inputImageSize: inputImage.length,
        endpoint: KLING_ENDPOINTS.IMAGE_TO_VIDEO_16_HQ_5S
      });

      // 构建请求数据
      const formData = new FormData();
      formData.append('input_image', inputImage);
      
      // 添加其他参数
      formData.append('prompt', options.prompt || '');
      formData.append('negative_prompt', options.negative_prompt || '');
      formData.append('cfg', options.cfg || '0.5');
      formData.append('aspect_ratio', options.aspect_ratio || '1:1');
      
      // 添加 image_list 参数（如果有）
      if (options.image_list) {
        formData.append('image_list', options.image_list);
      }
      
      // 添加其他可能的参数
      if (options.additionalParams) {
        Object.entries(options.additionalParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value);
          }
        });
      }

      // 打印完整请求信息
      console.log('1.6 版本高清 5s 图生视频请求头:', {
        'Content-Type': formData.getHeaders()['content-type']
      });

      const response = await axios.post(
        `${KLING_BASE_URL}${KLING_ENDPOINTS.IMAGE_TO_VIDEO_16_HQ_5S}`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${process.env.KLING_API_KEY}`
          }
        }
      );

      return response.data;
    } catch (error) {
      // 打印详细错误信息
      console.error('Kling 1.6 版本高清 5s 图生视频 API 错误详情:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      
      throw new Error(`1.6 版本高清 5s 图生视频失败: ${error.message}`);
    }
  }

  /**
   * 生成 1.6 版本高清 10s 图到视频
   */
  static async generateVideoFromImage16_HQ_10s(inputImage, options = {}) {
    try {
      // 打印请求参数
      console.log('1.6 版本高清 10s 图生视频请求参数:', {
        ...options,
        inputImageSize: inputImage.length,
        endpoint: KLING_ENDPOINTS.IMAGE_TO_VIDEO_16_HQ_10S
      });

      // 构建请求数据
      const formData = new FormData();
      formData.append('input_image', inputImage);
      
      // 添加其他参数
      formData.append('prompt', options.prompt || '');
      formData.append('negative_prompt', options.negative_prompt || '');
      formData.append('cfg', options.cfg || '0.5');
      formData.append('aspect_ratio', options.aspect_ratio || '1:1');
      
      // 添加 image_list 参数（如果有）
      if (options.image_list) {
        formData.append('image_list', options.image_list);
      }
      
      // 添加其他可能的参数
      if (options.additionalParams) {
        Object.entries(options.additionalParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value);
          }
        });
      }

      // 打印完整请求信息
      console.log('1.6 版本高清 10s 图生视频请求头:', {
        'Content-Type': formData.getHeaders()['content-type']
      });

      const response = await axios.post(
        `${KLING_BASE_URL}${KLING_ENDPOINTS.IMAGE_TO_VIDEO_16_HQ_10S}`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${process.env.KLING_API_KEY}`
          }
        }
      );

      return response.data;
    } catch (error) {
      // 打印详细错误信息
      console.error('Kling 1.6 版本高清 10s 图生视频 API 错误详情:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      
      throw new Error(`1.6 版本高清 10s 图生视频失败: ${error.message}`);
    }
  }
}

// 导出 API 端点常量，以便在路由中使用
KlingService.ENDPOINTS = KLING_ENDPOINTS;

module.exports = KlingService;