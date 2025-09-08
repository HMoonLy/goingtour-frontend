// 性能监控工具
export class PerformanceMonitor {
    constructor(name) {
        this.name = name;
        this.startTime = null;
        this.endTime = null;
        this.measurements = [];
        this.observers = [];
    }

    // 开始性能测量
    start(label = "default") {
        this.startTime = performance.now();
        this.label = label;

        if (
            import.meta.env.DEV) {
            console.log(`🚀 [${this.name}] 开始测量: ${label}`);
        }
    }

    // 结束性能测量
    end() {
        if (!this.startTime) {
            console.warn(`⚠️ [${this.name}] 未调用 start() 方法`);
            return;
        }

        this.endTime = performance.now();
        const duration = this.endTime - this.startTime;

        this.measurements.push({
            label: this.label || "default",
            duration,
            timestamp: Date.now(),
        });

        if (
            import.meta.env.DEV) {
            console.log(
                `✅ [${this.name}] ${this.label} 完成: ${duration.toFixed(2)}ms`,
            );
        }

        this.startTime = null;
        return duration;
    }

    // 测量图片加载性能
    measureImageLoad(imageUrl) {
        return new Promise((resolve) => {
            const startTime = performance.now();
            const img = new Image();

            const cleanup = () => {
                img.onload = null;
                img.onerror = null;
            };

            img.onload = () => {
                const loadTime = performance.now() - startTime;
                this.measurements.push({
                    label: `image-load: ${imageUrl}`,
                    duration: loadTime,
                    timestamp: Date.now(),
                    success: true,
                });

                if (
                    import.meta.env.DEV) {
                    console.log(
                        `🖼️ [${this.name}] 图片加载: ${loadTime.toFixed(2)}ms - ${imageUrl}`,
                    );
                }

                cleanup();
                resolve({ success: true, duration: loadTime });
            };

            img.onerror = () => {
                const loadTime = performance.now() - startTime;
                this.measurements.push({
                    label: `image-load-error: ${imageUrl}`,
                    duration: loadTime,
                    timestamp: Date.now(),
                    success: false,
                });

                if (
                    import.meta.env.DEV) {
                    console.warn(
                        `❌ [${this.name}] 图片加载失败: ${loadTime.toFixed(2)}ms - ${imageUrl}`,
                    );
                }

                cleanup();
                resolve({ success: false, duration: loadTime });
            };

            img.src = imageUrl;
        });
    }

    // 监控页面渲染性能
    observePageRender() {
        if (!window.PerformanceObserver) return;

        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();

            entries.forEach((entry) => {
                if (entry.entryType === "paint") {
                    this.measurements.push({
                        label: `paint-${entry.name}`,
                        duration: entry.startTime,
                        timestamp: Date.now(),
                    });

                    if (
                        import.meta.env.DEV) {
                        console.log(
                            `🎨 [${this.name}] ${entry.name}: ${entry.startTime.toFixed(2)}ms`,
                        );
                    }
                }

                if (entry.entryType === "largest-contentful-paint") {
                    this.measurements.push({
                        label: "lcp",
                        duration: entry.startTime,
                        timestamp: Date.now(),
                    });

                    if (
                        import.meta.env.DEV) {
                        console.log(
                            `📊 [${this.name}] LCP: ${entry.startTime.toFixed(2)}ms`,
                        );
                    }
                }
            });
        });

        observer.observe({ entryTypes: ["paint", "largest-contentful-paint"] });
        this.observers.push(observer);
    }

    // 获取性能报告
    getReport() {
        const report = {
            name: this.name,
            totalMeasurements: this.measurements.length,
            measurements: [...this.measurements],
            summary: {},
        };

        // 按类型分组统计
        const groups = this.measurements.reduce((acc, measurement) => {
            const type = measurement.label.split(":")[0] || measurement.label;
            if (!acc[type]) {
                acc[type] = [];
            }
            acc[type].push(measurement.duration);
            return acc;
        }, {});

        // 计算统计信息
        Object.keys(groups).forEach((type) => {
            const durations = groups[type];
            const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
            const min = Math.min(...durations);
            const max = Math.max(...durations);

            report.summary[type] = {
                count: durations.length,
                average: parseFloat(avg.toFixed(2)),
                min: parseFloat(min.toFixed(2)),
                max: parseFloat(max.toFixed(2)),
            };
        });

        return report;
    }

    // 清理观察者
    disconnect() {
        this.observers.forEach((observer) => observer.disconnect());
        this.observers = [];
    }

    // 重置测量数据
    reset() {
        this.measurements = [];
        this.startTime = null;
        this.endTime = null;
    }

    // 输出性能报告到控制台
    logReport() {
        if (!
            import.meta.env.DEV) return;

        const report = this.getReport();

        console.group(`📈 [${this.name}] 性能报告`);
        console.log(`总测量次数: ${report.totalMeasurements}`);

        Object.entries(report.summary).forEach(([type, stats]) => {
            console.log(`${type}:`, {
                次数: stats.count,
                平均: `${stats.average}ms`,
                最快: `${stats.min}ms`,
                最慢: `${stats.max}ms`,
            });
        });

        console.groupEnd();

        return report;
    }
}

// 创建全局性能监控实例
export const pagePerformance = new PerformanceMonitor("页面性能");
export const imagePerformance = new PerformanceMonitor("图片加载");

// 工具函数：测量函数执行时间
export function measureFunction(fn, name = "function") {
    return async function(...args) {
        const monitor = new PerformanceMonitor(name);
        monitor.start();

        try {
            const result = await fn.apply(this, args);
            monitor.end();
            return result;
        } catch (error) {
            monitor.end();
            throw error;
        }
    };
}

// 工具函数：批量测量图片加载
export async function measureImageBatch(imageUrls) {
    const monitor = new PerformanceMonitor("批量图片加载");
    const results = [];

    monitor.start("batch-start");

    const promises = imageUrls.map(async(url) => {
        const result = await monitor.measureImageLoad(url);
        results.push({ url, ...result });
        return result;
    });

    await Promise.all(promises);
    monitor.end();

    const successCount = results.filter((r) => r.success).length;
    const avgDuration =
        results.reduce((sum, r) => sum + r.duration, 0) / results.length;

    if (
        import.meta.env.DEV) {
        console.log(
            `📸 批量图片加载完成: ${successCount}/${results.length} 成功, 平均耗时: ${avgDuration.toFixed(2)}ms`,
        );
    }

    return {
        results,
        summary: {
            total: results.length,
            success: successCount,
            failed: results.length - successCount,
            averageDuration: parseFloat(avgDuration.toFixed(2)),
        },
    };
}