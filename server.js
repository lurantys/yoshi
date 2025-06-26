const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post('/api/generate-playlist', async (req, res) => {
  const { gptPrompt } = req.body;
  if (!gptPrompt) {
    return res.status(400).json({ error: 'Missing gptPrompt in request body' });
  }
  try {
    console.log('Prompt sent to OpenRouter:', gptPrompt);
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'google/gemini-2.5-flash-lite-preview-06-17',
        messages: [
          { role: 'user', content: gptPrompt }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('OpenRouter response:', response.data);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message, details: error.response?.data });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
}); 