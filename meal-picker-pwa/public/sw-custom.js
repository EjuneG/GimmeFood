// 自定义服务工作者扩展
// 处理来自客户端的跳过等待消息

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    // 跳过等待，立即激活新的服务工作者
    self.skipWaiting();
  }
});

// 监听激活事件，立即取得控制权
self.addEventListener('activate', event => {
  // 立即控制所有客户端
  event.waitUntil(self.clients.claim());

  // 通知客户端有新版本可用
  event.waitUntil(
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'UPDATE_AVAILABLE'
        });
      });
    })
  );
});

// 安装事件处理
self.addEventListener('install', event => {
  console.log('Service Worker: 新版本正在安装...');
});