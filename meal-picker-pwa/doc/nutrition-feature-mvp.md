# Gimme Food 营养分析功能 MVP 实现文档

## 功能概述
在用户接受推荐餐厅后，提供**可选的**营养分析功能，通过 Gemini API 粗略估算本餐营养成分。

## 核心设计原则
- ✅ **可选不强制** - 用户可以跳过营养记录
- ✅ **流程简化** - 最小化输入摩擦
- ✅ **粗略估算** - 明确告知"仅供参考"
- ✅ **渐进增强** - 不影响现有核心功能

## 用户流程

### 当前流程
```
点击"给我食物!" → 选餐点类型 → 推荐餐厅 → 
[就吃它!] → (结束)
```

### 新流程（在"就吃它!"之后）
```
[就吃它!] → 
  ↓
【可选】记录营养？
  ├─ [跳过] → (结束)
  └─ [记录] → 输入吃了什么 → AI分析 → 显示营养 → (结束)
```

## 技术实现

### 1. 后端：Netlify Function

**文件路径:** `netlify/functions/analyze-nutrition.js`

```javascript
const fetch = require('node-fetch');

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

    if (!foodDescription || foodDescription.trim().length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '请输入食物描述' })
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

    const geminiData = await geminiResponse.json();
    
    // 解析 Gemini 返回的内容
    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!responseText) {
      throw new Error('Gemini API 返回格式错误');
    }

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
```

### 2. 前端：UI 组件实现

#### 2.1 营养记录提示组件

**建议位置:** 在用户点击"就吃它!"后显示

```javascript
// NutritionPrompt.jsx (或你的组件格式)
function NutritionPrompt({ restaurantName, onSkip, onRecord }) {
  return (
    <div className="nutrition-prompt">
      <h3>要记录这餐的营养吗？</h3>
      <p className="restaurant-name">{restaurantName}</p>
      <div className="actions">
        <button onClick={onSkip} className="btn-secondary">
          跳过
        </button>
        <button onClick={onRecord} className="btn-primary">
          记录营养
        </button>
      </div>
    </div>
  );
}
```

#### 2.2 营养输入组件

```javascript
// NutritionInput.jsx
function NutritionInput({ restaurantName, onAnalyze, onCancel }) {
  const [foodInput, setFoodInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!foodInput.trim()) {
      alert('请输入你吃了什么');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/.netlify/functions/analyze-nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          foodDescription: `在${restaurantName}吃了：${foodInput}` 
        })
      });

      const result = await response.json();
      
      if (result.success) {
        onAnalyze(result.data);
      } else {
        alert(result.error || '分析失败，请重试');
      }
    } catch (error) {
      alert('网络错误，请检查连接');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nutrition-input">
      <h3>你吃了什么？</h3>
      <p className="hint">简单描述即可，例如：牛肉拉面、加蛋、小菜</p>
      
      <textarea
        value={foodInput}
        onChange={(e) => setFoodInput(e.target.value)}
        placeholder="输入你吃的食物..."
        rows="3"
      />

      <div className="actions">
        <button onClick={onCancel} className="btn-secondary" disabled={loading}>
          取消
        </button>
        <button onClick={handleSubmit} className="btn-primary" disabled={loading}>
          {loading ? '分析中...' : '分析营养'}
        </button>
      </div>
    </div>
  );
}
```

#### 2.3 营养结果显示组件

```javascript
// NutritionResult.jsx
function NutritionResult({ data, onClose }) {
  return (
    <div className="nutrition-result">
      <h3>营养分析结果</h3>
      <p className="disclaimer">* 仅供参考，基于AI粗略估算</p>
      
      <div className="nutrition-grid">
        <div className="nutrition-item">
          <span className="value">{data.calories}</span>
          <span className="label">千卡</span>
        </div>
        <div className="nutrition-item">
          <span className="value">{data.protein}g</span>
          <span className="label">蛋白质</span>
        </div>
        <div className="nutrition-item">
          <span className="value">{data.carbs}g</span>
          <span className="label">碳水</span>
        </div>
        <div className="nutrition-item">
          <span className="value">{data.fat}g</span>
          <span className="label">脂肪</span>
        </div>
      </div>

      {data.note && (
        <div className="nutrition-note">
          💡 {data.note}
        </div>
      )}

      <button onClick={onClose} className="btn-primary">
        完成
      </button>
    </div>
  );
}
```

### 3. 数据存储（本地）

```javascript
// nutritionStorage.js
const STORAGE_KEY = 'gimmefood_nutrition_history';

export function saveNutritionRecord(record) {
  const history = getNutritionHistory();
  history.push({
    ...record,
    timestamp: new Date().toISOString(),
    date: new Date().toLocaleDateString('zh-CN')
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function getNutritionHistory() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function getTodayNutrition() {
  const today = new Date().toLocaleDateString('zh-CN');
  const history = getNutritionHistory();
  return history.filter(record => record.date === today);
}

export function getTodayTotal() {
  const todayRecords = getTodayNutrition();
  return todayRecords.reduce((total, record) => ({
    calories: total.calories + (record.calories || 0),
    protein: total.protein + (record.protein || 0),
    carbs: total.carbs + (record.carbs || 0),
    fat: total.fat + (record.fat || 0)
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
}
```

