// 营养记录提示组件
// 在用户接受推荐后显示，询问是否要记录营养

import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Sparkles } from 'lucide-react';
import { useApp } from '../hooks/useApp.js';
import { Button } from './ui/Button.jsx';
import { Card } from './ui/Card.jsx';

export function NutritionPrompt() {
  const { state, dispatch, ActionTypes } = useApp();
  const { selectedRestaurant } = state.currentFlow;

  const handleSkip = () => {
    // 跳过营养记录，返回主界面
    dispatch({ type: ActionTypes.RESET_SELECTION_FLOW });
  };

  const handleRecord = () => {
    // 进入营养输入界面
    dispatch({ type: ActionTypes.SET_FLOW_STEP, payload: 'nutrition_input' });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full"
      >
        <Card className="p-8">
          {/* 图标和标题 */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
              className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4"
            >
              <Sparkles className="text-accent" size={32} />
            </motion.div>
            <h2 className="text-section font-semibold mb-2">
              要记录这餐的营养吗？
            </h2>
            <p className="text-caption text-secondary">
              可选功能，不影响正常使用
            </p>
          </div>

          {/* 餐厅信息 */}
          {selectedRestaurant && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-muted rounded-xl p-4 mb-6"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center">
                  <Sparkles size={20} className="text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="text-body font-medium">
                    {selectedRestaurant.name}
                  </h3>
                  <p className="text-caption text-secondary">
                    记录营养成分，追踪每日摄入
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* 功能说明 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-muted rounded-lg p-4 mb-6"
          >
            <div className="flex items-start gap-2">
              <Lightbulb size={16} className="text-accent mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-body mb-1">
                  <strong>AI营养分析</strong>
                </p>
                <p className="text-caption text-secondary">
                  通过简单描述你吃了什么，AI会估算卡路里、蛋白质、碳水和脂肪
                </p>
                <p className="text-caption text-secondary mt-1">
                  * 仅供参考，基于粗略估算
                </p>
              </div>
            </div>
          </motion.div>

          {/* 行动按钮 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            <Button
              variant="primary"
              size="large"
              onClick={handleRecord}
              className="w-full"
            >
              <Sparkles size={20} />
              <span>记录营养</span>
            </Button>

            <Button
              variant="secondary"
              onClick={handleSkip}
              className="w-full"
            >
              跳过，下次再说
            </Button>
          </motion.div>

          {/* 底部提示 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center"
          >
            <p className="text-caption text-secondary">
              营养数据仅保存在本地，不会上传到服务器
            </p>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
}
