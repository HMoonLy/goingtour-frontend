import html2pdf from 'html2pdf.js'
import html2canvas from 'html2canvas'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx'
import { saveAs } from 'file-saver'

export class TripExporter {
    constructor(tripData) {
        this.tripData = tripData
    }

    // 导出为PDF - 最推荐的格式
    async exportToPDF() {
        // 创建临时的打印友好的HTML内容
        const printContent = this.createPrintHTML()

        // 创建临时容器
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = printContent
        tempDiv.style.cssText = `
      position: fixed;
      top: -9999px;
      left: -9999px;
      width: 210mm;
      background: white;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #333;
      padding: 20px;
      box-sizing: border-box;
    `
        document.body.appendChild(tempDiv)

        try {
            const options = {
                margin: [0.5, 0.5, 0.5, 0.5],
                filename: `${this.tripData.title}-行程单.pdf`,
                image: { type: 'jpeg', quality: 0.95 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#ffffff',
                    width: tempDiv.scrollWidth,
                    height: tempDiv.scrollHeight
                },
                jsPDF: {
                    unit: 'in',
                    format: 'a4',
                    orientation: 'portrait'
                }
            }

            await html2pdf().set(options).from(tempDiv).save()
            return true
        } finally {
            document.body.removeChild(tempDiv)
        }
    }

