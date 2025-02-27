// routes/videoRoutes.js
const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const authMiddleware = require('../middleware/authMiddleware');
const KlingService = require('../services/klingService');

router.post('/', authMiddleware, videoController.createVideo);
router.get('/', authMiddleware, videoController.getVideos);

// Generate video route
router.post('/generate', async (req, res) => {
  try {
    const { prompt, camera_type, camera_value, cfg, aspect_ratio } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const result = await KlingService.generateVideo(prompt, {
      camera_type,
      camera_value,
      cfg: cfg || '0.5',
      aspect_ratio: aspect_ratio || '1:1'
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Video generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Check task status and get result route
router.get('/status/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const result = await KlingService.getTaskResult(taskId);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Task status check error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;