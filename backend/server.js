const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());

app.get('/api/quizzes', async (req, res) => {
    try {
      const response = await axios.get('https://api.jsonserve.com/Uw5CrX');
      res.json(response.data);
    } catch (error) {
      console.error('API Request Failed:', error.response ? error.response.data : error.message);
      res.status(500).json({ message: error.message });
    }
  });
  

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});