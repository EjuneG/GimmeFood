import React, { useState } from 'react';

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
    <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white shadow-lg">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
          <div>
            <p className="text-sm font-medium">新版本可用！</p>
            <p className="text-xs opacity-90">更新以获得最新功能和修复</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className={`px-4 py-2 text-xs font-medium bg-white text-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 transition-colors ${
              isUpdating ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isUpdating ? (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span>更新中...</span>
              </div>
            ) : (
              '立即更新'
            )}
          </button>

          <button
            onClick={handleDismiss}
            className="text-white hover:text-blue-200 focus:outline-none focus:text-blue-200 transition-colors"
            aria-label="忽略更新"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
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
    <div className="fixed bottom-20 left-4 right-4 z-40 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg">
      <div className="p-4 flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium">🎉 新版本已就绪</p>
          <p className="text-xs opacity-90 mt-1">点击更新享受最新体验</p>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={onUpdate}
            disabled={isUpdating}
            className="px-3 py-2 bg-white text-blue-600 text-xs font-medium rounded-md hover:bg-blue-50 disabled:opacity-50 transition-colors"
          >
            {isUpdating ? '更新中...' : '更新'}
          </button>

          <button
            onClick={() => setIsVisible(false)}
            className="text-white/70 hover:text-white p-1"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateNotification;