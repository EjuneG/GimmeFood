// Vercel Serverless Function: 营养目标生成 API
// 使用 Gemini API 根据用户的体重、身高和目标，生成个性化营养目标

export default async function handler(req, res) {
  // CORS 处理
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { weight, height, goalType } = req.body;

    console.log('Nutrition goal generation request:', { weight, height, goalType });

    // 验证输入
    if (!weight || weight <= 0 || weight > 500) {
      return res.status(400).json({ error: '请输入有效的体重 (1-500 kg)' });
    }

    if (!height || height <= 0 || height > 300) {
      return res.status(400).json({ error: '请输入有效的身高 (1-300 cm)' });
    }

    if (!goalType) {
      return res.status(400).json({ error: '请选择目标类型' });
    }

    // 检查 API Key
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not configured');
      return res.status(500).json({
        success: false,
        error: 'API配置错误',
        details: 'GEMINI_API_KEY 未设置'
      });
    }

    // 目标类型的中文映射
    const goalTypeMap = {
      'weight_loss': '减脂',
      'muscle_gain': '增肌',
      'maintain': '保持体重',
      'general_health': '一般健康'
    };

    const goalTypeChinese = goalTypeMap[goalType] || goalType;

    // 调用 Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `你是专业的营养师。根据用户的信息，为他们制定每日营养目标。

用户信息:
- 体重: ${weight} kg
- 身高: ${height} cm
- 目标: ${goalTypeChinese}

请根据以下原则制定营养目标：
1. 减脂：热量赤字，高蛋白，适量碳水和脂肪
2. 增肌：热量盈余，高蛋白，充足碳水和脂肪
3. 保持体重：维持热量，均衡营养
4. 一般健康：标准热量需求，均衡营养

请严格按照以下JSON格式返回，不要有任何其他文字：
{
  "calories": 每日卡路里目标(整数),
  "protein": 每日蛋白质目标克数(整数),
  "carbs": 每日碳水化合物目标克数(整数),
  "fat": 每日脂肪目标克数(整数),
  "note": "简短的目标说明(不超过30字)"
}

注意：
1. 所有数值必须是整数，不要单位
2. 确保营养配比合理（蛋白质4卡/克，碳水4卡/克，脂肪9卡/克）
3. 只返回JSON，不要任何解释文字`
            }]
          }],
          generationConfig: {
            temperature: 0.5,
            topK: 20,
            topP: 0.9
            // No maxOutputTokens limit - let gemini-2.5-flash use what it needs
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

    // 检查是否有安全过滤或其他阻止
    if (geminiData.promptFeedback?.blockReason) {
      console.error('Content blocked:', geminiData.promptFeedback);
      throw new Error(`内容被过滤: ${geminiData.promptFeedback.blockReason}`);
    }

    // 解析 Gemini 返回的内容
    const candidate = geminiData.candidates?.[0];

    if (!candidate) {
      console.error('No candidates in response:', geminiData);
      throw new Error('Gemini API 未返回结果');
    }

    // 检查候选结果是否被过滤
    if (candidate.finishReason === 'SAFETY') {
      console.error('Response filtered for safety:', candidate);
      throw new Error('内容安全过滤');
    }

    const responseText = candidate.content?.parts?.[0]?.text;

    if (!responseText) {
      console.error('No response text from Gemini. Candidate:', JSON.stringify(candidate));
      throw new Error('Gemini API 返回格式错误 - 无文本内容');
    }

    console.log('Extracted text:', responseText);

    // 提取 JSON（移除可能的 markdown 代码块）
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const goalData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    if (!goalData) {
      throw new Error('无法解析营养目标数据');
    }

    return res.status(200).json({
      success: true,
      data: {
        calories: parseInt(goalData.calories) || 2000,
        protein: parseInt(goalData.protein) || 100,
        carbs: parseInt(goalData.carbs) || 250,
        fat: parseInt(goalData.fat) || 65,
        note: goalData.note || '均衡营养，健康饮食'
      }
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      error: '生成失败，请稍后重试',
      details: error.message
    });
  }
}
