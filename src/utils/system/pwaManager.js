/**
 * PWA管理工具
 * 处理Service Worker注册、更新、离线检测等
 */

import { ref, computed } from 'vue';
import { ElMessage, ElNotification } from 'element-plus';

/**
 * PWA管理器类
 */
class PWAManager {
    constructor() {
        this.isOnline = ref(navigator.onLine);
        this.isInstalled = ref(false);
        this.isUpdateAvailable = ref(false);
        this.registration = null;
        this.deferredPrompt = null;

        this.init();
    }

    /**
     * 初始化PWA功能
     */
    async init() {
        // 检查是否为PWA环境
        this.checkInstallStatus();

        // 监听网络状态
        this.setupNetworkListeners();

        // 监听安装提示
        this.setupInstallPrompt();

        // 注册Service Worker
        if ('serviceWorker' in navigator) {
            await this.registerServiceWorker();
        }

        // 设置推送通知
        this.setupPushNotifications();
    }

    /**
     * 检查安装状态
     */
    checkInstallStatus() {
        // 检查是否在独立模式下运行（已安装）
        this.isInstalled.value =
            window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone ||
            document.referrer.includes('android-app://');
    }

    /**
     * 设置网络监听器
     */
    setupNetworkListeners() {
        const updateOnlineStatus = () => {
            const wasOffline = !this.isOnline.value;
            this.isOnline.value = navigator.onLine;

            if (navigator.onLine && wasOffline) {
                ElNotification.success({
                    title: '网络已恢复',
                    message: '您现在可以正常使用所有功能了',
                    duration: 3000,
                });

                // 尝试同步离线数据
                this.syncOfflineData();
            } else if (!navigator.onLine) {
                ElNotification.warning({
                    title: '网络连接断开',
                    message: '应用将切换到离线模式',
                    duration: 3000,
                });
            }
        };

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
    }

    /**
     * 设置安装提示
     */
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', e => {
            e.preventDefault();
            this.deferredPrompt = e;

            // 显示安装提示
            this.showInstallPrompt();
        });

        // 监听安装完成事件
        window.addEventListener('appinstalled', () => {
            this.isInstalled.value = true;
            this.deferredPrompt = null;

            ElNotification.success({
                title: '安装成功',
                message: 'GoingTour已成功安装到您的设备',
                duration: 3000,
            });
        });
    }

    /**
     * 显示安装提示
     */
    showInstallPrompt() {
        if (!this.deferredPrompt || this.isInstalled.value) return;

        ElNotification({
            title: '安装应用',
            message: '将GoingTour添加到主屏幕，获得更好的使用体验',
            type: 'info',
            duration: 0,
            showClose: true,
            customClass: 'install-prompt',
            dangerouslyUseHTMLString: true,
            message: `
        <p>将GoingTour添加到主屏幕，获得更好的使用体验</p>
        <div style="margin-top: 12px;">
          <button id="install-btn" style="background: #409EFF; color: white; border: none; padding: 8px 16px; border-radius: 4px; margin-right: 8px;">立即安装</button>
          <button id="dismiss-btn" style="background: #f5f7fa; color: #606266; border: 1px solid #dcdfe6; padding: 8px 16px; border-radius: 4px;">稍后提醒</button>
        </div>
      `,
            onClose: () => {
                // 用户关闭了提示，24小时后再显示
                localStorage.setItem('install-prompt-dismissed', Date.now().toString());
            },
        });

        // 绑定按钮事件
        setTimeout(() => {
            const installBtn = document.getElementById('install-btn');
            const dismissBtn = document.getElementById('dismiss-btn');

            if (installBtn) {
                installBtn.onclick = () => {
                    this.installApp();
                    document
                        .querySelector('.install-prompt .el-notification__closeBtn')
                        .click();
                };
            }

            if (dismissBtn) {
                dismissBtn.onclick = () => {
                    localStorage.setItem(
                        'install-prompt-dismissed',
                        Date.now().toString()
                    );
                    document
                        .querySelector('.install-prompt .el-notification__closeBtn')
                        .click();
                };
            }
        }, 100);
    }

    /**
     * 安装应用
     */
    async installApp() {
        if (!this.deferredPrompt) return false;

        try {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                console.log('用户接受了安装提示');
                return true;
            } else {
                console.log('用户拒绝了安装提示');
                return false;
            }
        } catch (error) {
            console.error('安装失败:', error);
            return false;
        } finally {
            this.deferredPrompt = null;
        }
    }

    /**
     * 注册Service Worker
     */
    async registerServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/',
            });

            this.registration = registration;
            console.log('Service Worker注册成功:', registration);

            // 监听更新
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;

                newWorker.addEventListener('statechange', () => {
                    if (
                        newWorker.state === 'installed' &&
                        navigator.serviceWorker.controller
                    ) {
                        this.isUpdateAvailable.value = true;
                        this.showUpdatePrompt();
                    }
                });
            });

            // 监听控制器变化
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                window.location.reload();
            });
        } catch (error) {
            console.error('Service Worker注册失败:', error);
        }
    }

    /**
     * 显示更新提示
     */
    showUpdatePrompt() {
        ElNotification({
            title: '应用更新',
            message: '发现新版本，是否立即更新？',
            type: 'info',
            duration: 0,
            showClose: true,
            customClass: 'update-prompt',
            dangerouslyUseHTMLString: true,
            message: `
        <p>发现新版本，包含性能优化和新功能</p>
        <div style="margin-top: 12px;">
          <button id="update-btn" style="background: #409EFF; color: white; border: none; padding: 8px 16px; border-radius: 4px; margin-right: 8px;">立即更新</button>
          <button id="later-btn" style="background: #f5f7fa; color: #606266; border: 1px solid #dcdfe6; padding: 8px 16px; border-radius: 4px;">稍后更新</button>
        </div>
      `,
        });

        // 绑定按钮事件
        setTimeout(() => {
            const updateBtn = document.getElementById('update-btn');
            const laterBtn = document.getElementById('later-btn');

            if (updateBtn) {
                updateBtn.onclick = () => {
                    this.applyUpdate();
                    document
                        .querySelector('.update-prompt .el-notification__closeBtn')
                        .click();
                };
            }

            if (laterBtn) {
                laterBtn.onclick = () => {
                    document
                        .querySelector('.update-prompt .el-notification__closeBtn')
                        .click();
                };
            }
        }, 100);
    }

    /**
     * 应用更新
     */
    applyUpdate() {
        if (!this.registration || !this.registration.waiting) return;

        // 发送跳过等待消息
        this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }

    /**
     * 设置推送通知
     */
    async setupPushNotifications() {
        if (!('Notification' in window) || !('serviceWorker' in navigator)) {
            return;
        }

        // 检查通知权限
        if (Notification.permission === 'default') {
            // 可以在适当的时候请求权限
            console.log('可以请求通知权限');
        }
    }

    /**
     * 请求通知权限
     */
    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            ElMessage.warning('您的浏览器不支持通知功能');
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        if (Notification.permission === 'denied') {
            ElMessage.warning('通知权限已被拒绝，请在浏览器设置中启用');
            return false;
        }

        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                ElMessage.success('通知权限已开启');
                return true;
            } else {
                ElMessage.info('通知权限被拒绝');
                return false;
            }
        } catch (error) {
            console.error('请求通知权限失败:', error);
            return false;
        }
    }

    /**
     * 发送本地通知
     */
    sendNotification(title, options = {}) {
        if (Notification.permission !== 'granted') return;

        const defaultOptions = {
            icon: '/icons/icon-192x192.png',
            badge: '/icons/badge-72x72.png',
            vibrate: [200, 100, 200],
            ...options,
        };

        if (this.registration) {
            // 通过Service Worker发送
            this.registration.showNotification(title, defaultOptions);
        } else {
            // 直接发送
            new Notification(title, defaultOptions);
        }
    }

    /**
     * 同步离线数据
     */
    async syncOfflineData() {
        if (!this.registration || !this.registration.sync) return;

        try {
            await this.registration.sync.register('background-sync-trips');
            console.log('后台同步已注册');
        } catch (error) {
            console.error('后台同步注册失败:', error);
        }
    }

    /**
     * 清理缓存
     */
    async clearCache() {
        try {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));

            ElMessage.success('缓存已清理');
            return true;
        } catch (error) {
            console.error('清理缓存失败:', error);
            ElMessage.error('清理缓存失败');
            return false;
        }
    }

    /**
     * 获取缓存大小
     */
    async getCacheSize() {
        if (!('storage' in navigator) || !('estimate' in navigator.storage)) {
            return null;
        }

        try {
            const estimate = await navigator.storage.estimate();
            return {
                used: estimate.usage,
                quota: estimate.quota,
                usedMB: (estimate.usage / 1024 / 1024).toFixed(2),
                quotaMB: (estimate.quota / 1024 / 1024).toFixed(2),
            };
        } catch (error) {
            console.error('获取缓存大小失败:', error);
            return null;
        }
    }
}

