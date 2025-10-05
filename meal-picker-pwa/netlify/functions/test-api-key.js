// Quick test function to verify Gemini API key is working

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    // Check if API key exists
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'GEMINI_API_KEY not found in environment variables',
          available_vars: Object.keys(process.env).filter(k => !k.includes('SECRET'))
        })
      };
    }

    // Test with a simple request
    const testResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: 'Say "API key works!" in JSON format: {"status": "ok"}' }]
          }]
        })
      }
    );

    const status = testResponse.status;
    const responseText = await testResponse.text();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        api_key_exists: true,
        api_key_length: apiKey.length,
        api_key_prefix: apiKey.substring(0, 10) + '...',
        gemini_response_status: status,
        gemini_response: responseText.substring(0, 500),
        success: testResponse.ok
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message,
        stack: error.stack
      })
    };
  }
};
