// services/runwayService.js
const axios = require('axios');
require('dotenv').config();

const generateVideo = async (taskType, inputData) => {
  const response = await axios.post(
    'https://api.runwayml.com/generate', // 假设的 API 地址
    { taskType, inputData },
    { headers: { Authorization: `Bearer ${process.env.RUNWAY_API_KEY}` } }
  );
  return response.data.videoUrl; // 假设返回视频 URL
};

module.exports = { generateVideo };