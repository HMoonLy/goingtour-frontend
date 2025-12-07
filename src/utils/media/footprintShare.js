/**
 * 足迹分享工具 - 生成分享图片和内容
 */
import html2canvas from "html2canvas";
import { ElMessage } from "element-plus";

export class FootprintShareUtil {
  /**
   * 生成分享图片
   * @param {Object} options - 选项
   * @param {HTMLElement} options.element - 要截图的元素
   * @param {Object} options.stats - 统计数据
   * @param {String} options.title - 分享标题
   * @returns {Promise<Blob>}
   */
  static async generateShareImage(options) {
    const { element, stats, title = "我的旅行足迹" } = options;

    if (!element) {
      throw new Error("未找到要截图的元素");
    }

    try {
      // 添加分享水印样式
      const watermarkStyle = this.createWatermarkStyle();
      document.head.appendChild(watermarkStyle);

      // 创建分享容器
      const shareContainer = this.createShareContainer(element, stats, title);
      document.body.appendChild(shareContainer);

      // 生成截图
      const canvas = await html2canvas(shareContainer, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: shareContainer.offsetWidth,
        height: shareContainer.offsetHeight,
      });

      // 清理临时元素
      document.body.removeChild(shareContainer);
      document.head.removeChild(watermarkStyle);

      // 转换为Blob
      return new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("截图生成失败"));
            }
          },
          "image/png",
          0.9,
        );
      });
    } catch (error) {
      throw new Error(`生成分享图片失败: ${error.message}`);
    }
  }

  /**
   * 创建分享容器
   */
  static createShareContainer(element, stats, title) {
    const container = document.createElement("div");
    container.className = "footprint-share-container";
    container.style.cssText = `
      position: fixed;
      left: -9999px;
      top: -9999px;
      width: 600px;
      padding: 40px;
      background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
      border-radius: 20px;
      box-shadow: 0 8px 32px rgba(145, 168, 208, 0.15);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    `;

    // 克隆原始元素
    const clonedElement = element.cloneNode(true);
    clonedElement.style.cssText = "margin-bottom: 20px;";

    // 创建头部
    const header = document.createElement("div");
    header.style.cssText = `
      text-align: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid rgba(145, 168, 208, 0.1);
    `;
    header.innerHTML = `
      <h1 style="
        margin: 0 0 8px 0;
        font-size: 28px;
        font-weight: 700;
        background: linear-gradient(135deg, #1f2937 0%, #91a8d0 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      ">${title}</h1>
      <p style="
        margin: 0;
        font-size: 16px;
        color: #6b7280;
        font-weight: 500;
      ">分享我的旅行足迹 🌟</p>
    `;

    // 创建底部水印
    const footer = document.createElement("div");
    footer.style.cssText = `
      text-align: center;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid rgba(145, 168, 208, 0.1);
      font-size: 12px;
      color: #9ca3af;
    `;
    footer.innerHTML = `
      <p style="margin: 0;">
        📍 探索率 ${stats.explorationRate}% | 
        🏙️ ${stats.visitedCities} 个城市 | 
        🗺️ ${stats.exploredProvinces} 个省份
      </p>
      <p style="margin: 8px 0 0 0; font-weight: 500;">
        来自 GoingTour - 记录你的旅行足迹
      </p>
    `;

    container.appendChild(header);
    container.appendChild(clonedElement);
    container.appendChild(footer);

    return container;
  }

  /**
   * 创建水印样式
   */
  static createWatermarkStyle() {
    const style = document.createElement("style");
    style.textContent = `
      .footprint-share-container * {
        box-sizing: border-box;
      }
      
      .footprint-share-container .stat-item:hover {
        transform: none !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
      }
      
      .footprint-share-container .achievement-badge:hover {
        transform: none !important;
      }
      
      .footprint-share-container .stats-actions {
        display: none !important;
      }
    `;
    return style;
  }

  /**
   * 执行分享
   * @param {Blob} imageBlob - 图片Blob
   * @param {Object} stats - 统计数据
   */
  static async executeShare(imageBlob, stats) {
    const shareText = `🌟 我的旅行足迹分享

📊 足迹统计：
• 总共记录 ${stats.totalCities} 个城市
• 已经去过 ${stats.visitedCities} 个城市  
• 还想去 ${stats.wishlistCities} 个城市
• 足迹遍布 ${stats.exploredProvinces} 个省份
• 探索率达到 ${stats.explorationRate}%

🎯 继续探索，记录更多美好足迹！`;

    // 检查是否支持原生分享
    if (navigator.share && navigator.canShare) {
      try {
        const file = new File([imageBlob], "我的足迹成就.png", {
          type: "image/png",
        });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "我的旅行足迹",
            text: shareText,
            files: [file],
          });
          ElMessage.success("分享成功！");
          return;
        }
      } catch (shareError) {
        console.log("原生分享失败，使用下载方式:", shareError);
      }
    }

    // 回退到下载方式
    await this.downloadImage(imageBlob, stats);

    // 复制分享文本到剪贴板
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(shareText);
        ElMessage.success("足迹图片已保存，分享文案已复制到剪贴板！");
      } catch (error) {
        ElMessage.success("足迹图片已保存到本地！");
      }
    } else {
      ElMessage.success("足迹图片已保存到本地！");
    }
  }

  /**
   * 下载图片
   */
  static async downloadImage(imageBlob, stats) {
    const url = URL.createObjectURL(imageBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `我的足迹成就_${new Date().toLocaleDateString("zh-CN").replace(/\//g, "-")}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * 生成并分享足迹图片
   * @param {HTMLElement} element - 要截图的元素
   * @param {Object} stats - 统计数据
   */
  static async shareFootprint(element, stats) {
    try {
      ElMessage.info("正在生成足迹分享图片...");

      const imageBlob = await this.generateShareImage({
        element,
        stats,
        title: "我的旅行足迹",
      });

      await this.executeShare(imageBlob, stats);
    } catch (error) {
      console.error("分享失败:", error);
      ElMessage.error(`分享失败: ${error.message}`);
    }
  }
}
