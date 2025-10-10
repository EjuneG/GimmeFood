// 营养追踪专用页面 - Minimalist redesign
// Clean data visualization with monochrome progress bars

import React from 'react';
import { Calendar, Lightbulb } from 'lucide-react';
import { useApp } from '../hooks/useApp.js';
import { NutritionGoalCard } from './NutritionGoalCard.jsx';
import { Card } from './ui/Card.jsx';

export function NutritionDashboard() {
  const { state } = useApp();
  const hasGoal = state.nutritionGoal !== null;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-surface border-b border-divider px-6 pt-12 pb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-title font-semibold mb-2">营养追踪</h1>
            <p className="text-caption text-secondary">
              {hasGoal ? '记录你的每日营养摄入' : '设置目标，开始追踪'}
            </p>
          </div>
          <button
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="查看日历"
          >
            <Calendar size={20} className="text-secondary" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-4 pt-6 space-y-4">
        {/* Nutrition Goal Card */}
        <NutritionGoalCard />

        {/* Info Card with advice */}
        <Card className="border-l-4 border-l-accent">
          <div className="flex gap-3">
            <Lightbulb size={20} className="text-accent flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <h3 className="text-body font-semibold mb-1">如何记录营养？</h3>
              <ul className="text-caption text-secondary space-y-2">
                <li className="flex items-start">
                  <span className="text-accent mr-2" aria-hidden="true">•</span>
                  <span>使用"给我食物"魔法按钮后，可选择记录营养</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2" aria-hidden="true">•</span>
                  <span>手动选择餐厅，直接记录吃过的食物</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2" aria-hidden="true">•</span>
                  <span>使用"自己做饭"记录家常菜营养</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        {hasGoal && (
          <div className="bg-muted rounded-2xl p-4 border border-divider">
            <h3 className="font-semibold text-body mb-3">快速操作</h3>
            <div className="text-caption text-secondary space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-primary">📈</span>
                <span>本周营养统计：展开营养卡片查看</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">📅</span>
                <span>切换日期：使用今天/昨天切换按钮</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">⚙️</span>
                <span>调整目标：点击"调整目标"按钮</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
