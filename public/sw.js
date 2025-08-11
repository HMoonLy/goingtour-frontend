/**
 * Service Worker for GoingTour PWA
 * 提供离线缓存、后台同步等功能
 */

const CACHE_NAME = "goingtour-v1.0.0";
const RUNTIME_CACHE = "goingtour-runtime";
const API_CACHE = "goingtour-api";

// 需要预缓存的静态资源
const PRECACHE_URLS = [
  "/",
  "/login",
  "/register",
  "/personal",
  "/destinations",
  "/preferences",
  "/offline.html",
  "/manifest.json",
  // 可以添加关键的CSS和JS文件
];

// API缓存配置
const API_CACHE_CONFIG = {
  "/api/cities": { strategy: "cacheFirst", maxAge: 24 * 60 * 60 * 1000 }, // 城市数据缓存24小时
  "/api/attractions": {
    strategy: "staleWhileRevalidate",
    maxAge: 60 * 60 * 1000,
  }, // 景点数据1小时
  "/api/restaurants": {
    strategy: "staleWhileRevalidate",
    maxAge: 60 * 60 * 1000,
  }, // 餐厅数据1小时
  "/api/user/preferences": { strategy: "networkFirst", maxAge: 30 * 60 * 1000 }, // 用户偏好30分钟
  "/api/trips": { strategy: "networkFirst", maxAge: 10 * 60 * 1000 }, // 行程数据10分钟
};

// 安装事件 - 预缓存资源
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Pre-caching static resources");
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        // 强制激活新的Service Worker
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("Pre-cache failed:", error);
      }),
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== CACHE_NAME &&
              cacheName !== RUNTIME_CACHE &&
              cacheName !== API_CACHE
            ) {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => {
        // 立即控制所有客户端
        return self.clients.claim();
      }),
  );
});

// 获取事件 - 处理网络请求
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 跳过非GET请求
  if (request.method !== "GET") {
    return;
  }

  // 跳过chrome-extension请求
  if (url.protocol === "chrome-extension:") {
    return;
  }

  // 处理API请求
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // 处理静态资源请求
  event.respondWith(handleStaticRequest(request));
});

/**
 * 处理API请求
 */
async function handleApiRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // 查找匹配的缓存配置
  let config = null;
  for (const [pattern, cfg] of Object.entries(API_CACHE_CONFIG)) {
    if (pathname.includes(pattern)) {
      config = cfg;
      break;
    }
  }

  if (!config) {
    // 默认网络优先策略
    return handleNetworkFirst(request, API_CACHE);
  }

  switch (config.strategy) {
    case "cacheFirst":
      return handleCacheFirst(request, API_CACHE, config.maxAge);
    case "networkFirst":
      return handleNetworkFirst(request, API_CACHE, config.maxAge);
    case "staleWhileRevalidate":
      return handleStaleWhileRevalidate(request, API_CACHE, config.maxAge);
    default:
      return handleNetworkFirst(request, API_CACHE);
  }
}

/**
 * 处理静态资源请求
 */
async function handleStaticRequest(request) {
  const url = new URL(request.url);

  // 对于导航请求，使用网络优先策略
  if (request.mode === "navigate") {
    return handleNavigationRequest(request);
  }

  // 对于其他静态资源，使用缓存优先策略
  return handleCacheFirst(request, RUNTIME_CACHE);
}

/**
 * 处理导航请求
 */
async function handleNavigationRequest(request) {
  try {
    // 尝试网络请求
    const networkResponse = await fetch(request);

    // 如果成功，缓存响应
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log("Network failed, trying cache:", error);

    // 网络失败，尝试缓存
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // 缓存也没有，返回离线页面
    const offlineResponse = await caches.match("/offline.html");
    if (offlineResponse) {
      return offlineResponse;
    }

    // 最后的回退
    return new Response(
      "<!DOCTYPE html><html><head><title>离线</title></head><body><h1>当前离线</h1><p>请检查网络连接</p></body></html>",
      { headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }
}

/**
 * 缓存优先策略
 */
async function handleCacheFirst(request, cacheName, maxAge = null) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    // 检查缓存是否过期
    if (maxAge && isCacheExpired(cachedResponse, maxAge)) {
      console.log("Cache expired for:", request.url);
      // 异步更新缓存
      updateCacheInBackground(request, cacheName);
    }
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log("Network and cache failed:", error);
    return new Response("Offline", { status: 503 });
  }
}

