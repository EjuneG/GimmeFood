// 营养目标设置组件
// 提供手动设置和AI建议两种模式

import React, { useState } from 'react';
import { useApp } from '../hooks/useApp.js';
import { callServerlessFunction } from '../utils/apiEndpoints.js';

export function NutritionGoalSetup() {
  const { dispatch, ActionTypes } = useApp();
  const [mode, setMode] = useState('ai'); // 'manual' or 'ai'

  // 手动设置模式的状态
  const [manualGoal, setManualGoal] = useState({
    calories: '',
    protein: '',
    carbs: '',
    fat: ''
  });

  // AI设置模式的状态
  const [aiInputs, setAiInputs] = useState({
    weight: '',
    height: '',
    goalType: 'maintain'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCancel = () => {
    dispatch({ type: ActionTypes.SET_FLOW_STEP, payload: 'main' });
  };

  const handleManualSubmit = () => {
    const calories = parseInt(manualGoal.calories);
    const protein = parseInt(manualGoal.protein);
    const carbs = parseInt(manualGoal.carbs);
    const fat = parseInt(manualGoal.fat);

    if (!calories || calories <= 0) {
      setError('请输入有效的卡路里目标');
      return;
    }
    if (protein < 0 || carbs < 0 || fat < 0) {
      setError('营养素不能为负数');
      return;
    }

    // 保存目标
    dispatch({
      type: ActionTypes.SET_NUTRITION_GOAL,
      payload: {
        calories,
        protein,
        carbs,
        fat,
        note: '手动设置的目标',
        updatedAt: new Date().toISOString()
      }
    });

    // 返回主界面
    dispatch({ type: ActionTypes.SET_FLOW_STEP, payload: 'main' });
  };

  const handleAiSubmit = async () => {
    const weight = parseFloat(aiInputs.weight);
    const height = parseFloat(aiInputs.height);

    if (!weight || weight <= 0 || weight > 500) {
      setError('请输入有效的体重 (1-500 kg)');
      return;
    }
    if (!height || height <= 0 || height > 300) {
      setError('请输入有效的身高 (1-300 cm)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 调用 API (自动检测 Netlify/Vercel)
      const response = await callServerlessFunction('generate-nutrition-goal', {
        weight,
        height,
        goalType: aiInputs.goalType
      });

      const result = await response.json();

      if (result.success) {
        // 保存AI生成的目标
        dispatch({
          type: ActionTypes.SET_NUTRITION_GOAL,
          payload: {
            ...result.data,
            updatedAt: new Date().toISOString()
          }
        });

        // 返回主界面
        dispatch({ type: ActionTypes.SET_FLOW_STEP, payload: 'main' });
      } else {
        setError(result.error || 'AI生成失败，请重试');
      }
    } catch (err) {
      console.error('AI goal generation error:', err);
      setError('网络错误，请检查连接');
    } finally {
      setLoading(false);
    }
  };

  const goalTypeOptions = [
    { value: 'weight_loss', label: '减脂', emoji: '🔥' },
    { value: 'muscle_gain', label: '增肌', emoji: '💪' },
    { value: 'maintain', label: '保持体重', emoji: '⚖️' },
    { value: 'general_health', label: '一般健康', emoji: '🌟' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-4">
      <div className="max-w-md mx-auto pt-8 pb-20">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* 标题 */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
            <div className="text-center">
              <div className="text-4xl mb-3">🎯</div>
              <h2 className="text-2xl font-bold mb-2">设置营养目标</h2>
              <p className="text-indigo-100 text-sm">
                选择适合你的方式
              </p>
            </div>
          </div>

          {/* 模式切换标签 */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setMode('ai')}
              className={`flex-1 py-4 px-4 font-medium transition-colors ${
                mode === 'ai'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg mr-2">🤖</span>
              AI建议
            </button>
            <button
              onClick={() => setMode('manual')}
              className={`flex-1 py-4 px-4 font-medium transition-colors ${
                mode === 'manual'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg mr-2">✍️</span>
              手动设置
            </button>
          </div>

          <div className="p-6">
            {/* AI模式 */}
            {mode === 'ai' && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-700">
                    💡 输入你的基本信息，AI会根据你的目标生成个性化营养建议
                  </p>
                </div>

                {/* 体重输入 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    体重 (kg)
                  </label>
                  <input
                    type="number"
                    value={aiInputs.weight}
                    onChange={(e) => setAiInputs({ ...aiInputs, weight: e.target.value })}
                    placeholder="例如：70"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none"
                    disabled={loading}
                  />
                </div>

                {/* 身高输入 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    身高 (cm)
                  </label>
                  <input
                    type="number"
                    value={aiInputs.height}
                    onChange={(e) => setAiInputs({ ...aiInputs, height: e.target.value })}
                    placeholder="例如：170"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none"
                    disabled={loading}
                  />
                </div>

                {/* 目标类型选择 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    你的目标
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {goalTypeOptions.map(option => (
                      <button
                        key={option.value}
                        onClick={() => setAiInputs({ ...aiInputs, goalType: option.value })}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          aiInputs.goalType === option.value
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        disabled={loading}
                      >
                        <div className="text-2xl mb-1">{option.emoji}</div>
                        <div className="text-sm font-medium">{option.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 错误提示 */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">❌ {error}</p>
                  </div>
                )}

                {/* 提交按钮 */}
                <button
                  onClick={handleAiSubmit}
                  disabled={loading}
                  className="w-full py-4 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-indigo-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <span className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>AI生成中...</span>
                    </span>
                  ) : (
                    '生成营养目标 🚀'
                  )}
                </button>
              </div>
            )}

            {/* 手动模式 */}
            {mode === 'manual' && (
              <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-700">
                    ✍️ 根据你的了解，直接输入每日营养目标
                  </p>
                </div>

                {/* 卡路里 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    每日卡路里目标 (千卡) *
                  </label>
                  <input
                    type="number"
                    value={manualGoal.calories}
                    onChange={(e) => setManualGoal({ ...manualGoal, calories: e.target.value })}
                    placeholder="例如：2000"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                  />
                </div>

                {/* 蛋白质 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    蛋白质 (克)
                  </label>
                  <input
                    type="number"
                    value={manualGoal.protein}
                    onChange={(e) => setManualGoal({ ...manualGoal, protein: e.target.value })}
                    placeholder="例如：100"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                  />
                </div>

                {/* 碳水化合物 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    碳水化合物 (克)
                  </label>
                  <input
                    type="number"
                    value={manualGoal.carbs}
                    onChange={(e) => setManualGoal({ ...manualGoal, carbs: e.target.value })}
                    placeholder="例如：250"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                  />
                </div>

                {/* 脂肪 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    脂肪 (克)
                  </label>
                  <input
                    type="number"
                    value={manualGoal.fat}
                    onChange={(e) => setManualGoal({ ...manualGoal, fat: e.target.value })}
                    placeholder="例如：65"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                  />
                </div>

                {/* 错误提示 */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">❌ {error}</p>
                  </div>
                )}

                {/* 提交按钮 */}
                <button
                  onClick={handleManualSubmit}
                  className="w-full py-4 px-6 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  保存目标 ✅
                </button>
              </div>
            )}

            {/* 取消按钮 */}
            <button
              onClick={handleCancel}
              className="w-full mt-4 py-3 px-4 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
