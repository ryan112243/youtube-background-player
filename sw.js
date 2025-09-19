// Service Worker for YouTube Background Player
const CACHE_NAME = 'youtube-bg-player-v3';
const urlsToCache = [
  './',
  './index.html',
  './app.js',
  './manifest.json',
  './icon-192.png'
];

// 安裝 Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker 安裝中...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('快取已開啟');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('所有檔案已快取');
        // 強制啟用新的 Service Worker
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('快取失敗:', error);
      })
  );
});

// 啟用 Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker 已啟用');
  event.waitUntil(
    Promise.all([
      // 清理舊快取
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('刪除舊快取:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // 立即控制所有客戶端
      self.clients.claim()
    ])
  );
});

// 攔截網路請求
self.addEventListener('fetch', (event) => {
  // 跳過非 GET 請求和外部 API 請求
  if (event.request.method !== 'GET' || 
      event.request.url.includes('youtube.com') ||
      event.request.url.includes('googleapis.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 如果在快取中找到，返回快取版本
        if (response) {
          return response;
        }
        
        // 否則從網路獲取
        return fetch(event.request).then((response) => {
          // 檢查是否為有效回應
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // 複製回應以便快取
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        // 網路失敗時的後備方案
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      })
  );
});

// 背景同步（如果支援）
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('背景同步觸發');
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // 在這裡可以實現背景同步邏輯
  return Promise.resolve();
}

// 推送通知（如果需要）
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: './icon-192.png',
      badge: './icon-96.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey
      },
      actions: [
        {
          action: 'explore',
          title: '開啟應用',
          icon: './icon-192.png'
        },
        {
          action: 'close',
          title: '關閉',
          icon: './icon-192.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// 通知點擊處理
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('./')
    );
  }
});

// 訊息處理（與主線程通信）
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// 錯誤處理
self.addEventListener('error', (event) => {
  console.error('Service Worker 錯誤:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker 未處理的 Promise 拒絕:', event.reason);
});