/**
 * 网络优先策略
 */
async function handleNetworkFirst(request, cacheName, maxAge = null) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log("Network failed, trying cache:", error);

    const cachedResponse = await caches.match(request);
    if (
      cachedResponse &&
      (!maxAge || !isCacheExpired(cachedResponse, maxAge))
    ) {
      return cachedResponse;
    }

    throw error;
  }
}

/**
 * 过期重新验证策略
 */
async function handleStaleWhileRevalidate(request, cacheName, maxAge = null) {
  const cachedResponse = await caches.match(request);

  // 异步更新缓存
  const networkResponsePromise = fetch(request).then((response) => {
    if (response.ok) {
      const cache = caches.open(cacheName);
      cache.then((c) => c.put(request, response.clone()));
    }
    return response;
  });

  // 如果有缓存且未过期，立即返回
  if (cachedResponse && (!maxAge || !isCacheExpired(cachedResponse, maxAge))) {
    return cachedResponse;
  }

  // 否则等待网络响应
  try {
    return await networkResponsePromise;
  } catch (error) {
    // 网络失败，返回过期的缓存（如果有的话）
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

/**
 * 检查缓存是否过期
 */
function isCacheExpired(response, maxAge) {
  const cachedTime = response.headers.get("sw-cached-time");
  if (!cachedTime) return false;

  const age = Date.now() - parseInt(cachedTime);
  return age > maxAge;
}

/**
 * 后台更新缓存
 */
async function updateCacheInBackground(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      // 添加缓存时间戳
      const responseWithTimestamp = new Response(networkResponse.body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers: {
          ...Object.fromEntries(networkResponse.headers.entries()),
          "sw-cached-time": Date.now().toString(),
        },
      });
      cache.put(request, responseWithTimestamp);
    }
  } catch (error) {
    console.log("Background cache update failed:", error);
  }
}

// 后台同步
self.addEventListener("sync", (event) => {
  console.log("Background sync:", event.tag);

  if (event.tag === "background-sync-trips") {
    event.waitUntil(syncTrips());
  }
});

/**
 * 同步行程数据
 */
async function syncTrips() {
  try {
    // 获取待同步的数据
    const pendingData = await getStoredData("pending-trips");

    for (const data of pendingData) {
      try {
        await fetch("/api/trips", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        // 同步成功，移除待同步数据
        await removeStoredData("pending-trips", data.id);
      } catch (error) {
        console.log("Sync failed for trip:", data.id, error);
      }
    }
  } catch (error) {
    console.log("Background sync failed:", error);
  }
}

// 推送通知
self.addEventListener("push", (event) => {
  console.log("Push received:", event);

  const options = {
    body: event.data ? event.data.text() : "您有新的旅行推荐！",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "查看详情",
        icon: "/icons/action-explore.png",
      },
      {
        action: "close",
        title: "关闭",
        icon: "/icons/action-close.png",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification("GoingTour", options));
});

// 通知点击
self.addEventListener("notificationclick", (event) => {
  console.log("Notification click:", event);

  event.notification.close();

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/destinations"));
  } else if (event.action === "close") {
    // 什么都不做，只是关闭通知
  } else {
    // 默认行为：打开应用
    event.waitUntil(clients.openWindow("/"));
  }
});

// 工具函数：存储数据
async function storeData(key, data) {
  try {
    const cache = await caches.open("goingtour-data");
    const response = new Response(JSON.stringify(data));
    await cache.put(key, response);
  } catch (error) {
    console.error("Failed to store data:", error);
  }
}

// 工具函数：获取存储的数据
async function getStoredData(key) {
  try {
    const cache = await caches.open("goingtour-data");
    const response = await cache.match(key);
    if (response) {
      return await response.json();
    }
    return [];
  } catch (error) {
    console.error("Failed to get stored data:", error);
    return [];
  }
}

// 工具函数：移除存储的数据
async function removeStoredData(key, id) {
  try {
    const data = await getStoredData(key);
    const filteredData = data.filter((item) => item.id !== id);
    await storeData(key, filteredData);
  } catch (error) {
    console.error("Failed to remove stored data:", error);
  }
}

// 错误处理
self.addEventListener("error", (event) => {
  console.error("Service Worker error:", event.error);
});

self.addEventListener("unhandledrejection", (event) => {
  console.error("Service Worker unhandled rejection:", event.reason);
});

console.log("Service Worker loaded successfully");
