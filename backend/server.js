require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Code generation route
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      console.error('DEEPSEEK_API_KEY is not set in environment variables');
      return res.status(500).json({ error: 'API key configuration error' });
    }

    console.log('Sending request to DeepSeek API...');
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{
          role: "user",
          content: prompt
        }],
        model: "deepseek-coder",
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 0.95,
        frequency_penalty: 0,
        presence_penalty: 0
      }),
    });

    const responseText = await response.text();
    console.log('Raw API Response:', responseText);

    if (!response.ok) {
      console.error('DeepSeek API error response:', {
        status: response.status,
        statusText: response.statusText,
        body: responseText
      });

      let errorMessage;
      try {
        const errorJson = JSON.parse(responseText);
        errorMessage = errorJson.message || errorJson.error || 'Failed to generate code';
      } catch {
        errorMessage = `API Error: ${response.status} ${response.statusText}`;
      }

      return res.status(response.status).json({ error: errorMessage });
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      return res.status(500).json({ error: 'Invalid JSON response from API' });
    }

    if (!data.choices?.[0]?.message?.content) {
      console.error('Unexpected API response format:', data);
      return res.status(500).json({ error: 'Invalid response format from API' });
    }

    const generatedCode = data.choices[0].message.content.trim();
    res.json({
      code: generatedCode,
      language: 'javascript'
    });

  } catch (error) {
    console.error('Error in API route:', error);
    res.status(500).json({ error: 'Failed to generate code. Please try again.' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
}); 