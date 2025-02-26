// routes/videoRoutes.js
const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, videoController.createVideo);
router.get('/', authMiddleware, videoController.getVideos);

module.exports = router;