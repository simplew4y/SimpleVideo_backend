// controllers/videoController.js
const Video = require('../models/Video');
const klingsService = require('../services/klingService');
const runwayService = require('../services/runwayService');

const createVideo = async (req, res) => {
  const { model, taskType, inputData } = req.body;
  try {
    const video = await Video.create({
      model,
      taskType,
      inputData,
      userId: req.user.id,
    });

    let videoUrl;
    if (model === 'klings') {
      videoUrl = await klingsService.generateVideo(taskType, inputData);
    } else if (model === 'runway') {
      videoUrl = await runwayService.generateVideo(taskType, inputData);
    } else {
      return res.status(400).json({ message: 'Invalid model' });
    }

    video.videoUrl = videoUrl;
    video.status = 'completed';
    await video.save();
    res.json(video);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getVideos = async (req, res) => {
  try {
    const videos = await Video.findAll({ where: { userId: req.user.id } });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createVideo, getVideos };