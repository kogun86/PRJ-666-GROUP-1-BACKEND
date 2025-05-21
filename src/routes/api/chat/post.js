import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import config from '../../../config.js';

// Debug function to safely log objects
function safeLog(label, obj) {
  try {
    console.log(`${label}:`, JSON.stringify(obj, null, 2));
  } catch (e) {
    console.log(`${label}: [Error stringifying object]`, e.message);
  }
}

export async function postChatMessageHandler(req, res) {
  console.log('========== CHAT DEBUG ==========');
  console.log('Chat endpoint hit');
  safeLog('Config object', config);
  safeLog('Request body', req.body);

  try {
    const { message } = req.body;
    console.log('Message extracted:', message);

    if (!message) {
      console.log('Error: Missing message in request');
      return res.status(400).json({
        status: 'error',
        error: 'Message is required',
      });
    }

    const messageId = uuidv4();
    const timestamp = new Date().toISOString();
    console.log('Generated messageId:', messageId);

    // OpenRouter API configuration
    const openRouterApiKey = config.OPENROUTER_API_KEY;
    console.log('API key exists:', !!openRouterApiKey);

    if (!openRouterApiKey) {
      console.log('Error: OpenRouter API key is not defined in environment variables');
      return res.status(500).json({
        status: 'error',
        error: 'Server configuration error - API key missing',
      });
    }

    console.log('Preparing to send request to OpenRouter API...');
    const requestPayload = {
      model: 'openai/gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }],
    };
    safeLog('Request payload', requestPayload);

    // Make request to OpenRouter API
    console.log('Sending request to OpenRouter...');
    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        requestPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openRouterApiKey}`,
            'HTTP-Referer': 'http://localhost:8080',
            'X-Title': 'Seneca PRJ-666 Chat Assistant',
          },
        }
      );

      console.log('Received response from OpenRouter API');
      safeLog('Response status', response.status);
      safeLog('Response headers', response.headers);
      safeLog('Response data', response.data);

      // Process the AI response
      const aiResponse =
        response.data.choices[0]?.message?.content || "Sorry, I couldn't process your request.";
      console.log('Extracted AI response:', aiResponse.substring(0, 50) + '...');

      // Return response with metadata
      return res.status(200).json({
        status: 'ok',
        data: {
          message: aiResponse,
          metadata: {
            messageId,
            timestamp,
          },
        },
      });
    } catch (axiosError) {
      console.log('Axios error occurred during OpenRouter API request:');
      if (axiosError.response) {
        console.log('Response status:', axiosError.response.status);
        safeLog('Response data', axiosError.response.data);
        safeLog('Response headers', axiosError.response.headers);
      } else if (axiosError.request) {
        console.log('No response received');
        console.log('Request details:', axiosError.request._currentUrl);
      } else {
        console.log('Error message:', axiosError.message);
      }
      console.log('Error config:', JSON.stringify(axiosError.config, null, 2));
      throw axiosError; // Re-throw to be caught by outer catch
    }
  } catch (error) {
    console.log('Main error handler:');
    console.log('Error type:', error.constructor.name);
    console.log('Error message:', error.message);
    console.log('Error stack:', error.stack);

    return res.status(500).json({
      status: 'error',
      error: 'Failed to process message',
    });
  } finally {
    console.log('========== END CHAT DEBUG ==========');
  }
}
