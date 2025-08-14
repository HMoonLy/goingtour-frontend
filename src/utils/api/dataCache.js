/**
 * 数据缓存工具类
 * 用于缓存景点、餐厅等API数据，提升性能和用户体验
 */

class DataCache {
    constructor() {
        this.cache = new Map();
        this.maxSize = 100; // 最大缓存条目数
        this.defaultTTL = 30 * 60 * 1000; // 默认30分钟过期
    }

    /**
     * 生成缓存键
     * @param {string} type - 数据类型 (attractions/restaurants)
     * @param {string} city - 城市名称
     * @param {number} page - 页码
     * @param {string} keyword - 搜索关键词
     */
    generateKey(type, city, page = 1, keyword = '') {
        return `${type}_${city}_${page}_${keyword}`.toLowerCase();
    }

    /**
     * 设置缓存
     * @param {string} key - 缓存键
     * @param {any} data - 缓存数据
     * @param {number} ttl - 过期时间（毫秒）
     */
    set(key, data, ttl = this.defaultTTL) {
        // 如果缓存已满，删除最旧的条目
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }

        const cacheItem = {
            data,
            timestamp: Date.now(),
            ttl,
            accessCount: 0,
        };

        this.cache.set(key, cacheItem);
        console.log(`📦 缓存已设置: ${key}`);
    }

    /**
     * 获取缓存
     * @param {string} key - 缓存键
     * @returns {any|null} 缓存数据或null
     */
    get(key) {
        const cacheItem = this.cache.get(key);

        if (!cacheItem) {
            return null;
        }

        // 检查是否过期
        if (Date.now() - cacheItem.timestamp > cacheItem.ttl) {
            this.cache.delete(key);
            console.log(`🗑️ 缓存已过期并删除: ${key}`);
            return null;
        }

        // 更新访问计数
        cacheItem.accessCount++;
        console.log(`📖 缓存命中: ${key} (访问次数: ${cacheItem.accessCount})`);

        return cacheItem.data;
    }

    /**
     * 检查缓存是否存在且有效
     * @param {string} key - 缓存键
     * @returns {boolean}
     */
    has(key) {
        return this.get(key) !== null;
    }

    /**
     * 删除特定缓存
     * @param {string} key - 缓存键
     */
    delete(key) {
        const deleted = this.cache.delete(key);
        if (deleted) {
            console.log(`🗑️ 缓存已删除: ${key}`);
        }
        return deleted;
    }

    /**
     * 清空所有缓存
     */
    clear() {
        this.cache.clear();
        console.log('🧹 所有缓存已清空');
    }

    /**
     * 清空特定城市的缓存
     * @param {string} city - 城市名称
     */
    clearCity(city) {
        const keysToDelete = [];
        for (const key of this.cache.keys()) {
            if (key.includes(city.toLowerCase())) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach(key => this.cache.delete(key));
        console.log(`🧹 已清空城市 ${city} 的缓存，共 ${keysToDelete.length} 条`);
    }

    /**
     * 获取缓存统计信息
     * @returns {object} 缓存统计
     */
    getStats() {
        const stats = {
            totalItems: this.cache.size,
            maxSize: this.maxSize,
            items: [],
        };

        for (const [key, item] of this.cache.entries()) {
            stats.items.push({
                key,
                age: Date.now() - item.timestamp,
                accessCount: item.accessCount,
                size: JSON.stringify(item.data).length,
            });
        }

        return stats;
    }

    /**
     * 预加载数据到缓存
     * @param {string} type - 数据类型
     * @param {string} city - 城市名称
     * @param {Function} loadFunction - 数据加载函数
     * @param {number} maxPages - 最大预加载页数
     */
    async preloadData(type, city, loadFunction, maxPages = 3) {
        console.log(`🔄 开始预加载 ${city} 的 ${type} 数据...`);

        for (let page = 1; page <= maxPages; page++) {
            const key = this.generateKey(type, city, page);

            if (!this.has(key)) {
                try {
                    const data = await loadFunction(city, page);
                    if (data && data.pois && data.pois.length > 0) {
                        this.set(key, data);
                    } else {
                        // 如果没有数据，停止预加载
                        break;
                    }
                } catch (error) {
                    console.error(`❌ 预加载第 ${page} 页失败:`, error);
                    break;
                }
            }
        }

        console.log(`✅ ${city} 的 ${type} 数据预加载完成`);
    }
}

// 创建全局实例
export const dataCache = new DataCache();

// 开发环境下暴露到全局，便于调试
if (process.env.NODE_ENV === 'development') {
    window.dataCache = dataCache;
}

export default DataCache;