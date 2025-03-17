const express = require('express');
const router = express.Router();
const ThreeTwoService = require('../services/threeTwoService');
const sharp = require('sharp');
const axios = require('axios');

/**
 * 文本生成视频
 */
router.post('/text2video', async (req, res) => {
  try {
    const {
      prompt,
      aspect_ratio,
      camera_type,
      camera_value,
      cfg,
      negative_prompt,
      additionalParams
    } = req.body;

    // 验证必需参数
    if (!prompt) {
      return res.status(400).json({ error: '缺少必需的 prompt 参数' });
    }

    // 构建选项对象
    const options = {
      aspect_ratio,
      camera_type,
      camera_value,
      cfg,
      negative_prompt,
      additionalParams
    };

    // 过滤掉未定义的选项
    Object.keys(options).forEach(key => 
      options[key] === undefined && delete options[key]
    );

    const result = await ThreeTwoService.generateVideo(prompt, options);
    res.json(result);
  } catch (error) {
    console.error('文生视频错误:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 统一文生视频接口
 * 根据参数自动选择合适的 API 端点
 */
router.post('/unified/text2video', async (req, res) => {
  try {
    const {
      prompt,
      negative_prompt = '',
      cfg = '0.5',
      aspect_ratio = '1:1',
      model = 'kling',
      quality = 'normal',
      video_length = '5s',
    } = req.body;

    // 验证必需参数
    if (!prompt) {
      return res.status(400).json({ error: '缺少必需的 prompt 参数' });
    }

    console.log('统一文生视频请求参数:', {
      prompt,
      negative_prompt,
      cfg,
      aspect_ratio,
      model,
      quality,
      video_length
    });

    // 验证模型参数
    if (model !== 'kling') {
      return res.status(400).json({ error: `不支持的模型: ${model}，当前仅支持 kling 模型` });
    }

    // 根据参数选择合适的 API 端点
    let endpoint = ThreeTwoService.ENDPOINTS.STANDARD; // 默认端点

    // 处理宽高比
    const isWidescreen = aspect_ratio === '16:9' || aspect_ratio === '9:16';
    
    // 处理质量和视频长度
    const isHighQuality = quality === 'high' || quality === 'hq';
    const isLongVideo = video_length === '10s';

    // 根据模型和其他参数选择合适的端点
    if (model === 'kling') {
      if (isWidescreen) {
        // 16:9 或 9:16 宽高比
        if (isHighQuality) {
          endpoint = isLongVideo 
            ? ThreeTwoService.ENDPOINTS.TEXT_TO_VIDEO_16_HQ_10S 
            : ThreeTwoService.ENDPOINTS.TEXT_TO_VIDEO_16_HQ_5S;
        } else {
          endpoint = isLongVideo 
            ? ThreeTwoService.ENDPOINTS.TEXT_TO_VIDEO_16_10S 
            : ThreeTwoService.ENDPOINTS.TEXT_TO_VIDEO_16_5S;
        }
      } else {
        // 1:1 宽高比
        if (isHighQuality) {
          endpoint = isLongVideo 
            ? ThreeTwoService.ENDPOINTS.HIGH_QUALITY_10S 
            : ThreeTwoService.ENDPOINTS.HIGH_QUALITY_5S;
        } else {
          endpoint = ThreeTwoService.ENDPOINTS.STANDARD;
        }
      }
    }
    // 这里可以添加其他模型的处理逻辑
    // else if (model === 'other_model') {
    //   // 其他模型的端点选择逻辑
    // }

    console.log('选择的 API 端点:', endpoint);

    // 构建选项对象
    const options = {
      negative_prompt,
      cfg,
      aspect_ratio
    };

    // 调用服务生成视频
    const result = await ThreeTwoService.generateVideo(prompt, options, endpoint);
    res.json(result);
  } catch (error) {
    console.error('统一文生视频错误:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 图片生成视频
 */
router.post('/image2video', async (req, res) => {
  try {
    if (!req.files || !req.files.input_image) {
      return res.status(400).json({ error: '缺少输入图片' });
    }

    const inputImage = req.files.input_image;
    const tailImage = req.files.tail_image || null;
    const {
      prompt,
      aspect_ratio,
      camera_type,
      camera_value,
      cfg,
      negative_prompt,
      additionalParams
    } = req.body;

    const options = {
      prompt,
      aspect_ratio,
      camera_type,
      camera_value,
      cfg,
      negative_prompt,
      additionalParams
    };

    // 过滤掉未定义的选项
    Object.keys(options).forEach(key => 
      options[key] === undefined && delete options[key]
    );

    const result = await ThreeTwoService.generateVideoFromImage(
      inputImage.data,
      tailImage ? tailImage.data : null,
      options
    );
    res.json(result);
  } catch (error) {
    console.error('图生视频错误:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 获取任务状态
 */
router.get('/tasks/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const result = await ThreeTwoService.checkTaskStatus(taskId);
    res.json(result);
  } catch (error) {
    console.error('获取任务状态错误:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 获取任务结果
 */
router.get('/tasks/:taskId/result', async (req, res) => {
  try {
    const { taskId } = req.params;
    const result = await ThreeTwoService.getTaskResult(taskId);
    res.json(result);
  } catch (error) {
    console.error('获取任务结果错误:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 高质量图像生成视频（16:9/9:16，10秒）
 */
router.post('/m2v_16_img2video_hq_10s', async (req, res) => {
  try {
    if (!req.files || !req.files.input_image) {
      return res.status(400).json({ error: '缺少输入图片' });
    }

    const inputImage = req.files.input_image;
    const {
      prompt,
      aspect_ratio,
      cfg,
      negative_prompt
    } = req.body;

    console.log('请求参数:', {
      imageSize: inputImage.size,
      imageMimetype: inputImage.mimetype,
      prompt,
      aspect_ratio,
      cfg,
      negative_prompt
    });

    // 验证图片格式和大小
    const validFormats = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validFormats.includes(inputImage.mimetype)) {
      return res.status(400).json({ error: '图片格式必须是 JPG 或 PNG' });
    }

    if (inputImage.size > 10 * 1024 * 1024) { // 10MB
      return res.status(400).json({ error: '图片大小不能超过 10MB' });
    }

    // 验证图片尺寸（需要先解析图片）
    // 这里可以添加图片尺寸验证代码，确保不小于 300px

    const options = {
      prompt: prompt || '',
      aspect_ratio: aspect_ratio || '16:9', // 默认使用 16:9
      cfg: cfg || '0.5',
      negative_prompt: negative_prompt || ''
    };

    console.log('使用端点:', ThreeTwoService.ENDPOINTS.IMAGE_TO_VIDEO_16_HQ_10S);
    console.log('发送选项:', options);

    try {
      const result = await ThreeTwoService.generateVideoFromImage(
        inputImage.data,
        null,
        options,
        ThreeTwoService.ENDPOINTS.IMAGE_TO_VIDEO_16_HQ_10S
      );
      
      res.json(result);
    } catch (error) {
      console.error('API 调用详细错误:', error);
      if (error.response) {
        console.error('错误响应数据:', error.response.data);
        console.error('错误响应状态:', error.response.status);
        console.error('错误响应头:', error.response.headers);
      }
      throw error; // 重新抛出以便被外层 catch 捕获
    }
  } catch (error) {
    console.error('高质量图生视频错误:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Runway 图生视频提交
 */
router.post('/runway/submit', async (req, res) => {
  try {
    if (!req.files || !req.files.init_image) {
      return res.status(400).json({ error: '缺少输入图片' });
    }

    const initImage = req.files.init_image;
    const {
      text_prompt,
      seconds,
      seed,
      image_as_end_frame
    } = req.body;

    console.log('Runway 请求参数:', {
      imageSize: initImage.size,
      imageMimetype: initImage.mimetype,
      text_prompt,
      seconds,
      seed,
      image_as_end_frame
    });

    // 验证图片格式和大小
    const validFormats = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validFormats.includes(initImage.mimetype)) {
      return res.status(400).json({ error: '图片格式必须是 JPG 或 PNG' });
    }

    // 验证图片尺寸（需要为 1280px * 768px）
    try {
      const metadata = await sharp(initImage.data).metadata();
      console.log('图片尺寸:', metadata.width, 'x', metadata.height);
      
      if (metadata.width !== 1280 || metadata.height !== 768) {
        return res.status(400).json({ 
          error: `图片尺寸必须为 1280px * 768px，当前尺寸为 ${metadata.width}px * ${metadata.height}px` 
        });
      }
    } catch (sharpError) {
      console.error('图片处理错误:', sharpError);
      return res.status(400).json({ error: '无法验证图片尺寸，请确保图片格式正确' });
    }

    // 验证 seconds 参数
    if (seconds && ![5, 10].includes(parseInt(seconds))) {
      return res.status(400).json({ error: 'seconds 参数必须为 5 或 10' });
    }

    // 验证 image_as_end_frame 参数
    let parsedImageAsEndFrame;
    if (image_as_end_frame !== undefined) {
      if (image_as_end_frame === 'true' || image_as_end_frame === true) {
        parsedImageAsEndFrame = true;
      } else if (image_as_end_frame === 'false' || image_as_end_frame === false) {
        parsedImageAsEndFrame = false;
      } else {
        return res.status(400).json({ error: 'image_as_end_frame 参数必须为 true 或 false' });
      }
    }

    const options = {
      text_prompt: text_prompt || '',
      seconds: seconds ? parseInt(seconds) : 10,
      seed: seed || '',
      image_as_end_frame: parsedImageAsEndFrame
    };

    try {
      const result = await ThreeTwoService.runwaySubmit(
        initImage.data,
        options
      );
      
      res.json(result);
    } catch (error) {
      console.error('Runway API 调用详细错误:', error);
      if (error.response) {
        console.error('错误响应数据:', error.response.data);
        console.error('错误响应状态:', error.response.status);
        console.error('错误响应头:', error.response.headers);
      }
      throw error;
    }
  } catch (error) {
    console.error('Runway 图生视频错误:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 获取 Runway 任务结果
 */
router.get('/runway/task/:id/fetch', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 使用代理路由转发请求
    const options = {
      method: 'get',
      url: `${ThreeTwoService.BASE_URL}/runway/task/${id}/fetch`,
      headers: {
        'Authorization': `Bearer ${process.env.RUNWAY_API_KEY || process.env.THREE_TWO_API_KEY}`
      }
    };
    
    const response = await axios(options);
    res.json(response.data);
  } catch (error) {
    console.error('获取 Runway 任务结果错误:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Runway 图生视频提交 (JSON 格式)
 */
router.post('/runway/submit/json', async (req, res) => {
  try {
    const {
      init_image,
      text_prompt,
      seconds,
      seed,
      image_as_end_frame
    } = req.body;

    // 验证必需参数
    if (!init_image) {
      return res.status(400).json({ error: '缺少必需的 init_image 参数' });
    }

    console.log('Runway JSON 请求参数:', {
      text_prompt,
      seconds,
      seed,
      image_as_end_frame,
      hasInitImage: !!init_image
    });

    // 验证 seconds 参数
    if (seconds && ![5, 10].includes(parseInt(seconds))) {
      return res.status(400).json({ error: 'seconds 参数必须为 5 或 10' });
    }

    // 验证 image_as_end_frame 参数
    if (image_as_end_frame !== undefined && typeof image_as_end_frame !== 'boolean') {
      return res.status(400).json({ error: 'image_as_end_frame 参数必须为布尔值' });
    }

    // 解码 base64 图片数据
    let imageBuffer;
    try {
      // 检查是否是 base64 字符串
      if (typeof init_image === 'string') {
        // 移除可能的 base64 前缀
        const base64Data = init_image.replace(/^data:image\/\w+;base64,/, '');
        imageBuffer = Buffer.from(base64Data, 'base64');
      } else {
        return res.status(400).json({ error: 'init_image 必须是 base64 编码的字符串' });
      }
    } catch (error) {
      console.error('Base64 解码错误:', error);
      return res.status(400).json({ error: '无法解码图片数据' });
    }

    // 验证图片尺寸（需要为 1280px * 768px）
    try {
      const metadata = await sharp(imageBuffer).metadata();
      console.log('图片尺寸:', metadata.width, 'x', metadata.height);
      
      if (metadata.width !== 1280 || metadata.height !== 768) {
        return res.status(400).json({ 
          error: `图片尺寸必须为 1280px * 768px，当前尺寸为 ${metadata.width}px * ${metadata.height}px` 
        });
      }
    } catch (sharpError) {
      console.error('图片处理错误:', sharpError);
      return res.status(400).json({ error: '无法验证图片尺寸，请确保图片格式正确' });
    }
    
    const options = {
      text_prompt: text_prompt || '',
      seconds: seconds ? parseInt(seconds) : 10,
      seed: seed || '',
      image_as_end_frame: image_as_end_frame
    };

    try {
      // 直接传递请求数据到服务
      const result = await ThreeTwoService.runwayAxios.post(
        ThreeTwoService.ENDPOINTS.RUNWAY_SUBMIT,
        req.body,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      res.json(result.data);
    } catch (error) {
      console.error('Runway API 调用详细错误:', error);
      if (error.response) {
        console.error('错误响应数据:', error.response.data);
        console.error('错误响应状态:', error.response.status);
        console.error('错误响应头:', error.response.headers);
      }
      throw error;
    }
  } catch (error) {
    console.error('Runway JSON 图生视频错误:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 直接代理 Runway API 请求
 * 路径格式: /api/302/runway-proxy/*
 */
router.all('/runway-proxy/*', async (req, res) => {
  try {
    // 获取原始路径（去掉'/runway-proxy/'前缀）
    const path = req.params[0];
    
    // 记录请求信息
    console.log(`代理Runway API请求: ${req.method} ${path}`);
    
    // 准备请求选项
    const options = {
      method: req.method.toLowerCase(),
      url: `${ThreeTwoService.BASE_URL}/${path}`,
      headers: {
        'Authorization': `Bearer ${process.env.RUNWAY_API_KEY || process.env.THREE_TWO_API_KEY}`
      }
    };
    
    // 添加请求体（如果有）
    if (['post', 'put', 'patch'].includes(options.method)) {
      options.data = req.body;
    }
    
    // 添加内容类型头（如果有）
    if (req.headers['content-type']) {
      options.headers['Content-Type'] = req.headers['content-type'];
    }
    
    // 发送请求到Runway API
    const response = await axios(options);
    
    // 返回响应
    res.json(response.data);
  } catch (error) {
    console.error('Runway API代理错误:', error);
    
    // 返回错误响应
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || error.message;
    
    res.status(statusCode).json({
      error: errorMessage,
      details: error.response?.data || {}
    });
  }
});

module.exports = router; 