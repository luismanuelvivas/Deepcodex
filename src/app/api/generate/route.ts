import { NextResponse } from 'next/server';

// Using the code completion endpoint instead
const DEEPSEEK_API_URL = 'https://api.deepseek.ai/v1/completions';

export async function POST(request: Request) {
  // Add CORS headers
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      console.error('DEEPSEEK_API_KEY is not set in environment variables');
      return NextResponse.json(
        { error: 'API key configuration error' },
        { 
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    console.log('Sending request to DeepSeek API...');
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        prompt: `Write code for: ${prompt}`,
        model: "deepseek-coder-6.7b-instruct",
        max_tokens: 1000,
        temperature: 0.7,
        stop: ["```"],
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

      return NextResponse.json(
        { error: errorMessage },
        { 
          status: response.status,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      return NextResponse.json(
        { error: 'Invalid JSON response from API' },
        { 
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    console.log('Parsed API Response:', data);

    if (!data.choices?.[0]?.text) {
      console.error('Unexpected API response format:', data);
      return NextResponse.json(
        { error: 'Invalid response format from API' },
        { 
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    const generatedCode = data.choices[0].text.trim();
    return NextResponse.json(
      {
        code: generatedCode,
        language: 'javascript'
      },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );

  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { error: 'Failed to generate code. Please try again.' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
} 