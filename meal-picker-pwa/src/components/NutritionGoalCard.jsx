// 营养目标卡片组件 - Minimalist redesign
// Displays nutrition goals with clean progress bars and monochrome aesthetic

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../hooks/useApp.js';
import { getTodayTotal } from '../utils/nutritionStorage.js';
import { calculateProgress, getProgressStatus } from '../utils/nutritionGoalStorage.js';
import { WeeklyNutritionView } from './WeeklyNutritionView.jsx';
import { Card } from './ui/Card.jsx';
import { Button } from './ui/Button.jsx';
import { ProgressBar } from './ui/ProgressBar.jsx';

export function NutritionGoalCard() {
  const { state, dispatch, ActionTypes } = useApp();
  const hasGoal = state.nutritionGoal !== null;
  const [showWeekly, setShowWeekly] = useState(false);

  // Get today's data (with 4AM boundary applied automatically)
  const todayTotal = getTodayTotal();

  const handleSetupGoal = () => {
    dispatch({ type: ActionTypes.SET_FLOW_STEP, payload: 'nutrition_goal_setup' });
  };

  // 如果没有设置目标，显示设置按钮
  if (!hasGoal) {
    return (
      <Card className="text-center">
        <div className="py-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Target size={32} className="text-secondary" aria-hidden="true" />
          </div>
          <h3 className="font-semibold text-body mb-2">设置营养目标</h3>
          <p className="text-caption text-secondary mb-4">
            追踪每日摄入，掌控健康饮食
          </p>
          <Button variant="primary" onClick={handleSetupGoal}>
            立即设置 →
          </Button>
        </div>
      </Card>
    );
  }

  // 如果有目标，显示进度
  const goal = state.nutritionGoal;

  const nutrients = [
    {
      name: '热量',
      current: todayTotal.calories,
      target: goal.calories,
      unit: '千卡'
    },
    {
      name: '蛋白质',
      current: todayTotal.protein,
      target: goal.protein,
      unit: 'g'
    },
    {
      name: '碳水',
      current: todayTotal.carbs,
      target: goal.carbs,
      unit: 'g'
    },
    {
      name: '脂肪',
      current: todayTotal.fat,
      target: goal.fat,
      unit: 'g'
    }
  ];

  return (
    <Card className="p-0 overflow-hidden">
      {/* 标题栏 */}
      <div className="p-4 border-b border-divider">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-body mb-1">今日营养</h3>
            <p className="text-caption text-secondary">目标追踪</p>
          </div>
          <button
            onClick={handleSetupGoal}
            className="text-caption text-accent hover:text-accent-dark font-medium transition-colors"
            aria-label="调整营养目标"
          >
            调整目标
          </button>
        </div>
      </div>

      {/* Daily progress bars */}
      <div className="p-4">
        <div className="space-y-4">
          {nutrients.map(nutrient => {
            const progress = calculateProgress(nutrient.current, nutrient.target);
            const status = getProgressStatus(progress);

            return (
              <div key={nutrient.name}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-body">{nutrient.name}</span>
                  <motion.span
                    key={nutrient.current}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`text-body font-semibold tabular-nums ${
                      status === 'good' ? 'text-accent' :
                      status === 'low' ? 'text-secondary' :
                      'text-accent-dark'
                    }`}
                  >
                    {nutrient.current}
                  </motion.span>
                </div>

                {/* Progress Bar - monochrome design */}
                <ProgressBar
                  value={nutrient.current}
                  max={nutrient.target}
                  animate={true}
                />

                <div className="text-caption text-secondary mt-1 text-right tabular-nums">
                  / {nutrient.target}{nutrient.unit}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 提示信息 */}
      {goal.note && (
        <div className="px-4 pb-4">
          <div className="bg-muted border-l-4 border-l-accent rounded-lg p-3">
            <p className="text-caption text-secondary">
              💡 {goal.note}
            </p>
          </div>
        </div>
      )}

      {/* 本周统计 (Collapsible) */}
      <div className="border-t border-divider">
        <button
          onClick={() => setShowWeekly(!showWeekly)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted transition-colors"
          aria-expanded={showWeekly}
          aria-label={showWeekly ? "收起本周统计" : "展开本周统计"}
        >
          <span className="text-body font-medium">本周统计</span>
          {showWeekly ? (
            <ChevronUp size={20} className="text-secondary" aria-hidden="true" />
          ) : (
            <ChevronDown size={20} className="text-secondary" aria-hidden="true" />
          )}
        </button>

        {showWeekly && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0.0, 0.6, 1] }}
            className="px-4 pb-4 pt-2 overflow-hidden"
          >
            <WeeklyNutritionView />
          </motion.div>
        )}
      </div>
    </Card>
  );
}
