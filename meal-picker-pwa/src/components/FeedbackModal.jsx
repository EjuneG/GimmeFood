// 餐后反馈弹窗组件

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown, X, Sparkles } from 'lucide-react';
import { useApp } from '../hooks/useApp.js';
import { useSelection } from '../hooks/useSelection.js';
import { MEAL_TYPE_NAMES } from '../utils/storage.js';
import { Button } from './ui/Button.jsx';
import { Card } from './ui/Card.jsx';

export function FeedbackModal() {
  const { state } = useApp();
  const { submitFeedback, skipFeedback } = useSelection();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pendingFeedback = state.pendingFeedback;

  if (!pendingFeedback || !state.ui.showFeedback) {
    return null;
  }

  const handleFeedback = async (isPositive) => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // 模拟网络请求
      submitFeedback(isPositive);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    skipFeedback();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-primary/50 flex items-end sm:items-center justify-center p-4 z-50"
        onClick={handleSkip}
      >
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm"
        >
          <Card className="p-6 relative">
            {/* 头部 */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
                className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4"
              >
                <Sparkles className="text-accent" size={32} />
              </motion.div>
              <h3 className="text-section font-semibold mb-2">
                上次的外卖怎么样？
              </h3>
              <div className="bg-muted rounded-lg p-3 mb-3">
                <p className="text-body font-medium">{pendingFeedback.restaurantName}</p>
                <p className="text-caption text-secondary">
                  {MEAL_TYPE_NAMES[pendingFeedback.mealType]} •{' '}
                  {new Date(pendingFeedback.timestamp).toLocaleDateString()}
                </p>
              </div>
              <p className="text-caption text-secondary">
                你的反馈会帮助我们改进推荐算法
              </p>
            </div>

            {/* 反馈选项 */}
            <div className="space-y-3 mb-4">
              <Button
                variant="primary"
                size="large"
                onClick={() => handleFeedback(true)}
                disabled={isSubmitting}
                className="w-full"
              >
                <ThumbsUp size={20} />
                <span>很好！</span>
              </Button>

              <Button
                variant="secondary"
                size="large"
                onClick={() => handleFeedback(false)}
                disabled={isSubmitting}
                className="w-full"
              >
                <ThumbsDown size={20} />
                <span>一般般</span>
              </Button>
            </div>

            {/* 底部操作 */}
            <button
              onClick={handleSkip}
              disabled={isSubmitting}
              className="w-full py-2 text-caption text-secondary hover:text-primary transition-colors disabled:opacity-50"
            >
              跳过反馈
            </button>

            {/* 加载状态 */}
            <AnimatePresence>
              {isSubmitting && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-surface/90 flex items-center justify-center rounded-2xl"
                >
                  <div className="flex items-center gap-2 text-secondary">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, ease: "linear", repeat: Infinity }}
                    >
                      <Sparkles size={20} />
                    </motion.div>
                    <span className="text-body">处理中...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// 反馈提示组件 (用于主界面显示)
export function FeedbackBanner() {
  const { state, dispatch, ActionTypes } = useApp();
  const pendingFeedback = state.pendingFeedback;

  if (!pendingFeedback || state.ui.showFeedback) {
    return null;
  }

  const showFeedbackModal = () => {
    dispatch({ type: ActionTypes.SET_SHOW_FEEDBACK, payload: true });
  };

  const skipFeedback = () => {
    dispatch({ type: ActionTypes.CLEAR_PENDING_FEEDBACK });
  };

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="fixed top-4 left-4 right-4 z-40"
    >
      <Card className="p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Sparkles size={20} className="text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-body font-medium">有个快速问题</p>
              <p className="text-caption text-secondary">
                上次在 {pendingFeedback.restaurantName} 吃得怎么样？
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="primary"
              size="small"
              onClick={showFeedbackModal}
            >
              反馈
            </Button>
            <button
              onClick={skipFeedback}
              className="p-2 text-secondary hover:text-primary hover:bg-muted rounded-lg transition-colors"
              aria-label="关闭"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