### 4. 主流程集成示例

```javascript
// 在推荐结果页面
function RecommendationPage({ restaurant, mealType }) {
  const [step, setStep] = useState('recommendation'); // recommendation | prompt | input | result
  const [nutritionData, setNutritionData] = useState(null);

  const handleAccept = () => {
    // 用户点击"就吃它!"
    setStep('prompt'); // 显示营养记录提示
  };

  const handleSkipNutrition = () => {
    // 用户跳过营养记录
    // 可以记录用户选择了这个餐厅（用于反馈系统）
    setStep('recommendation');
    // 返回主页或显示完成
  };

  const handleRecordNutrition = () => {
    setStep('input'); // 显示输入界面
  };

  const handleAnalyzeComplete = (data) => {
    setNutritionData(data);
    // 保存到本地存储
    saveNutritionRecord({
      restaurant: restaurant.name,
      mealType,
      ...data
    });
    setStep('result'); // 显示结果
  };

  return (
    <div>
      {step === 'recommendation' && (
        <div>
          <h2>推荐: {restaurant.name}</h2>
          <button onClick={handleAccept}>就吃它!</button>
        </div>
      )}

      {step === 'prompt' && (
        <NutritionPrompt
          restaurantName={restaurant.name}
          onSkip={handleSkipNutrition}
          onRecord={handleRecordNutrition}
        />
      )}

      {step === 'input' && (
        <NutritionInput
          restaurantName={restaurant.name}
          onAnalyze={handleAnalyzeComplete}
          onCancel={handleSkipNutrition}
        />
      )}

      {step === 'result' && (
        <NutritionResult
          data={nutritionData}
          onClose={() => {/* 返回主页 */}}
        />
      )}
    </div>
  );
}
```

## 部署配置

### 1. Netlify 环境变量设置

1. 登录 Netlify Dashboard
2. 选择你的项目
3. 进入 **Site settings** → **Environment variables**
4. 添加变量:
   - **Key:** `GEMINI_API_KEY`
   - **Value:** (你的 Gemini API Key)

### 2. 获取 Gemini API Key

1. 访问: https://aistudio.google.com/app/apikey
2. 点击 "Create API Key"
3. 选择项目或创建新项目
4. 复制生成的 API Key

### 3. 本地开发测试

创建 `.env` 文件：
```
GEMINI_API_KEY=your_api_key_here
```

安装 Netlify CLI:
```bash
npm install -g netlify-cli
```

本地运行:
```bash
netlify dev
```

## 样式建议（CSS 参考）

```css
/* 营养提示 */
.nutrition-prompt {
  text-align: center;
  padding: 2rem;
}

.nutrition-prompt .restaurant-name {
  font-size: 1.2rem;
  font-weight: bold;
  margin: 1rem 0;
}

/* 营养输入 */
.nutrition-input textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  margin: 1rem 0;
}

.nutrition-input .hint {
  color: #666;
  font-size: 0.9rem;
}

/* 营养结果 */
.nutrition-result .disclaimer {
  color: #999;
  font-size: 0.85rem;
  margin-bottom: 1rem;
}

.nutrition-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin: 1.5rem 0;
}

.nutrition-item {
  text-align: center;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
}

.nutrition-item .value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

.nutrition-item .label {
  display: block;
  font-size: 0.9rem;
  color: #666;
  margin-top: 0.25rem;
}

.nutrition-note {
  background: #e3f2fd;
  padding: 0.75rem;
  border-radius: 8px;
  margin: 1rem 0;
}

/* 按钮 */
.actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.actions button {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
}

.btn-primary {
  background: #1976d2;
  color: white;
}

.btn-secondary {
  background: #e0e0e0;
  color: #333;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

## 测试清单

### 功能测试
- [ ] 用户可以跳过营养记录
- [ ] 输入食物后正确调用 API
- [ ] 显示营养分析结果
- [ ] 数据保存到本地存储
- [ ] 错误处理正常（网络错误、API错误）

### 用户体验测试
- [ ] 流程流畅，无卡顿
- [ ] 文案清晰易懂
- [ ] "跳过"按钮容易找到
- [ ] 加载状态明确显示

### API 测试
- [ ] Netlify Function 部署成功
- [ ] 环境变量配置正确
- [ ] Gemini API 返回格式正确
- [ ] 错误情况处理完善

## 监控与优化

### 使用量监控
- Netlify Dashboard: 查看 Function 调用次数
- Google Cloud Console: 查看 Gemini API 用量

### 优化方向（未来）
1. 缓存常见食物的营养数据
2. 批量分析（一次输入多餐）
3. 营养目标设定
4. 每日/每周营养报告

## 预期效果

- **开发时间:** 2-3天
- **成本:** 完全免费
- **用户价值:** 提升使用频率，从"选择工具"到"饮食管理助手"
- **数据收集:** 为未来 B/C 方案（智能推荐、自动标签）积累数据