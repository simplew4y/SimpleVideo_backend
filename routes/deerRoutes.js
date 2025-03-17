const express = require('express');
const router = express.Router();
const DeerService = require('../services/deerService');

/**
 * 文本生成视频
 */
router.post('/text2video', async (req, res) => {
  try {
    const {
      prompt,
      aspect_ratio,
      callback_url,
      camera_control,
      cfg_scale,
      duration,
      mode,
      model_name,
      negative_prompt
    } = req.body;

    // 验证必需参数
    if (!prompt) {
      return res.status(400).json({ error: '缺少必需的 prompt 参数' });
    }

    // 构建选项对象
    const options = {
      aspect_ratio,
      callback_url,
      camera_control,
      cfg_scale,
      duration,
      mode,
      model_name,
      negative_prompt
    };

    // 过滤掉未定义的选项
    Object.keys(options).forEach(key => 
      options[key] === undefined && delete options[key]
    );

    const result = await DeerService.generateVideo(prompt, options);
    res.json(result);
  } catch (error) {
    console.error('文生视频错误:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 获取任务状态
 */
router.get('/tasks/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const result = await DeerService.checkTaskStatus(taskId);
    res.json(result);
  } catch (error) {
    console.error('获取任务状态错误:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 