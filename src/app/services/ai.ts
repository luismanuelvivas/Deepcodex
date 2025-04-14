import axios from 'axios';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface CodeGenerationResponse {
  code: string;
  language: string;
}

export async function generateCode(prompt: string): Promise<{
  code: string;
  language: string;
  message: string;
}> {
  try {
    console.log('Sending request to backend...');
    const response = await axios.post(`http://localhost:5000/api/generate`, { prompt }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Received response:', response.data);

    if (response.data.error) {
      throw new Error(response.data.error);
    }

    const content = response.data.code;
    let code = '';
    let message = '';

    // Extract code blocks from the response
    const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)```/g;
    const matches = content.match(codeBlockRegex);

    if (matches) {
      // Extract all code blocks
      code = matches
        .map((block: string) => block.replace(/```(?:\w+)?\n|```/g, ''))
        .join('\n\n');
      
      // Remove code blocks to get just the explanation
      message = content
        .split(codeBlockRegex)
        .filter((text: string) => text && !text.trim().match(/^[\w-]+$/)) // Remove language identifiers
        .join('\n')
        .trim();
    } else {
      // If no code blocks found, treat it all as explanation
      message = content;
      code = '// No code blocks found in the response';
    }

    return {
      code: code || '// No code generated',
      language: response.data.language || 'javascript',
      message: message || 'Code generated successfully',
    };
  } catch (error: any) {
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    
    const errorMessage = error.response?.data?.error || 
                        error.message || 
                        'Failed to generate code. Please try again.';
    
    throw new Error(errorMessage);
  }
} 