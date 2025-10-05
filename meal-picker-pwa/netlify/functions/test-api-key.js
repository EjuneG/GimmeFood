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

    // Test multiple model/API version combinations
    const modelsToTest = [
      { api: 'v1', model: 'gemini-pro' },
      { api: 'v1', model: 'gemini-1.5-flash' },
      { api: 'v1beta', model: 'gemini-1.5-flash' },
      { api: 'v1beta', model: 'gemini-1.5-pro' }
    ];

    const results = [];

    for (const { api, model } of modelsToTest) {
      try {
        const testResponse = await fetch(
          `https://generativelanguage.googleapis.com/v${api}/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: 'Test' }]
              }]
            })
          }
        );

        const responseText = await testResponse.text();
        results.push({
          api,
          model,
          status: testResponse.status,
          success: testResponse.ok,
          response: responseText.substring(0, 200)
        });
      } catch (err) {
        results.push({
          api,
          model,
          status: 'error',
          success: false,
          error: err.message
        });
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        api_key_exists: true,
        api_key_length: apiKey.length,
        api_key_prefix: apiKey.substring(0, 10) + '...',
        model_tests: results,
        working_models: results.filter(r => r.success).map(r => `${r.api}/${r.model}`)
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