// 全局PWA管理器实例
export const pwaManager = new PWAManager();

/**
 * Vue组合式API钩子
 */
export function usePWA() {
    const isOnline = computed(() => pwaManager.isOnline.value);
    const isInstalled = computed(() => pwaManager.isInstalled.value);
    const isUpdateAvailable = computed(() => pwaManager.isUpdateAvailable.value);

    return {
        isOnline,
        isInstalled,
        isUpdateAvailable,
        installApp: () => pwaManager.installApp(),
        applyUpdate: () => pwaManager.applyUpdate(),
        requestNotificationPermission: () =>
            pwaManager.requestNotificationPermission(),
        sendNotification: (title, options) =>
            pwaManager.sendNotification(title, options),
        clearCache: () => pwaManager.clearCache(),
        getCacheSize: () => pwaManager.getCacheSize(),
    };
}

/**
 * 离线数据管理
 */
export class OfflineDataManager {
    constructor() {
        this.dbName = 'GoingTourOffline';
        this.dbVersion = 1;
        this.db = null;
    }

    /**
     * 初始化IndexedDB
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = event => {
                const db = event.target.result;

                // 创建行程存储
                if (!db.objectStoreNames.contains('trips')) {
                    const tripStore = db.createObjectStore('trips', { keyPath: 'id' });
                    tripStore.createIndex('userId', 'userId', { unique: false });
                    tripStore.createIndex('createdAt', 'createdAt', { unique: false });
                }

                // 创建待同步数据存储
                if (!db.objectStoreNames.contains('pendingSync')) {
                    const syncStore = db.createObjectStore('pendingSync', {
                        keyPath: 'id',
                    });
                    syncStore.createIndex('type', 'type', { unique: false });
                    syncStore.createIndex('createdAt', 'createdAt', { unique: false });
                }
            };
        });
    }

    /**
     * 保存离线数据
     */
    async saveOfflineData(storeName, data) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * 获取离线数据
     */
    async getOfflineData(storeName, key) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * 获取所有离线数据
     */
    async getAllOfflineData(storeName) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * 删除离线数据
     */
    async deleteOfflineData(storeName, key) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}

export const offlineDataManager = new OfflineDataManager();