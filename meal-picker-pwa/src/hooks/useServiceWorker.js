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
    if (!registration) {
      console.log('没有服务工作者注册');
      return;
    }

    setIsUpdating(true);
    console.log('开始更新应用...', {
      hasWaiting: !!registration.waiting,
      hasActive: !!registration.active,
      hasInstalling: !!registration.installing
    });

    try {
      // 如果有等待中的服务工作者，发送跳过等待消息
      if (registration.waiting) {
        console.log('向等待中的 SW 发送 SKIP_WAITING 消息');
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      } else {
        // 如果没有等待中的服务工作者，直接重载页面
        // 这种情况发生在 skipWaiting: true 时，SW 已经自动激活
        console.log('没有等待中的 SW，直接重载页面');
        window.location.reload();
      }
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
      console.log('控制器已变化，重载页面');
      // 重载页面以使用新版本
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    // 监听服务工作者注册
    navigator.serviceWorker.ready
      .then((reg) => {
        console.log('服务工作者已就绪', {
          hasWaiting: !!reg.waiting,
          hasActive: !!reg.active
        });
        setRegistration(reg);

        // 监听服务工作者更新
        reg.addEventListener('updatefound', () => {
          console.log('检测到服务工作者更新');
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            console.log('服务工作者状态变化:', newWorker.state);
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // 有新版本可用
                console.log('新版本已安装并可用');
                setUpdateAvailable(true);
              }
            }
          });
        });

        // 检查是否已经有等待的服务工作者
        if (reg.waiting) {
          console.log('发现等待中的服务工作者');
          setUpdateAvailable(true);
        }

        // 检查是否有正在安装的服务工作者
        if (reg.installing) {
          console.log('发现正在安装的服务工作者');
          const newWorker = reg.installing;
          newWorker.addEventListener('statechange', () => {
            console.log('安装中的 SW 状态变化:', newWorker.state);
            if (newWorker.state === 'installed') {
              setUpdateAvailable(true);
            }
          });
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