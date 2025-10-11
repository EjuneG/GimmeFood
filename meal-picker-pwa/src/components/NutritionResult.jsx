// 营养结果显示组件
// 显示AI分析的营养成分并保存到本地

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronRight, Sparkles } from 'lucide-react';
import { useApp } from '../hooks/useApp.js';
import { saveNutritionRecord, getTodayTotal } from '../utils/nutritionStorage.js';
import { Button } from './ui/Button.jsx';
import { Card } from './ui/Card.jsx';

export function NutritionResult() {
  const { state, dispatch, ActionTypes } = useApp();
  const { currentAnalysis } = state.nutrition;

  // 保存营养记录到本地存储（自动使用day boundary逻辑）
  useEffect(() => {
    if (currentAnalysis) {
      saveNutritionRecord({
        restaurant: currentAnalysis.restaurant,
        mealType: currentAnalysis.mealType,
        foodDescription: currentAnalysis.foodDescription,
        calories: currentAnalysis.calories,
        protein: currentAnalysis.protein,
        carbs: currentAnalysis.carbs,
        fat: currentAnalysis.fat,
        note: currentAnalysis.note
      });
    }
  }, [currentAnalysis]);

  const handleClose = () => {
    // 清除营养数据，返回主界面
    dispatch({ type: ActionTypes.RESET_SELECTION_FLOW });
  };

  const handleViewHistory = () => {
    // 未来功能：查看营养历史
    // 暂时显示今日总计
    const todayTotal = getTodayTotal();
    alert(`今日总计：
卡路里: ${todayTotal.calories} 千卡
蛋白质: ${todayTotal.protein}g
碳水: ${todayTotal.carbs}g
脂肪: ${todayTotal.fat}g`);
  };

  if (!currentAnalysis) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="text-center p-8">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles size={32} className="text-secondary" aria-hidden="true" />
          </div>
          <h3 className="font-semibold text-body mb-2">没有找到分析结果</h3>
          <p className="text-caption text-secondary mb-4">
            请返回重新分析
          </p>
          <Button variant="primary" onClick={handleClose}>
            返回主页
          </Button>
        </Card>
      </div>
    );
  }

  const nutritionData = [
    { label: '热量', value: currentAnalysis.calories, unit: '千卡', key: 'calories' },
    { label: '蛋白质', value: currentAnalysis.protein, unit: 'g', key: 'protein' },
    { label: '碳水', value: currentAnalysis.carbs, unit: 'g', key: 'carbs' },
    { label: '脂肪', value: currentAnalysis.fat, unit: 'g', key: 'fat' }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header with success animation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-surface border-b border-divider px-6 pt-12 pb-8"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.2 }}
            className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4"
          >
            <Check className="text-accent" size={32} />
          </motion.div>
          <h1 className="text-title font-semibold mb-2">营养分析完成！</h1>
          <p className="text-caption text-secondary">
            * 仅供参考，基于AI粗略估算
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="px-4 pt-6 space-y-4"
      >
        {/* 餐厅和食物描述 */}
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <Sparkles size={20} className="text-secondary" />
            </div>
            <div className="flex-1">
              <h3 className="text-body font-semibold mb-1">
                {currentAnalysis.restaurant}
              </h3>
              <p className="text-body text-primary">
                {currentAnalysis.foodDescription}
              </p>
            </div>
          </div>
        </Card>

        {/* 营养成分网格 */}
        <div className="grid grid-cols-2 gap-3">
          {nutritionData.map((item, index) => (
            <motion.div
              key={item.key}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 20,
                delay: 0.2 + index * 0.05
              }}
            >
              <Card className="p-4">
                <div className="text-center">
                  <motion.div
                    key={item.value}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-2xl font-bold text-primary mb-1 tabular-nums"
                  >
                    {item.value}
                  </motion.div>
                  <div className="text-caption text-secondary font-medium">
                    {item.unit}
                  </div>
                  <div className="text-caption text-secondary mt-1">
                    {item.label}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* 营养提示 */}
        {currentAnalysis.note && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-4 bg-muted border-divider">
              <div className="flex items-start gap-2">
                <Sparkles size={16} className="text-accent mt-0.5 flex-shrink-0" />
                <p className="text-body text-primary flex-1">
                  {currentAnalysis.note}
                </p>
              </div>
            </Card>
          </motion.div>
        )}

        {/* 今日统计预览 */}
        <Card className="p-4">
          <button
            onClick={handleViewHistory}
            className="flex items-center justify-between w-full hover:bg-muted -m-4 p-4 rounded-2xl transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <Check size={16} className="text-secondary" />
              </div>
              <span className="text-body text-primary">
                已记录到今日数据
              </span>
            </div>
            <ChevronRight size={16} className="text-secondary" />
          </button>
        </Card>

        {/* 行动按钮 */}
        <Button
          variant="primary"
          size="large"
          onClick={handleClose}
          className="w-full"
        >
          <Check size={20} />
          <span>完成</span>
        </Button>

        {/* 底部提示 */}
        <div className="text-center pt-2">
          <p className="text-caption text-secondary">
            数据已保存到本地，仅在你的设备上
          </p>
        </div>
      </motion.div>
    </div>
  );
}
