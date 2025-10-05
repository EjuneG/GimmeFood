// Netlify Function: 营养分析 API
// 使用 Gemini API 分析用户输入的食物描述，返回营养成分估算

exports.handler = async (event) => {
  // CORS 处理
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // 处理 OPTIONS 预检请求
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { foodDescription } = JSON.parse(event.body);

    console.log('Nutrition analysis request:', { foodDescription });

    if (!foodDescription || foodDescription.trim().length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '请输入食物描述' })
      };
    }

    // 检查 API Key
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'API配置错误',
          details: 'GEMINI_API_KEY 未设置'
        })
      };
    }

    // 调用 Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `你是营养分析专家。用户描述了他们吃的食物，请估算营养成分。

用户输入: ${foodDescription}

请严格按照以下JSON格式返回，不要有任何其他文字：
{
  "calories": 估算卡路里数值(整数),
  "protein": 蛋白质克数(整数),
  "carbs": 碳水化合物克数(整数),
  "fat": 脂肪克数(整数),
  "note": "简短营养提示(不超过20字)"
}

注意：
1. 所有数值必须是整数，不要单位
2. 如果信息不足，给出合理估算
3. 只返回JSON，不要任何解释文字`
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 1,
            topP: 1,
            maxOutputTokens: 256,
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', geminiResponse.status, errorText);
      throw new Error(`Gemini API 错误: ${geminiResponse.status} - ${errorText}`);
    }

    const geminiData = await geminiResponse.json();
    console.log('Gemini API response:', JSON.stringify(geminiData, null, 2));

    // 解析 Gemini 返回的内容
    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      console.error('No response text from Gemini:', geminiData);
      throw new Error('Gemini API 返回格式错误');
    }

    console.log('Extracted text:', responseText);

    // 提取 JSON（移除可能的 markdown 代码块）
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const nutritionData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    if (!nutritionData) {
      throw new Error('无法解析营养数据');
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: {
          calories: parseInt(nutritionData.calories) || 0,
          protein: parseInt(nutritionData.protein) || 0,
          carbs: parseInt(nutritionData.carbs) || 0,
          fat: parseInt(nutritionData.fat) || 0,
          note: nutritionData.note || '营养均衡'
        }
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: '分析失败，请稍后重试',
        details: error.message
      })
    };
  }
};
