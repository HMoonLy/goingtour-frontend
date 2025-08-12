/**
 * 用户交互性能监控工具
 * 专门监控点击、滚动等用户交互的性能表现
 */

export class InteractionMonitor {
  constructor(name = "交互监控") {
    this.name = name;
    this.interactions = [];
    this.isMonitoring = false;
    this.frameTimings = [];
    this.longTaskObserver = null;
    this.performanceObserver = null;
  }

  // 开始监控
  start() {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.setupLongTaskObserver();
    this.setupPerformanceObserver();
    this.startFrameMonitoring();

    if (import.meta.env.DEV) {
      console.log(`🎯 [${this.name}] 开始监控用户交互性能`);
    }
  }

  // 停止监控
  stop() {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    this.stopFrameMonitoring();

    if (this.longTaskObserver) {
      this.longTaskObserver.disconnect();
      this.longTaskObserver = null;
    }

    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }

    if (import.meta.env.DEV) {
      console.log(`⏹️ [${this.name}] 停止监控`);
    }
  }

  // 监控长任务
  setupLongTaskObserver() {
    if (!window.PerformanceObserver) return;

    try {
      this.longTaskObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.interactions.push({
            type: "long-task",
            duration: entry.duration,
            startTime: entry.startTime,
            timestamp: Date.now(),
          });

          if (import.meta.env.DEV && entry.duration > 50) {
            console.warn(
              `⚠️ [${this.name}] 检测到长任务: ${entry.duration.toFixed(2)}ms`,
            );
          }
        });
      });

      this.longTaskObserver.observe({ entryTypes: ["longtask"] });
    } catch (error) {
      console.warn("Long Task Observer not supported:", error);
    }
  }

  // 监控性能指标
  setupPerformanceObserver() {
    if (!window.PerformanceObserver) return;

    try {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === "event") {
            this.interactions.push({
              type: `event-${entry.name}`,
              duration: entry.duration,
              processingStart: entry.processingStart,
              processingEnd: entry.processingEnd,
              startTime: entry.startTime,
              timestamp: Date.now(),
            });

            // 记录慢交互
            if (entry.duration > 100) {
              if (import.meta.env.DEV) {
                console.warn(
                  `🐌 [${this.name}] 慢交互 ${entry.name}: ${entry.duration.toFixed(2)}ms`,
                );
              }
            }
          }
        });
      });

      this.performanceObserver.observe({
        entryTypes: ["event"],
        buffered: true,
      });
    } catch (error) {
      console.warn("Event timing not supported:", error);
    }
  }

  // 监控帧率
  startFrameMonitoring() {
    let lastFrameTime = performance.now();
    let frameCount = 0;

    const measureFrames = () => {
      if (!this.isMonitoring) return;

      const currentTime = performance.now();
      const frameDuration = currentTime - lastFrameTime;

      this.frameTimings.push(frameDuration);
      frameCount++;

      // 每秒统计一次
      if (frameCount % 60 === 0) {
        const recentFrames = this.frameTimings.slice(-60);
        const avgFrameTime =
          recentFrames.reduce((a, b) => a + b, 0) / recentFrames.length;
        const fps = 1000 / avgFrameTime;

        this.interactions.push({
          type: "fps",
          value: fps,
          avgFrameTime,
          timestamp: Date.now(),
        });

        // 如果FPS低于40，记录警告
        if (fps < 40 && import.meta.env.DEV) {
          console.warn(`🎮 [${this.name}] 低FPS警告: ${fps.toFixed(1)} FPS`);
        }
      }

      lastFrameTime = currentTime;
      requestAnimationFrame(measureFrames);
    };

    requestAnimationFrame(measureFrames);
  }

  stopFrameMonitoring() {
    // requestAnimationFrame会在下次调用时检查isMonitoring状态
  }

  // 测量用户交互响应时间
  measureInteraction(interactionName, callback) {
    const startTime = performance.now();

    const finishMeasurement = () => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      this.interactions.push({
        type: "user-interaction",
        name: interactionName,
        duration,
        startTime,
        endTime,
        timestamp: Date.now(),
      });

      if (import.meta.env.DEV) {
        const color = duration > 100 ? "🔴" : duration > 50 ? "🟡" : "🟢";
        console.log(
          `${color} [${this.name}] ${interactionName}: ${duration.toFixed(2)}ms`,
        );
      }

      return duration;
    };

    if (typeof callback === "function") {
      try {
        const result = callback();

        // 如果返回Promise，等待完成
        if (result && typeof result.then === "function") {
          return result.finally(finishMeasurement);
        } else {
          finishMeasurement();
          return result;
        }
      } catch (error) {
        finishMeasurement();
        throw error;
      }
    } else {
      return finishMeasurement;
    }
  }

  // 创建交互测量装饰器
  createInteractionDecorator(interactionName) {
    return (target, propertyKey, descriptor) => {
      const originalMethod = descriptor.value;

      descriptor.value = function (...args) {
        return this.measureInteraction(interactionName, () => {
          return originalMethod.apply(this, args);
        });
      };

      return descriptor;
    };
  }

  // 获取性能报告
  getReport() {
    const report = {
      name: this.name,
      totalInteractions: this.interactions.length,
      interactions: [...this.interactions],
      summary: {},
    };

    // 按类型分组统计
    const groups = this.interactions.reduce((acc, interaction) => {
      const type = interaction.type;
      if (!acc[type]) {
        acc[type] = [];
      }
      if (interaction.duration !== undefined) {
        acc[type].push(interaction.duration);
      }
      return acc;
    }, {});

    // 计算统计信息
    Object.keys(groups).forEach((type) => {
      const durations = groups[type];
      if (durations.length === 0) return;

      const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
      const min = Math.min(...durations);
      const max = Math.max(...durations);
      const p95 = this.getPercentile(durations, 95);

      report.summary[type] = {
        count: durations.length,
        average: parseFloat(avg.toFixed(2)),
        min: parseFloat(min.toFixed(2)),
        max: parseFloat(max.toFixed(2)),
        p95: parseFloat(p95.toFixed(2)),
      };
    });

    // 计算FPS统计
    const fpsData = this.interactions
      .filter((i) => i.type === "fps")
      .map((i) => i.value);
    if (fpsData.length > 0) {
      const avgFps = fpsData.reduce((a, b) => a + b, 0) / fpsData.length;
      const minFps = Math.min(...fpsData);

      report.summary.fps = {
        average: parseFloat(avgFps.toFixed(1)),
        minimum: parseFloat(minFps.toFixed(1)),
        samples: fpsData.length,
      };
    }

    return report;
  }

  // 计算百分位数
  getPercentile(arr, percentile) {
    const sorted = arr.slice().sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  // 输出性能报告
  logReport() {
    if (!import.meta.env.DEV) return;

    const report = this.getReport();

    console.group(`📊 [${this.name}] 交互性能报告`);
    console.log(`总交互次数: ${report.totalInteractions}`);

    Object.entries(report.summary).forEach(([type, stats]) => {
      if (type === "fps") {
        console.log(`${type}:`, {
          平均FPS: stats.average,
          最低FPS: stats.minimum,
          采样数: stats.samples,
        });
      } else {
        console.log(`${type}:`, {
          次数: stats.count,
          平均: `${stats.average}ms`,
          最快: `${stats.min}ms`,
          最慢: `${stats.max}ms`,
          P95: `${stats.p95}ms`,
        });
      }
    });

    console.groupEnd();

    return report;
  }

  // 重置统计数据
  reset() {
    this.interactions = [];
    this.frameTimings = [];
  }
}

// 创建全局交互监控实例
export const interactionMonitor = new InteractionMonitor("页面交互");

// 工具函数：创建防抖的交互处理器
export function createDebouncedHandler(handler, delay = 100) {
  let timeoutId = null;

  return function (...args) {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      interactionMonitor.measureInteraction("debounced-handler", () => {
        return handler.apply(this, args);
      });
    }, delay);
  };
}

// 工具函数：创建节流的交互处理器
export function createThrottledHandler(handler, delay = 100) {
  let lastCall = 0;
  let timeoutId = null;

  return function (...args) {
    const now = Date.now();

    if (now - lastCall >= delay) {
      lastCall = now;
      return interactionMonitor.measureInteraction("throttled-handler", () => {
        return handler.apply(this, args);
      });
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(
        () => {
          lastCall = Date.now();
          interactionMonitor.measureInteraction(
            "throttled-handler-delayed",
            () => {
              return handler.apply(this, args);
            },
          );
        },
        delay - (now - lastCall),
      );
    }
  };
}
