import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X } from 'lucide-react';
import { Button } from './ui/Button.jsx';
import { Card } from './ui/Card.jsx';

/**
 * 更新通知组件
 * 当有新版本可用时显示更新提示
 */
export const UpdateNotification = ({
  updateAvailable,
  isUpdating,
  onUpdate,
  onDismiss
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  // 如果已被忽略或没有更新，不显示
  if (!updateAvailable || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };

  const handleUpdate = () => {
    if (onUpdate && !isUpdating) {
      onUpdate();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="fixed top-0 left-0 right-0 z-50 p-4"
      >
        <Card className="shadow-lg">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <RefreshCw size={20} className="text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-body font-medium">新版本可用！</p>
                <p className="text-caption text-secondary">
                  更新以获得最新功能和修复
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="primary"
                size="small"
                onClick={handleUpdate}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, ease: "linear", repeat: Infinity }}
                    >
                      <RefreshCw size={16} />
                    </motion.div>
                    <span>更新中...</span>
                  </>
                ) : (
                  '立即更新'
                )}
              </Button>

              <button
                onClick={handleDismiss}
                className="p-2 text-secondary hover:text-primary hover:bg-muted rounded-lg transition-colors"
                aria-label="忽略更新"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * 更新横幅组件 - 更简洁的版本
 * 适用于不想阻挡界面的场景
 */
export const UpdateBanner = ({
  updateAvailable,
  isUpdating,
  onUpdate
}) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!updateAvailable || !isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="fixed bottom-20 left-4 right-4 z-40"
      >
        <Card className="shadow-lg">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <RefreshCw size={20} className="text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-body font-medium">新版本已就绪</p>
                <p className="text-caption text-secondary">
                  点击更新享受最新体验
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="primary"
                size="small"
                onClick={onUpdate}
                disabled={isUpdating}
              >
                {isUpdating ? '更新中...' : '更新'}
              </Button>

              <button
                onClick={() => setIsVisible(false)}
                className="p-2 text-secondary hover:text-primary hover:bg-muted rounded-lg transition-colors"
                aria-label="关闭"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default UpdateNotification;
