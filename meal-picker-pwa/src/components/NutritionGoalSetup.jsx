// 营养目标设置组件
// 提供手动设置和AI建议两种模式

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Flame, Dumbbell, Scale, Sparkles, ArrowLeft, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../hooks/useApp.js';
import { callServerlessFunction } from '../utils/apiEndpoints.js';
import { getDayBoundaryHour, setDayBoundaryHour } from '../utils/nutritionSettings.js';
import { Button } from './ui/Button.jsx';
import { Card } from './ui/Card.jsx';
import { cn } from '../utils/cn.js';

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

  // 高级设置
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dayBoundary, setDayBoundary] = useState(4);

  // 加载当前的day boundary设置
  useEffect(() => {
    const currentBoundary = getDayBoundaryHour();
    setDayBoundary(currentBoundary);
  }, []);

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

    // 保存day boundary设置
    setDayBoundaryHour(dayBoundary);

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
        // 保存day boundary设置
        setDayBoundaryHour(dayBoundary);

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
    { value: 'weight_loss', label: '减脂', Icon: Flame },
    { value: 'muscle_gain', label: '增肌', Icon: Dumbbell },
    { value: 'maintain', label: '保持体重', Icon: Scale },
    { value: 'general_health', label: '一般健康', Icon: Sparkles }
  ];

  const getDayBoundaryDescription = (hour) => {
    if (hour === 0) return '午夜12点 - 标准日期边界';
    if (hour > 0 && hour < 6) return `凌晨${hour}点 - 适合夜猫子 🦉`;
    if (hour >= 6 && hour < 12) return `早上${hour}点 - 适合早起者 🌅`;
    if (hour >= 12 && hour < 18) return `下午${hour - 12}点`;
    return `晚上${hour - 12}点`;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-surface border-b border-divider px-6 pt-12 pb-8">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="返回"
          >
            <ArrowLeft size={20} className="text-secondary" />
          </button>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
            <Target size={24} className="text-accent" />
          </div>
          <h1 className="text-title font-semibold mb-2">设置营养目标</h1>
          <p className="text-caption text-secondary">
            选择适合你的方式
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="px-4 pt-6"
      >
        {/* 模式切换标签 */}
        <Card className="p-1 mb-4">
          <div className="flex gap-1">
            <button
              onClick={() => setMode('ai')}
              className={cn(
                "flex-1 py-3 px-4 rounded-lg font-medium transition-all text-body",
                mode === 'ai'
                  ? 'bg-accent text-white'
                  : 'text-secondary hover:bg-muted'
              )}
            >
              <Sparkles size={16} className="inline mr-2" />
              AI建议
            </button>
            <button
              onClick={() => setMode('manual')}
              className={cn(
                "flex-1 py-3 px-4 rounded-lg font-medium transition-all text-body",
                mode === 'manual'
                  ? 'bg-accent text-white'
                  : 'text-secondary hover:bg-muted'
              )}
            >
              <Target size={16} className="inline mr-2" />
              手动设置
            </button>
          </div>
        </Card>

        <AnimatePresence mode="wait">
          {/* AI模式 */}
          {mode === 'ai' && (
            <motion.div
              key="ai-mode"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <Card className="p-4 bg-muted">
                <div className="flex items-start gap-2">
                  <Sparkles size={16} className="text-accent mt-0.5 flex-shrink-0" />
                  <p className="text-body text-primary">
                    输入你的基本信息，AI会根据你的目标生成个性化营养建议
                  </p>
                </div>
              </Card>

              <Card className="p-6 space-y-4">
                {/* 体重输入 */}
                <div>
                  <label htmlFor="ai-weight" className="block text-body font-medium mb-2">
                    体重 (kg)<span className="text-accent">*</span>
                  </label>
                  <input
                    id="ai-weight"
                    type="number"
                    inputMode="decimal"
                    value={aiInputs.weight}
                    onChange={(e) => setAiInputs({ ...aiInputs, weight: e.target.value })}
                    placeholder="例如：70"
                    className="w-full px-4 py-3 border-2 border-divider rounded-xl
                      focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent
                      transition-all text-body"
                    disabled={loading}
                  />
                </div>

                {/* 身高输入 */}
                <div>
                  <label htmlFor="ai-height" className="block text-body font-medium mb-2">
                    身高 (cm)<span className="text-accent">*</span>
                  </label>
                  <input
                    id="ai-height"
                    type="number"
                    inputMode="decimal"
                    value={aiInputs.height}
                    onChange={(e) => setAiInputs({ ...aiInputs, height: e.target.value })}
                    placeholder="例如：170"
                    className="w-full px-4 py-3 border-2 border-divider rounded-xl
                      focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent
                      transition-all text-body"
                    disabled={loading}
                  />
                </div>

                {/* 目标类型选择 */}
                <div>
                  <label className="block text-body font-medium mb-3">
                    你的目标<span className="text-accent">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {goalTypeOptions.map(option => {
                      const isSelected = aiInputs.goalType === option.value;
                      const Icon = option.Icon;
                      return (
                        <button
                          key={option.value}
                          onClick={() => setAiInputs({ ...aiInputs, goalType: option.value })}
                          className={cn(
                            "p-4 rounded-xl transition-all duration-base",
                            "flex flex-col items-center justify-center gap-2",
                            isSelected
                              ? 'bg-accent text-white shadow-md'
                              : 'bg-muted text-secondary hover:bg-divider hover:text-primary border border-divider'
                          )}
                          disabled={loading}
                          aria-pressed={isSelected}
                        >
                          <Icon size={24} />
                          <span className="text-body font-medium">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </Card>

              {/* 错误提示 */}
              {error && (
                <Card className="p-4 bg-accent/10 border-accent">
                  <p className="text-body text-accent" role="alert">
                    {error}
                  </p>
                </Card>
              )}

              {/* 提交按钮 */}
              <Button
                variant="primary"
                size="large"
                onClick={handleAiSubmit}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, ease: "linear", repeat: Infinity }}
                    >
                      <Sparkles size={20} />
                    </motion.div>
                    <span>AI生成中...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    <span>生成营养目标</span>
                  </>
                )}
              </Button>
            </motion.div>
          )}

          {/* 手动模式 */}
          {mode === 'manual' && (
            <motion.div
              key="manual-mode"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <Card className="p-4 bg-muted">
                <div className="flex items-start gap-2">
                  <Target size={16} className="text-accent mt-0.5 flex-shrink-0" />
                  <p className="text-body text-primary">
                    根据你的了解，直接输入每日营养目标
                  </p>
                </div>
              </Card>

              <Card className="p-6 space-y-4">
                {/* 卡路里 */}
                <div>
                  <label htmlFor="manual-calories" className="block text-body font-medium mb-2">
                    每日卡路里目标 (千卡)<span className="text-accent">*</span>
                  </label>
                  <input
                    id="manual-calories"
                    type="number"
                    inputMode="decimal"
                    value={manualGoal.calories}
                    onChange={(e) => setManualGoal({ ...manualGoal, calories: e.target.value })}
                    placeholder="例如：2000"
                    className="w-full px-4 py-3 border-2 border-divider rounded-xl
                      focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent
                      transition-all text-body"
                  />
                </div>

                {/* 蛋白质 */}
                <div>
                  <label htmlFor="manual-protein" className="block text-body font-medium mb-2">
                    蛋白质 (克)
                  </label>
                  <input
                    id="manual-protein"
                    type="number"
                    inputMode="decimal"
                    value={manualGoal.protein}
                    onChange={(e) => setManualGoal({ ...manualGoal, protein: e.target.value })}
                    placeholder="例如：100"
                    className="w-full px-4 py-3 border-2 border-divider rounded-xl
                      focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent
                      transition-all text-body"
                  />
                </div>

                {/* 碳水化合物 */}
                <div>
                  <label htmlFor="manual-carbs" className="block text-body font-medium mb-2">
                    碳水化合物 (克)
                  </label>
                  <input
                    id="manual-carbs"
                    type="number"
                    inputMode="decimal"
                    value={manualGoal.carbs}
                    onChange={(e) => setManualGoal({ ...manualGoal, carbs: e.target.value })}
                    placeholder="例如：250"
                    className="w-full px-4 py-3 border-2 border-divider rounded-xl
                      focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent
                      transition-all text-body"
                  />
                </div>

                {/* 脂肪 */}
                <div>
                  <label htmlFor="manual-fat" className="block text-body font-medium mb-2">
                    脂肪 (克)
                  </label>
                  <input
                    id="manual-fat"
                    type="number"
                    inputMode="decimal"
                    value={manualGoal.fat}
                    onChange={(e) => setManualGoal({ ...manualGoal, fat: e.target.value })}
                    placeholder="例如：65"
                    className="w-full px-4 py-3 border-2 border-divider rounded-xl
                      focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent
                      transition-all text-body"
                  />
                </div>
              </Card>

              {/* 错误提示 */}
              {error && (
                <Card className="p-4 bg-accent/10 border-accent">
                  <p className="text-body text-accent" role="alert">
                    {error}
                  </p>
                </Card>
              )}

              {/* 提交按钮 */}
              <Button
                variant="primary"
                size="large"
                onClick={handleManualSubmit}
                className="w-full"
              >
                <Check size={20} />
                <span>保存目标</span>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 高级设置 */}
        <Card className="p-4 mt-4">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between text-body font-medium hover:text-primary transition-colors"
          >
            <span className="text-secondary">高级设置</span>
            {showAdvanced ? (
              <ChevronUp size={20} className="text-secondary" />
            ) : (
              <ChevronDown size={20} className="text-secondary" />
            )}
          </button>

          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.4, 0.0, 0.6, 1] }}
                className="overflow-hidden"
              >
                <div className="pt-4 space-y-4">
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-caption text-secondary">
                      🌙 <strong>营养日边界时间：</strong>
                      设置一天的"结束"时间。例如设置为凌晨4点，那么凌晨2点吃的食物会被算作"昨天"。
                    </p>
                  </div>

                  <div>
                    <label className="block text-body font-medium mb-3">
                      新一天开始时间
                    </label>
                    <div className="flex items-center gap-3 mb-2">
                      <input
                        type="range"
                        min="0"
                        max="23"
                        value={dayBoundary}
                        onChange={(e) => setDayBoundary(parseInt(e.target.value))}
                        className="flex-1 h-2 bg-divider rounded-lg appearance-none cursor-pointer
                          [&::-webkit-slider-thumb]:appearance-none
                          [&::-webkit-slider-thumb]:w-5
                          [&::-webkit-slider-thumb]:h-5
                          [&::-webkit-slider-thumb]:rounded-full
                          [&::-webkit-slider-thumb]:bg-accent
                          [&::-webkit-slider-thumb]:cursor-pointer"
                      />
                      <div className="flex items-center justify-center min-w-[4rem] py-2 px-3 bg-accent text-white rounded-lg font-bold tabular-nums">
                        {dayBoundary}:00
                      </div>
                    </div>
                    <p className="text-caption text-secondary">
                      {getDayBoundaryDescription(dayBoundary)}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* 取消按钮 */}
        <Button
          variant="secondary"
          onClick={handleCancel}
          className="w-full mt-4"
        >
          取消
        </Button>
      </motion.div>
    </div>
  );
}
