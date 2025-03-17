const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

// 302 API 基础 URL
const THREE_TWO_BASE_URL = 'https://api.302.ai';
const THREE_TWO_TASK_URL = 'https://api.302.ai/klingai/task';

// Runway API 密钥（如果设置了专用密钥则使用，否则使用通用密钥）
const RUNWAY_API_KEY = process.env.RUNWAY_API_KEY || process.env.THREE_TWO_API_KEY;

// 定义不同的 API 端点
const THREE_TWO_ENDPOINTS = {
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
  EXTEND_VIDEO: '/klingai/m2v_extend_video',
  // Runway 相关端点
  RUNWAY_SUBMIT: '/runway/submit',
  RUNWAY_FETCH: '/runway/task'
};

// 创建一个预配置的axios实例，专门用于Runway API请求
const runwayAxios = axios.create({
  baseURL: THREE_TWO_BASE_URL,
  headers: {
    'Authorization': `Bearer ${RUNWAY_API_KEY}`
  }
});

class ThreeTwoService {
  /**
   * 生成视频的通用方法
   * @param {string} prompt - 提示词
   * @param {Object} options - 选项
   * @param {string} endpoint - API 端点类型
   */
  static async generateVideo(prompt, options = {}, endpoint = THREE_TWO_ENDPOINTS.STANDARD) {
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
      url: `${THREE_TWO_BASE_URL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${process.env.THREE_TWO_API_KEY}`,
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
      console.error('302 API 错误:', error);
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
  static async generateVideoFromImage(inputImage, tailImage = null, options = {}, endpoint = THREE_TWO_ENDPOINTS.IMAGE_TO_VIDEO_5S) {
    try {
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

      console.log(`正在调用 302 API: ${THREE_TWO_BASE_URL}${endpoint}`);
      
      try {
        const response = await axios.post(
          `${THREE_TWO_BASE_URL}${endpoint}`,
          formData,
          {
            headers: {
              ...formData.getHeaders(),
              'Authorization': `Bearer ${process.env.THREE_TWO_API_KEY}`
            }
          }
        );

        return response.data;
      } catch (axiosError) {
        console.error('302 API 请求失败:', axiosError.message);
        if (axiosError.response) {
          console.error('响应状态:', axiosError.response.status);
          console.error('响应数据:', axiosError.response.data);
        } else if (axiosError.request) {
          console.error('请求已发送但未收到响应');
        }
        throw axiosError;
      }
    } catch (error) {
      console.error('302 API 错误:', error);
      throw new Error('图片生成视频失败: ' + error.message);
    }
  }

  /**
   * 检查任务状态
   */
  static async checkTaskStatus(taskId) {
    const config = {
      method: 'get',
      url: `${THREE_TWO_TASK_URL}/${taskId}`,
      headers: {
        'Authorization': `Bearer ${process.env.THREE_TWO_API_KEY}`
      }
    };

    try {
      const response = await axios(config);
      
      if (response.data.result !== 1) {
        throw new Error(response.data.message || '获取任务状态失败');
      }

      return response.data;
    } catch (error) {
      console.error('302 API 错误:', error);
      throw new Error('获取任务状态失败: ' + (error.response?.data?.message || error.message));
    }
  }

  /**
   * 获取任务结果
   */
  static async getTaskResult(taskId) {
    const config = {
      method: 'get',
      url: `${THREE_TWO_TASK_URL}/${taskId}/fetch`,
      headers: {
        'Authorization': `Bearer ${process.env.THREE_TWO_API_KEY}`
      }
    };

    try {
      const response = await axios(config);
      
      if (response.data.result !== 1) {
        throw new Error(response.data.message || '获取任务结果失败');
      }

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
      console.error('302 API 错误:', error);
      throw new Error('获取任务结果失败: ' + (error.response?.data?.message || error.message));
    }
  }

  /**
   * 通用Runway API请求函数
   * @param {string} method - 请求方法 ('get', 'post', 等)
   * @param {string} url - 请求URL (不包含基础URL)
   * @param {Object} data - 请求数据 (用于POST, PUT等)
   * @param {Object} headers - 额外的请求头
   * @returns {Promise<Object>} API响应
   */
  static async runwayApiRequest(method, url, data = null, headers = {}) {
    try {
      const config = {
        method,
        url,
        headers: {
          ...headers
        }
      };
      
      if (data) {
        config.data = data;
      }
      
      const response = await runwayAxios(config);
      return response.data;
    } catch (error) {
      console.error('Runway API 错误:', error);
      if (error.response && error.response.status === 401) {
        console.error('授权失败，请检查 API 密钥是否正确');
      }
      throw new Error(`Runway API 请求失败: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * 获取 Runway 任务结果
   * @param {string} taskId - 任务ID
   */
  static async getRunwayTaskResult(taskId) {
    return this.runwayApiRequest(
      'get', 
      `${THREE_TWO_ENDPOINTS.RUNWAY_FETCH}/${taskId}/fetch`
    );
  }

  /**
   * Runway 图生视频提交
   * @param {Buffer|Stream|Object} initImage - 输入图片 (必须是 1280px * 768px 或 768px * 1280px)
   * @param {Object} options - 选项
   * @param {string} [options.text_prompt] - 视频提示词，不支持中文
   * @param {number} [options.seconds] - 可选择 5 或 10 秒
   * @param {string} [options.seed] - 用来保持一致性的种子
   * @param {boolean} [options.image_as_end_frame] - 图片是否为尾帧
   * @returns {Promise<Object>} 返回任务信息
   */
  static async runwaySubmit(initImage, options = {}) {
    try {
      const formData = new FormData();
      
      // 详细记录输入图片对象的类型和属性，帮助调试
      console.log('输入图片类型:', typeof initImage);
      console.log('是否为 Buffer:', Buffer.isBuffer(initImage));
      console.log('图片对象属性:', Object.keys(initImage));
      
      // 处理图片文件 - 增强版
      let imageBuffer;
      let filename = 'image.jpg';
      let contentType = 'image/jpeg';
      
      // 确定图片数据和元数据
      if (Buffer.isBuffer(initImage)) {
        // 如果直接是 Buffer
        imageBuffer = initImage;
      } else if (initImage.buffer && Buffer.isBuffer(initImage.buffer)) {
        // multer 文件对象
        imageBuffer = initImage.buffer;
        filename = initImage.originalname || filename;
        contentType = initImage.mimetype || contentType;
      } else if (initImage.data && Buffer.isBuffer(initImage.data)) {
        // express-fileupload 文件对象
        imageBuffer = initImage.data;
        filename = initImage.name || filename;
        contentType = initImage.mimetype || contentType;
      } else if (typeof initImage.path === 'string') {
        // 文件路径
        try {
          const fs = require('fs');
          imageBuffer = fs.readFileSync(initImage.path);
        } catch (readError) {
          console.error('读取文件失败:', readError);
          throw new Error('无法读取图片文件');
        }
      } else if (initImage.pipe && typeof initImage.pipe === 'function') {
        // 流对象
        throw new Error('不支持直接使用流对象，请先将流转换为 Buffer');
      } else {
        console.error('不支持的图片格式:', initImage);
        throw new Error('不支持的图片格式，请提供有效的图片文件');
      }
      
      // 确保我们有有效的 Buffer
      if (!imageBuffer || !Buffer.isBuffer(imageBuffer)) {
        throw new Error('无法获取有效的图片数据');
      }
      
      // 添加图片到表单
      try {
        formData.append('init_image', imageBuffer, {
          filename,
          contentType
        });
      } catch (appendError) {
        console.error('添加图片到表单失败:', appendError);
        throw new Error('添加图片到表单失败: ' + appendError.message);
      }
      
      // 添加可选参数
      if (options.text_prompt) {
        formData.append('text_prompt', String(options.text_prompt));
      }
      
      if (options.seconds && [5, 10].includes(Number(options.seconds))) {
        formData.append('seconds', String(options.seconds));
      }
      
      if (options.seed) {
        formData.append('seed', String(options.seed));
      }
      
      if (options.image_as_end_frame !== undefined) {
        formData.append('image_as_end_frame', String(options.image_as_end_frame));
      }

      console.log('正在调用 Runway API:', {
        endpoint: `${THREE_TWO_BASE_URL}${THREE_TWO_ENDPOINTS.RUNWAY_SUBMIT}`,
        imageBufferSize: imageBuffer.length,
        filename,
        contentType,
        options: {
          text_prompt: options.text_prompt,
          seconds: options.seconds,
          seed: options.seed,
          image_as_end_frame: options.image_as_end_frame
        }
      });
      
      // 使用通用API请求函数发送请求
      return this.runwayApiRequest(
        'post',
        THREE_TWO_ENDPOINTS.RUNWAY_SUBMIT,
        formData,
        formData.getHeaders()
      );
    } catch (error) {
      console.error('Runway API 错误:', error);
      throw new Error('Runway 图生视频提交失败: ' + error.message);
    }
  }
}

// 导出常量和服务类
ThreeTwoService.ENDPOINTS = THREE_TWO_ENDPOINTS;
ThreeTwoService.BASE_URL = THREE_TWO_BASE_URL;
ThreeTwoService.runwayAxios = runwayAxios; // 导出预配置的axios实例

module.exports = ThreeTwoService; 