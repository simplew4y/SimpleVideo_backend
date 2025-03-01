// routes/videoRoutes.js
const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const authMiddleware = require('../middleware/authMiddleware');
const KlingService = require('../services/klingService');

router.post('/', authMiddleware, videoController.createVideo);
router.get('/', authMiddleware, videoController.getVideos);

// Kling 标准视频生成路由
router.post('/generate/kling/m2v_txt2video', async (req, res) => {
  try {
    const { prompt, camera_type, camera_value, cfg, aspect_ratio, negative_prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: '需要提供提示词' });
    }

    const result = await KlingService.generateStandardVideo(prompt, {
      camera_type,
      camera_value,
      cfg: cfg || '0.5',
      aspect_ratio: aspect_ratio || '1:1',
      negative_prompt
    });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('视频生成错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Kling 高质量 5 秒视频生成路由
router.post('/generate/kling/m2v_txt2video_hq_5s', async (req, res) => {
  try {
    const { prompt, camera_type, camera_value, cfg, aspect_ratio, negative_prompt, additionalParams } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: '需要提供提示词' });
    }

    const result = await KlingService.generateHighQuality5sVideo(prompt, {
      camera_type,
      camera_value,
      cfg: cfg || '0.5',
      aspect_ratio: aspect_ratio || '1:1',
      negative_prompt,
      additionalParams
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('高质量视频生成错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Kling 高质量 10 秒视频生成路由
router.post('/generate/kling/m2v_txt2video_hq_10s', async (req, res) => {
  try {
    const { prompt, camera_type, camera_value, cfg, aspect_ratio, negative_prompt, additionalParams } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: '需要提供提示词' });
    }

    const result = await KlingService.generateHighQuality10sVideo(prompt, {
      camera_type,
      camera_value,
      cfg: cfg || '0.5',
      aspect_ratio: aspect_ratio || '1:1',
      negative_prompt,
      additionalParams
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('高质量 10 秒视频生成错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 保留原有的 /generate 路由作为兼容性支持
router.post('/generate', async (req, res) => {
  try {
    const { prompt, camera_type, camera_value, cfg, aspect_ratio, negative_prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: '需要提供提示词' });
    }

    const result = await KlingService.generateStandardVideo(prompt, {
      camera_type,
      camera_value,
      cfg: cfg || '0.5',
      aspect_ratio: aspect_ratio || '1:1',
      negative_prompt
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('视频生成错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 检查任务状态路由
router.get('/status/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const result = await KlingService.getTaskResult(taskId);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('任务状态检查错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 添加任务状态检查路由（不获取结果）
router.get('/check-status/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const result = await KlingService.checkTaskStatus(taskId);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('任务状态检查错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Kling 图生视频 10s 路由
router.post('/generate/kling/m2v_img2video_10s', async (req, res) => {
  try {
    console.log('收到 10s 图生视频请求 - Files:', req.files);
    console.log('收到 10s 图生视频请求 - Body:', req.body);

    if (!req.files || !req.files.input_image) {
      return res.status(400).json({ error: '需要提供输入图片' });
    }

    // 获取上传的文件
    const inputImage = req.files.input_image;
    const tailImage = req.files.tail_image;

    // 准备选项对象
    const options = {
      prompt: req.body.prompt || '',
      negative_prompt: req.body.negative_prompt || '',
      cfg: req.body.cfg || '0.5',
      aspect_ratio: req.body.aspect_ratio || '1:1',
      camera_type: req.body.camera_type,
      camera_value: req.body.camera_value
    };

    // 调用服务
    const result = await KlingService.generateVideoFromImage10s(
      inputImage.data,  // 传递文件的 Buffer
      tailImage ? tailImage.data : null,  // 如果有尾部图片，传递其 Buffer
      options
    );

    res.json(result);
  } catch (error) {
    console.error('10s 图生视频错误:', error);
    res.status(500).json({
      error: error.message,
      details: error.response?.data || null
    });
  }
});

// 修改现有的图生视频路由，使用新的方法名
router.post('/generate/kling/m2v_img2video', async (req, res) => {
  try {
    console.log('收到 5s 图生视频请求 - Files:', req.files);
    console.log('收到 5s 图生视频请求 - Body:', req.body);

    if (!req.files || !req.files.input_image) {
      return res.status(400).json({ error: '需要提供输入图片' });
    }

    // 获取上传的文件
    const inputImage = req.files.input_image;
    const tailImage = req.files.tail_image;

    // 准备选项对象
    const options = {
      prompt: req.body.prompt || '',
      negative_prompt: req.body.negative_prompt || '',
      cfg: req.body.cfg || '0.5',
      aspect_ratio: req.body.aspect_ratio || '1:1',
      camera_type: req.body.camera_type,
      camera_value: req.body.camera_value
    };

    // 调用服务
    const result = await KlingService.generateVideoFromImage5s(
      inputImage.data,  // 传递文件的 Buffer
      tailImage ? tailImage.data : null,  // 如果有尾部图片，传递其 Buffer
      options
    );

    res.json(result);
  } catch (error) {
    console.error('5s 图生视频错误:', error);
    res.status(500).json({
      error: error.message,
      details: error.response?.data || null
    });
  }
});

// Kling 1.5 版本图生视频路由
router.post('/generate/kling/m2v_15_img2video', async (req, res) => {
  try {
    console.log('收到 1.5 版本图生视频请求 - Files:', req.files);
    console.log('收到 1.5 版本图生视频请求 - Body:', req.body);

    if (!req.files || !req.files.input_image) {
      return res.status(400).json({ error: '需要提供输入图片' });
    }

    // 获取上传的文件
    const inputImage = req.files.input_image;

    // 准备选项对象
    const options = {
      prompt: req.body.prompt || '',
      negative_prompt: req.body.negative_prompt || '',
      cfg: req.body.cfg || '0.5',
      aspect_ratio: req.body.aspect_ratio || '1:1',
      camera_type: req.body.camera_type || 'zoom',
      camera_value: req.body.camera_value || '-5'
    };

    // 调用服务 - 注意这里不再传递 tailImage
    const result = await KlingService.generateVideoFromImage15(
      inputImage.data,  // 传递文件的 Buffer
      options
    );

    res.json(result);
  } catch (error) {
    console.error('1.5 版本图生视频错误:', error);
    res.status(500).json({
      error: error.message,
      details: error.response?.data || null
    });
  }
});

// Kling 1.5 版本 10s 图生视频路由
router.post('/generate/kling/m2v_15_img2video_10s', async (req, res) => {
  try {
    console.log('收到 1.5 版本 10s 图生视频请求 - Files:', req.files);
    console.log('收到 1.5 版本 10s 图生视频请求 - Body:', req.body);

    if (!req.files || !req.files.input_image) {
      return res.status(400).json({ error: '需要提供输入图片' });
    }

    // 获取上传的文件
    const inputImage = req.files.input_image;

    // 准备选项对象
    const options = {
      prompt: req.body.prompt || '',
      negative_prompt: req.body.negative_prompt || '',
      cfg: req.body.cfg || '0.5',
      aspect_ratio: req.body.aspect_ratio || '1:1',
      camera_type: req.body.camera_type || 'zoom',
      camera_value: req.body.camera_value || '-5'
    };

    // 调用服务
    const result = await KlingService.generateVideoFromImage15_10s(
      inputImage.data,  // 传递文件的 Buffer
      options
    );

    res.json(result);
  } catch (error) {
    console.error('1.5 版本 10s 图生视频错误:', error);
    res.status(500).json({
      error: error.message,
      details: error.response?.data || null
    });
  }
});

// Kling 图生视频 HQ 路由
router.post('/generate/kling/m2v_img2video_hq', async (req, res) => {
  try {
    console.log('收到图生视频 HQ 请求 - Files:', req.files);
    console.log('收到图生视频 HQ 请求 - Body:', req.body);

    if (!req.files || !req.files.input_image) {
      return res.status(400).json({ error: '需要提供输入图片' });
    }

    // 获取上传的文件
    const inputImage = req.files.input_image;
    const tailImage = req.files.tail_image;

    // 准备选项对象
    const options = {
      prompt: req.body.prompt || '',
      negative_prompt: req.body.negative_prompt || '',
      cfg: req.body.cfg || '0.5',
      aspect_ratio: req.body.aspect_ratio || '1:1',
      camera_type: req.body.camera_type || 'zoom',
      camera_value: req.body.camera_value || '-5'
    };

    // 调用服务
    const result = await KlingService.generateVideoFromImageHQ(
      inputImage.data,  // 传递文件的 Buffer
      tailImage ? tailImage.data : null,  // 如果有尾部图片，传递其 Buffer
      options
    );

    res.json(result);
  } catch (error) {
    console.error('图生视频 HQ 错误:', error);
    res.status(500).json({
      error: error.message,
      details: error.response?.data || null
    });
  }
});

// Kling 图生视频 HQ 10s 路由
router.post('/generate/kling/m2v_img2video_hq_10s', async (req, res) => {
  try {
    console.log('收到图生视频 HQ 10s 请求 - Files:', req.files);
    console.log('收到图生视频 HQ 10s 请求 - Body:', req.body);

    if (!req.files || !req.files.input_image) {
      return res.status(400).json({ error: '需要提供输入图片' });
    }

    // 获取上传的文件
    const inputImage = req.files.input_image;
    const tailImage = req.files.tail_image;

    // 准备选项对象
    const options = {
      prompt: req.body.prompt || '',
      negative_prompt: req.body.negative_prompt || '',
      cfg: req.body.cfg || '0.5',
      aspect_ratio: req.body.aspect_ratio || '1:1',
      camera_type: req.body.camera_type || 'zoom',
      camera_value: req.body.camera_value || '-5'
    };

    // 调用服务
    const result = await KlingService.generateVideoFromImageHQ10s(
      inputImage.data,  // 传递文件的 Buffer
      tailImage ? tailImage.data : null,  // 如果有尾部图片，传递其 Buffer
      options
    );

    res.json(result);
  } catch (error) {
    console.error('图生视频 HQ 10s 错误:', error);
    res.status(500).json({
      error: error.message,
      details: error.response?.data || null
    });
  }
});

// Kling 1.6 版本 5s 文生视频路由
router.post('/generate/kling/m2v_16_txt2video_5s', async (req, res) => {
  try {
    console.log('收到 1.6 版本 5s 文生视频请求 - Body:', req.body);

    const { prompt, negative_prompt, cfg, aspect_ratio, additionalParams } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: '需要提供提示词' });
    }

    // 调用服务
    const result = await KlingService.generateVideo16_5s(prompt, {
      negative_prompt,
      cfg: cfg || '0.5',
      aspect_ratio: aspect_ratio || '1:1',
      additionalParams
    });

    res.json(result);
  } catch (error) {
    console.error('1.6 版本 5s 文生视频错误:', error);
    res.status(500).json({
      error: error.message,
      details: error.response?.data || null
    });
  }
});

// Kling 1.6 版本 10s 文生视频路由
router.post('/generate/kling/m2v_16_txt2video_10s', async (req, res) => {
  try {
    console.log('收到 1.6 版本 10s 文生视频请求 - Body:', req.body);

    const { prompt, negative_prompt, cfg, aspect_ratio, additionalParams } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: '需要提供提示词' });
    }

    // 调用服务
    const result = await KlingService.generateVideo16_10s(prompt, {
      negative_prompt,
      cfg: cfg || '0.5',
      aspect_ratio: aspect_ratio || '1:1',
      additionalParams
    });

    res.json(result);
  } catch (error) {
    console.error('1.6 版本 10s 文生视频错误:', error);
    res.status(500).json({
      error: error.message,
      details: error.response?.data || null
    });
  }
});

// Kling 1.6 版本高清 5s 文生视频路由
router.post('/generate/kling/m2v_16_txt2video_hq_5s', async (req, res) => {
  try {
    console.log('收到 1.6 版本高清 5s 文生视频请求 - Body:', req.body);

    const { prompt, negative_prompt, cfg, aspect_ratio, additionalParams } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: '需要提供提示词' });
    }

    // 调用服务
    const result = await KlingService.generateVideo16_HQ_5s(prompt, {
      negative_prompt,
      cfg: cfg || '0.5',
      aspect_ratio: aspect_ratio || '1:1',
      additionalParams
    });

    res.json(result);
  } catch (error) {
    console.error('1.6 版本高清 5s 文生视频错误:', error);
    res.status(500).json({
      error: error.message,
      details: error.response?.data || null
    });
  }
});

// Kling 1.6 版本高清 10s 文生视频路由
router.post('/generate/kling/m2v_16_txt2video_hq_10s', async (req, res) => {
  try {
    console.log('收到 1.6 版本高清 10s 文生视频请求 - Body:', req.body);

    const { prompt, negative_prompt, cfg, aspect_ratio, additionalParams } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: '需要提供提示词' });
    }

    // 调用服务
    const result = await KlingService.generateVideo16_HQ_10s(prompt, {
      negative_prompt,
      cfg: cfg || '0.5',
      aspect_ratio: aspect_ratio || '1:1',
      additionalParams
    });

    res.json(result);
  } catch (error) {
    console.error('1.6 版本高清 10s 文生视频错误:', error);
    res.status(500).json({
      error: error.message,
      details: error.response?.data || null
    });
  }
});

// Kling 1.6 版本 5s 图生视频路由
router.post('/generate/kling/m2v_16_img2video_5s', async (req, res) => {
  try {
    console.log('收到 1.6 版本 5s 图生视频请求 - Files:', req.files);
    console.log('收到 1.6 版本 5s 图生视频请求 - Body:', req.body);

    if (!req.files || !req.files.input_image) {
      return res.status(400).json({ error: '需要提供输入图片' });
    }

    // 获取上传的文件
    const inputImage = req.files.input_image;

    // 准备选项对象
    const options = {
      prompt: req.body.prompt || '',
      negative_prompt: req.body.negative_prompt || '',
      cfg: req.body.cfg || '0.5',
      aspect_ratio: req.body.aspect_ratio || '1:1',
      image_list: req.body.image_list || ''
    };

    // 调用服务
    const result = await KlingService.generateVideoFromImage16_5s(
      inputImage.data,  // 传递文件的 Buffer
      options
    );

    res.json(result);
  } catch (error) {
    console.error('1.6 版本 5s 图生视频错误:', error);
    res.status(500).json({
      error: error.message,
      details: error.response?.data || null
    });
  }
});

// Kling 1.6 版本 10s 图生视频路由
router.post('/generate/kling/m2v_16_img2video_10s', async (req, res) => {
  try {
    console.log('收到 1.6 版本 10s 图生视频请求 - Files:', req.files);
    console.log('收到 1.6 版本 10s 图生视频请求 - Body:', req.body);

    if (!req.files || !req.files.input_image) {
      return res.status(400).json({ error: '需要提供输入图片' });
    }

    // 获取上传的文件
    const inputImage = req.files.input_image;

    // 准备选项对象
    const options = {
      prompt: req.body.prompt || '',
      negative_prompt: req.body.negative_prompt || '',
      cfg: req.body.cfg || '0.5',
      aspect_ratio: req.body.aspect_ratio || '1:1',
      image_list: req.body.image_list || ''
    };

    // 调用服务
    const result = await KlingService.generateVideoFromImage16_10s(
      inputImage.data,  // 传递文件的 Buffer
      options
    );

    res.json(result);
  } catch (error) {
    console.error('1.6 版本 10s 图生视频错误:', error);
    res.status(500).json({
      error: error.message,
      details: error.response?.data || null
    });
  }
});

// Kling 1.6 版本高清 5s 图生视频路由
router.post('/generate/kling/m2v_16_img2video_hq_5s', async (req, res) => {
  try {
    console.log('收到 1.6 版本高清 5s 图生视频请求 - Files:', req.files);
    console.log('收到 1.6 版本高清 5s 图生视频请求 - Body:', req.body);

    if (!req.files || !req.files.input_image) {
      return res.status(400).json({ error: '需要提供输入图片' });
    }

    // 获取上传的文件
    const inputImage = req.files.input_image;

    // 准备选项对象
    const options = {
      prompt: req.body.prompt || '',
      negative_prompt: req.body.negative_prompt || '',
      cfg: req.body.cfg || '0.5',
      aspect_ratio: req.body.aspect_ratio || '1:1',
      image_list: req.body.image_list || ''
    };

    // 调用服务
    const result = await KlingService.generateVideoFromImage16_HQ_5s(
      inputImage.data,  // 传递文件的 Buffer
      options
    );

    res.json(result);
  } catch (error) {
    console.error('1.6 版本高清 5s 图生视频错误:', error);
    res.status(500).json({
      error: error.message,
      details: error.response?.data || null
    });
  }
});

// Kling 1.6 版本高清 10s 图生视频路由
router.post('/generate/kling/m2v_16_img2video_hq_10s', async (req, res) => {
  try {
    console.log('收到 1.6 版本高清 10s 图生视频请求 - Files:', req.files);
    console.log('收到 1.6 版本高清 10s 图生视频请求 - Body:', req.body);

    if (!req.files || !req.files.input_image) {
      return res.status(400).json({ error: '需要提供输入图片' });
    }

    // 获取上传的文件
    const inputImage = req.files.input_image;

    // 准备选项对象
    const options = {
      prompt: req.body.prompt || '',
      negative_prompt: req.body.negative_prompt || '',
      cfg: req.body.cfg || '0.5',
      aspect_ratio: req.body.aspect_ratio || '1:1',
      image_list: req.body.image_list || ''
    };

    // 调用服务
    const result = await KlingService.generateVideoFromImage16_HQ_10s(
      inputImage.data,  // 传递文件的 Buffer
      options
    );

    res.json(result);
  } catch (error) {
    console.error('1.6 版本高清 10s 图生视频错误:', error);
    res.status(500).json({
      error: error.message,
      details: error.response?.data || null
    });
  }
});

// 添加 Kling 1.6 版本多图参考路由
router.post('/generate/kling/m2v_16_img2video_5s_multi', async (req, res) => {
  try {
    console.log('收到 1.6 版本多图参考请求 - Body:', req.body);

    const { prompt, negative_prompt, cfg, aspect_ratio, image_list } = req.body;
    
    if (!image_list || !Array.isArray(image_list) || image_list.length === 0) {
      return res.status(400).json({ error: '需要提供图片列表' });
    }

    if (image_list.length > 4) {
      return res.status(400).json({ error: '图片列表最多只能包含4张图片' });
    }

    // 准备选项对象
    const options = {
      prompt: prompt || '',
      negative_prompt: negative_prompt || '',
      cfg: cfg || '0.5',
      aspect_ratio: aspect_ratio || '1:1',
      image_list: image_list
    };

    // 调用服务
    const result = await KlingService.generateVideoFromMultiImages16_5s(options);

    res.json(result);
  } catch (error) {
    console.error('1.6 版本多图参考错误:', error);
    res.status(500).json({
      error: error.message,
      details: error.response?.data || null
    });
  }
});

// Kling 视频扩展路由
router.post('/generate/kling/m2v_extend_video', async (req, res) => {
  try {
    console.log('收到视频扩展请求 - Body:', req.body);

    const { prompt, task_id, negative_prompt, additionalParams } = req.body;
    
    if (!task_id) {
      return res.status(400).json({ error: '需要提供原始视频的任务ID' });
    }
    
    if (!prompt) {
      return res.status(400).json({ error: '需要提供提示词' });
    }

    // 调用服务
    const result = await KlingService.extendVideo(task_id, prompt, {
      negative_prompt,
      additionalParams
    });

    res.json(result);
  } catch (error) {
    console.error('视频扩展错误:', error);
    res.status(500).json({
      error: error.message,
      details: error.response?.data || null
    });
  }
});

// API文档路由
router.get('/docs', (req, res) => {
  const apiDocs = {
    title: "视频生成API文档",
    version: "1.0.0",
    baseUrl: "/api/videos",
    apis: [
      {
        path: "/",
        method: "POST",
        description: "创建新视频",
        auth: "需要认证",
        handler: "videoController.createVideo",
        requestBody: {
          // 视频创建所需参数
        },
        response: {
          success: true,
          data: {
            // 返回的视频数据
          }
        }
      },
      {
        path: "/",
        method: "GET",
        description: "获取视频列表",
        auth: "需要认证",
        handler: "videoController.getVideos",
        response: {
          success: true,
          data: [
            // 视频列表
          ]
        }
      },
      {
        path: "/generate/kling/m2v_txt2video",
        method: "POST",
        description: "Kling标准视频生成",
        requestBody: {
          prompt: "视频提示词(必填)",
          camera_type: "相机类型",
          camera_value: "相机值",
          cfg: "配置值(默认0.5)",
          aspect_ratio: "宽高比(默认1:1)",
          negative_prompt: "负面提示词"
        },
        response: {
          success: true,
          data: {
            task_id: "任务ID",
            status: "任务状态"
          }
        }
      },
      {
        path: "/generate/kling/m2v_txt2video_hq_5s",
        method: "POST",
        description: "Kling高质量5秒视频生成",
        requestBody: {
          prompt: "视频提示词(必填)",
          camera_type: "相机类型",
          camera_value: "相机值",
          cfg: "配置值(默认0.5)",
          aspect_ratio: "宽高比(默认1:1)",
          negative_prompt: "负面提示词",
          additionalParams: "额外参数"
        },
        response: {
          success: true,
          data: {
            task_id: "任务ID",
            status: "任务状态"
          }
        }
      },
      {
        path: "/generate/kling/m2v_txt2video_hq_10s",
        method: "POST",
        description: "Kling高质量10秒视频生成",
        requestBody: {
          prompt: "视频提示词(必填)",
          camera_type: "相机类型",
          camera_value: "相机值",
          cfg: "配置值(默认0.5)",
          aspect_ratio: "宽高比(默认1:1)",
          negative_prompt: "负面提示词",
          additionalParams: "额外参数"
        },
        response: {
          success: true,
          data: {
            task_id: "任务ID",
            status: "任务状态"
          }
        }
      },
      {
        path: "/generate",
        method: "POST",
        description: "兼容性视频生成接口",
        requestBody: {
          prompt: "视频提示词(必填)",
          camera_type: "相机类型",
          camera_value: "相机值",
          cfg: "配置值(默认0.5)",
          aspect_ratio: "宽高比(默认1:1)",
          negative_prompt: "负面提示词"
        },
        response: {
          success: true,
          data: {
            task_id: "任务ID",
            status: "任务状态"
          }
        }
      },
      {
        path: "/status/:taskId",
        method: "GET",
        description: "检查任务状态并获取结果",
        params: {
          taskId: "任务ID(必填)"
        },
        response: {
          success: true,
          data: {
            status: "任务状态",
            result: "任务结果(如果完成)"
          }
        }
      },
      {
        path: "/check-status/:taskId",
        method: "GET",
        description: "仅检查任务状态(不获取结果)",
        params: {
          taskId: "任务ID(必填)"
        },
        response: {
          success: true,
          data: {
            status: "任务状态"
          }
        }
      },
      {
        path: "/generate/kling/m2v_img2video_10s",
        method: "POST",
        description: "Kling图生视频10秒",
        requestBody: {
          input_image: "输入图片文件(必填)",
          tail_image: "尾部图片文件(可选)",
          prompt: "提示词",
          negative_prompt: "负面提示词",
          cfg: "配置值(默认0.5)",
          aspect_ratio: "宽高比(默认1:1)",
          camera_type: "相机类型",
          camera_value: "相机值"
        },
        response: {
          task_id: "任务ID",
          status: "任务状态"
        }
      },
      {
        path: "/generate/kling/m2v_img2video",
        method: "POST",
        description: "Kling图生视频5秒",
        requestBody: {
          input_image: "输入图片文件(必填)",
          tail_image: "尾部图片文件(可选)",
          prompt: "提示词",
          negative_prompt: "负面提示词",
          cfg: "配置值(默认0.5)",
          aspect_ratio: "宽高比(默认1:1)",
          camera_type: "相机类型",
          camera_value: "相机值"
        },
        response: {
          task_id: "任务ID",
          status: "任务状态"
        }
      },
      {
        path: "/generate/kling/m2v_15_img2video",
        method: "POST",
        description: "Kling 1.5版本图生视频",
        requestBody: {
          input_image: "输入图片文件(必填)",
          prompt: "提示词",
          negative_prompt: "负面提示词",
          cfg: "配置值(默认0.5)",
          aspect_ratio: "宽高比(默认1:1)",
          camera_type: "相机类型(默认zoom)",
          camera_value: "相机值(默认-5)"
        },
        response: {
          task_id: "任务ID",
          status: "任务状态"
        }
      },
      {
        path: "/generate/kling/m2v_15_img2video_10s",
        method: "POST",
        description: "Kling 1.5版本10秒图生视频",
        requestBody: {
          input_image: "输入图片文件(必填)",
          prompt: "提示词",
          negative_prompt: "负面提示词",
          cfg: "配置值(默认0.5)",
          aspect_ratio: "宽高比(默认1:1)",
          camera_type: "相机类型(默认zoom)",
          camera_value: "相机值(默认-5)"
        },
        response: {
          task_id: "任务ID",
          status: "任务状态"
        }
      },
      {
        path: "/generate/kling/m2v_img2video_hq",
        method: "POST",
        description: "Kling图生视频高质量版",
        requestBody: {
          input_image: "输入图片文件(必填)",
          tail_image: "尾部图片文件(可选)",
          prompt: "提示词",
          negative_prompt: "负面提示词",
          cfg: "配置值(默认0.5)",
          aspect_ratio: "宽高比(默认1:1)",
          camera_type: "相机类型(默认zoom)",
          camera_value: "相机值(默认-5)"
        },
        response: {
          task_id: "任务ID",
          status: "任务状态"
        }
      },
      {
        path: "/generate/kling/m2v_img2video_hq_10s",
        method: "POST",
        description: "Kling图生视频高质量10秒版",
        requestBody: {
          input_image: "输入图片文件(必填)",
          tail_image: "尾部图片文件(可选)",
          prompt: "提示词",
          negative_prompt: "负面提示词",
          cfg: "配置值(默认0.5)",
          aspect_ratio: "宽高比(默认1:1)",
          camera_type: "相机类型(默认zoom)",
          camera_value: "相机值(默认-5)"
        },
        response: {
          task_id: "任务ID",
          status: "任务状态"
        }
      },
      {
        path: "/generate/kling/m2v_16_txt2video_5s",
        method: "POST",
        description: "Kling 1.6版本5秒文生视频",
        requestBody: {
          prompt: "提示词(必填)",
          negative_prompt: "负面提示词",
          cfg: "配置值(默认0.5)",
          aspect_ratio: "宽高比(默认1:1)",
          additionalParams: "额外参数"
        },
        response: {
          task_id: "任务ID",
          status: "任务状态"
        }
      },
      {
        path: "/generate/kling/m2v_16_txt2video_10s",
        method: "POST",
        description: "Kling 1.6版本10秒文生视频",
        requestBody: {
          prompt: "提示词(必填)",
          negative_prompt: "负面提示词",
          cfg: "配置值(默认0.5)",
          aspect_ratio: "宽高比(默认1:1)",
          additionalParams: "额外参数"
        },
        response: {
          task_id: "任务ID",
          status: "任务状态"
        }
      },
      {
        path: "/generate/kling/m2v_16_txt2video_hq_5s",
        method: "POST",
        description: "Kling 1.6版本高清5秒文生视频",
        requestBody: {
          prompt: "提示词(必填)",
          negative_prompt: "负面提示词",
          cfg: "配置值(默认0.5)",
          aspect_ratio: "宽高比(默认1:1)",
          additionalParams: "额外参数"
        },
        response: {
          task_id: "任务ID",
          status: "任务状态"
        }
      },
      {
        path: "/generate/kling/m2v_16_txt2video_hq_10s",
        method: "POST",
        description: "Kling 1.6版本高清10秒文生视频",
        requestBody: {
          prompt: "提示词(必填)",
          negative_prompt: "负面提示词",
          cfg: "配置值(默认0.5)",
          aspect_ratio: "宽高比(默认1:1)",
          additionalParams: "额外参数"
        },
        response: {
          task_id: "任务ID",
          status: "任务状态"
        }
      },
      {
        path: "/generate/kling/m2v_16_img2video_5s",
        method: "POST",
        description: "Kling 1.6版本5秒图生视频",
        requestBody: {
          input_image: "输入图片文件(必填)",
          prompt: "提示词",
          negative_prompt: "负面提示词",
          cfg: "配置值(默认0.5)",
          aspect_ratio: "宽高比(默认1:1)",
          image_list: "图片列表"
        },
        response: {
          task_id: "任务ID",
          status: "任务状态"
        }
      },
      {
        path: "/generate/kling/m2v_16_img2video_10s",
        method: "POST",
        description: "Kling 1.6版本10秒图生视频",
        requestBody: {
          input_image: "输入图片文件(必填)",
          prompt: "提示词",
          negative_prompt: "负面提示词",
          cfg: "配置值(默认0.5)",
          aspect_ratio: "宽高比(默认1:1)",
          image_list: "图片列表"
        },
        response: {
          task_id: "任务ID",
          status: "任务状态"
        }
      },
      {
        path: "/generate/kling/m2v_16_img2video_hq_5s",
        method: "POST",
        description: "Kling 1.6版本高清5秒图生视频",
        requestBody: {
          input_image: "输入图片文件(必填)",
          prompt: "提示词",
          negative_prompt: "负面提示词",
          cfg: "配置值(默认0.5)",
          aspect_ratio: "宽高比(默认1:1)",
          image_list: "图片列表"
        },
        response: {
          task_id: "任务ID",
          status: "任务状态"
        }
      },
      {
        path: "/generate/kling/m2v_16_img2video_hq_10s",
        method: "POST",
        description: "Kling 1.6版本高清10秒图生视频",
        requestBody: {
          input_image: "输入图片文件(必填)",
          prompt: "提示词",
          negative_prompt: "负面提示词",
          cfg: "配置值(默认0.5)",
          aspect_ratio: "宽高比(默认1:1)",
          image_list: "图片列表"
        },
        response: {
          task_id: "任务ID",
          status: "任务状态"
        }
      },
      {
        path: "/generate/kling/m2v_16_img2video_5s_multi",
        method: "POST",
        description: "Kling 1.6版本多图参考视频生成",
        requestBody: {
          image_list: "图片列表(必填，最多4张)",
          prompt: "提示词",
          negative_prompt: "负面提示词",
          cfg: "配置值(默认0.5)",
          aspect_ratio: "宽高比(默认1:1)"
        },
        response: {
          task_id: "任务ID",
          status: "任务状态"
        }
      },
      {
        path: "/generate/kling/m2v_extend_video",
        method: "POST",
        description: "Kling视频扩展",
        requestBody: {
          task_id: "原始视频任务ID(必填)",
          prompt: "提示词(必填)",
          negative_prompt: "负面提示词",
          additionalParams: "额外参数"
        },
        response: {
          task_id: "任务ID",
          status: "任务状态"
        }
      }
    ]
  };

  res.json(apiDocs);
});

module.exports = router;