import { useState, useEffect, useCallback } from 'react';

/**
 * Service Worker 更新管理 Hook
 * 处理 PWA 的服务工作者生命周期和更新检测
 */
export const useServiceWorker = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // 检测是否有新的服务工作者等待中
  const checkForUpdates = useCallback(() => {
    if (!registration) return;

    // 手动检查更新
    registration.update().catch((error) => {
      console.log('手动检查更新失败:', error);
    });
  }, [registration]);

  // 激活等待中的服务工作者并重载页面
  const updateApp = useCallback(async () => {
    if (!registration || !registration.waiting) return;

    setIsUpdating(true);

    try {
      // 向等待中的服务工作者发送跳过等待消息
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    } catch (error) {
      console.error('更新应用失败:', error);
      setIsUpdating(false);
    }
  }, [registration]);

  useEffect(() => {
    // 检查浏览器是否支持服务工作者
    if (!('serviceWorker' in navigator)) {
      return;
    }

    // 监听控制器变化，表示新的服务工作者已激活
    const handleControllerChange = () => {
      // 重载页面以使用新版本
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    // 监听服务工作者注册
    navigator.serviceWorker.ready
      .then((reg) => {
        setRegistration(reg);

        // 监听服务工作者更新
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // 有新版本可用
                setUpdateAvailable(true);
              }
            }
          });
        });

        // 检查是否已经有等待的服务工作者
        if (reg.waiting) {
          setUpdateAvailable(true);
        }
      })
      .catch((error) => {
        console.error('服务工作者注册失败:', error);
      });

    // 监听服务工作者消息
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
        setUpdateAvailable(true);
      }
    });

    // 监听在线状态变化，在线时检查更新
    const handleOnline = () => {
      if (registration) {
        checkForUpdates();
      }
    };

    window.addEventListener('online', handleOnline);

    // 清理事件监听器
    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      window.removeEventListener('online', handleOnline);
    };
  }, [checkForUpdates]);

  return {
    updateAvailable,
    isUpdating,
    updateApp,
    checkForUpdates,
    registration
  };
};