    // 导出为Word文档
    async exportToWord() {
        const content = this.tripData.aiContent || ''
        const lines = content.split('\n').filter(line => line.trim())

        const children = []

        // 添加标题
        children.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: this.tripData.title,
                        bold: true,
                        size: 32,
                        color: "2E86C1"
                    })
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 }
            })
        )

        // 添加基本信息
        const infoText = []
        if (this.tripData.destinationName) {
            infoText.push(`📍 目的地：${this.tripData.destinationName}`)
        }
        if (this.tripData.days) {
            infoText.push(`📅 天数：${this.tripData.days}天`)
        }
        if (this.tripData.mate) {
            infoText.push(`👥 人数：${this.tripData.mate}人`)
        }
        if (this.tripData.totalBudget) {
            infoText.push(`💰 预算：¥${this.tripData.totalBudget}`)
        }

        if (infoText.length > 0) {
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: infoText.join('  |  '),
                            color: "5D6D7E"
                        })
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 300 }
                })
            )
        }

        // 添加分隔线
        children.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
                        color: "BDC3C7"
                    })
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 }
            })
        )

        // 解析并添加行程内容
        lines.forEach(line => {
            if (line.startsWith('# ')) {
                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: line.replace('# ', ''),
                                bold: true,
                                size: 24,
                                color: "2E86C1"
                            })
                        ],
                        heading: HeadingLevel.HEADING_1,
                        spacing: { before: 300, after: 200 }
                    })
                )
            } else if (line.startsWith('## ')) {
                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: line.replace('## ', ''),
                                bold: true,
                                size: 20,
                                color: "3498DB"
                            })
                        ],
                        heading: HeadingLevel.HEADING_2,
                        spacing: { before: 200, after: 150 }
                    })
                )
            } else if (line.startsWith('### ')) {
                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: line.replace('### ', ''),
                                bold: true,
                                size: 16,
                                color: "5DADE2"
                            })
                        ],
                        heading: HeadingLevel.HEADING_3,
                        spacing: { before: 150, after: 100 }
                    })
                )
            } else if (line.startsWith('- ') || line.startsWith('* ')) {
                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({ text: '• ' + line.replace(/^[*-] /, '') })
                        ],
                        spacing: { after: 100 }
                    })
                )
            } else if (line.trim()) {
                children.push(
                    new Paragraph({
                        children: [new TextRun({ text: line })],
                        spacing: { after: 120 }
                    })
                )
            }
        })

        // 添加页脚
        children.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: `\n生成时间：${new Date().toLocaleString('zh-CN')}  |  GoingTour 智能行程规划`,
                        size: 18,
                        color: "95A5A6"
                    })
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 400 }
            })
        )

        const doc = new Document({
            sections: [{
                properties: {},
                children: children
            }]
        })

        const buffer = await Packer.toBuffer(doc)
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        })

        saveAs(blob, `${this.tripData.title}-行程单.docx`)
    }

    // 导出为高清图片
    async exportToImage() {
        const printContent = this.createPrintHTML()

        // 创建临时容器
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = printContent
        tempDiv.style.cssText = `
      position: fixed;
      top: -9999px;
      left: -9999px;
      width: 800px;
      background: white;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", sans-serif;
      font-size: 16px;
      line-height: 1.6;
      color: #333;
      padding: 40px;
      box-shadow: 0 0 20px rgba(0,0,0,0.1);
      box-sizing: border-box;
    `
        document.body.appendChild(tempDiv)

        try {
            const canvas = await html2canvas(tempDiv, {
                scale: 3, // 超高清
                useCORS: true,
                backgroundColor: '#ffffff',
                width: tempDiv.scrollWidth,
                height: tempDiv.scrollHeight
            })

            const link = document.createElement('a')
            link.download = `${this.tripData.title}-行程单.png`
            link.href = canvas.toDataURL('image/png', 1.0)
            link.click()
        } finally {
            document.body.removeChild(tempDiv)
        }
    }

    // 创建打印友好的HTML内容
    createPrintHTML() {
            const content = this.tripData.aiContent || ''

            // 简单的Markdown到HTML转换
            let htmlContent = content
                .replace(/^### (.*$)/gim, '<h3 style="color: #5DADE2; font-size: 18px; margin: 15px 0 10px 0;">$1</h3>')
                .replace(/^## (.*$)/gim, '<h2 style="color: #3498DB; font-size: 22px; margin: 20px 0 15px 0;">$1</h2>')
                .replace(/^# (.*$)/gim, '<h1 style="color: #2E86C1; font-size: 26px; margin: 25px 0 20px 0;">$1</h1>')
                .replace(/^\- (.*$)/gim, '<li style="margin: 5px 0; padding-left: 5px;">$1</li>')
                .replace(/^\* (.*$)/gim, '<li style="margin: 5px 0; padding-left: 5px;">$1</li>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/\n\n/g, '</p><p style="margin: 10px 0; line-height: 1.6;">')
                .replace(/\n/g, '<br>')

            // 包装段落
            if (htmlContent && !htmlContent.startsWith('<')) {
                htmlContent = '<p style="margin: 10px 0; line-height: 1.6;">' + htmlContent + '</p>'
            }

            // 处理列表
            htmlContent = htmlContent.replace(/(<li[^>]*>.*?<\/li>)/gs, (match) => {
                if (!match.includes('<ul>') && !match.includes('<ol>')) {
                    return '<ul style="margin: 10px 0; padding-left: 20px;">' + match + '</ul>'
                }
                return match
            })

            return `
      <div style="max-width: 100%; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif;">
        <!-- 标题区域 -->
        <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #3498db;">
          <h1 style="color: #2c3e50; font-size: 28px; margin: 0 0 15px 0; font-weight: bold;">
            ${this.tripData.title}
          </h1>
          <div style="color: #7f8c8d; font-size: 16px;">
            ${this.tripData.destinationName ? `📍 ${this.tripData.destinationName}` : ''}
            ${this.tripData.days ? ` | 📅 ${this.tripData.days}天` : ''}
            ${this.tripData.mate ? ` | 👥 ${this.tripData.mate}人` : ''}
            ${this.tripData.totalBudget ? ` | 💰 ¥${this.tripData.totalBudget}` : ''}
          </div>
        </div>
        
        <!-- 行程内容 -->
        <div style="font-size: 15px; line-height: 1.8; color: #2c3e50;">
          ${htmlContent}
        </div>
        
        <!-- 页脚 -->
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ecf0f1; text-align: center; color: #95a5a6; font-size: 14px;">
          生成时间：${new Date().toLocaleString('zh-CN')} | GoingTour 智能行程规划
        </div>
      </div>
    `
  }
}