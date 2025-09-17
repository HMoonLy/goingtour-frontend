import html2pdf from 'html2pdf.js'
import html2canvas from 'html2canvas'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx'
import { saveAs } from 'file-saver'
import MarkdownIt from 'markdown-it'

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
      position: absolute;
      top: 0;
      left: 0;
      width: 794px;
      min-height: 1123px;
      background: white;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #333;
      padding: 40px;
      box-sizing: border-box;
      visibility: hidden;
      z-index: -1000;
    `
        document.body.appendChild(tempDiv)

        try {
            // 强制重排和重绘
            tempDiv.offsetHeight

            // 等待内容完全渲染
            await new Promise(resolve => setTimeout(resolve, 1000))

            // 确保内容可见
            tempDiv.style.visibility = 'visible'
            await new Promise(resolve => setTimeout(resolve, 100))

            const options = {
                margin: 0.5,
                filename: `${this.tripData.title}-行程单.pdf`,
                image: {
                    type: 'jpeg',
                    quality: 0.98
                },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#ffffff',
                    logging: true,
                    allowTaint: false,
                    foreignObjectRendering: true,
                    width: 794,
                    height: tempDiv.scrollHeight || 1123,
                    windowWidth: 794,
                    windowHeight: tempDiv.scrollHeight || 1123
                },
                jsPDF: {
                    unit: 'in',
                    format: 'a4',
                    orientation: 'portrait',
                    hotfixes: ["px_scaling"]
                }
            }

            // 使用新的API方式
            const element = tempDiv
            await html2pdf()
                .set(options)
                .from(element)
                .save()

            return true
        } catch (error) {
            console.error('PDF导出失败:', error)
            throw new Error('PDF导出失败，请重试')
        } finally {
            if (document.body.contains(tempDiv)) {
                document.body.removeChild(tempDiv)
            }
        }
    }

    // 导出为Word文档
    async exportToWord() {
        const content = this.tripData.aiContent || ''

        // 调试信息
        console.log('Word导出 - 原始内容:', content)
        console.log('Word导出 - 内容长度:', content.length)

        // 使用MarkdownIt解析内容
        const md = new MarkdownIt()
        const tokens = md.parse(content, {})

        console.log('Word导出 - 解析后的tokens:', tokens)

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

        // 解析Markdown tokens并转换为Word段落
        try {
            this.parseMarkdownTokens(tokens, children)
        } catch (error) {
            console.error('Markdown解析失败，使用简单模式:', error)
                // 回退到简单的行解析
            this.parseSimpleContent(content, children)
        }

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

        // 使用Blob方式避免nodebuffer错误
        const blob = await Packer.toBlob(doc)
        saveAs(blob, `${this.tripData.title}-行程单.docx`)
    }

    // 解析Markdown tokens并转换为Word段落
    parseMarkdownTokens(tokens, children) {
        let i = 0
        while (i < tokens.length) {
            const token = tokens[i]

            switch (token.type) {
                case 'heading_open':
                    const headingLevel = parseInt(token.tag.replace('h', ''))
                    const headingToken = tokens[i + 1]
                    if (headingToken && headingToken.type === 'inline') {
                        const textContent = this.extractTextFromInline(headingToken)
                        children.push(
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: textContent,
                                        bold: true,
                                        size: headingLevel === 1 ? 24 : headingLevel === 2 ? 20 : 16,
                                        color: headingLevel === 1 ? "2E86C1" : headingLevel === 2 ? "3498DB" : "5DADE2"
                                    })
                                ],
                                heading: headingLevel === 1 ? HeadingLevel.HEADING_1 : headingLevel === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3,
                                spacing: {
                                    before: headingLevel === 1 ? 300 : headingLevel === 2 ? 200 : 150,
                                    after: headingLevel === 1 ? 200 : headingLevel === 2 ? 150 : 100
                                }
                            })
                        )
                    }
                    i += 2 // 跳过heading_close
                    break

                case 'paragraph_open':
                    const paragraphToken = tokens[i + 1]
                    if (paragraphToken && paragraphToken.type === 'inline') {
                        const textRuns = this.parseInlineContent(paragraphToken)
                        if (textRuns.length > 0) {
                            children.push(
                                new Paragraph({
                                    children: textRuns,
                                    spacing: { after: 120 }
                                })
                            )
                        }
                    }
                    i += 2 // 跳过paragraph_close
                    break

                case 'bullet_list_open':
                    i = this.parseBulletList(tokens, i, children)
                    break

                case 'ordered_list_open':
                    i = this.parseOrderedList(tokens, i, children)
                    break

                default:
                    i++
            }
        }
    }

    // 解析内联内容（处理粗体、斜体等）
    parseInlineContent(inlineToken) {
        const textRuns = []
        const children = inlineToken.children || []

        let i = 0
        while (i < children.length) {
            const child = children[i]

            switch (child.type) {
                case 'text':
                    textRuns.push(new TextRun({ text: child.content }))
                    break

                case 'strong_open':
                    const strongContent = children[i + 1]
                    if (strongContent && strongContent.type === 'text') {
                        textRuns.push(new TextRun({
                            text: strongContent.content,
                            bold: true
                        }))
                        i += 2 // 跳过strong_close
                    } else {
                        i++
                    }
                    break

                case 'em_open':
                    const emContent = children[i + 1]
                    if (emContent && emContent.type === 'text') {
                        textRuns.push(new TextRun({
                            text: emContent.content,
                            italics: true
                        }))
                        i += 2 // 跳过em_close
                    } else {
                        i++
                    }
                    break

                case 'code_inline':
                    textRuns.push(new TextRun({
                        text: child.content,
                        font: "Consolas"
                    }))
                    break

                default:
                    if (child.content) {
                        textRuns.push(new TextRun({ text: child.content }))
                    }
            }
            i++
        }

        return textRuns
    }

    // 提取内联文本内容
    extractTextFromInline(inlineToken) {
        const children = inlineToken.children || []
        return children.map(child => child.content || '').join('')
    }

    // 解析无序列表
    parseBulletList(tokens, startIndex, children) {
        let i = startIndex + 1 // 跳过bullet_list_open

        while (i < tokens.length && tokens[i].type !== 'bullet_list_close') {
            if (tokens[i].type === 'list_item_open') {
                const itemContent = tokens[i + 2] // list_item_open -> paragraph_open -> inline
                if (itemContent && itemContent.type === 'inline') {
                    const textContent = this.extractTextFromInline(itemContent)
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({ text: '• ' + textContent })
                            ],
                            spacing: { after: 100 }
                        })
                    )
                }
                // 跳到下一个list_item
                while (i < tokens.length && tokens[i].type !== 'list_item_close') {
                    i++
                }
            }
            i++
        }

        return i + 1 // 跳过bullet_list_close
    }

    // 解析有序列表
    parseOrderedList(tokens, startIndex, children) {
        let i = startIndex + 1 // 跳过ordered_list_open
        let itemNumber = 1

        while (i < tokens.length && tokens[i].type !== 'ordered_list_close') {
            if (tokens[i].type === 'list_item_open') {
                const itemContent = tokens[i + 2] // list_item_open -> paragraph_open -> inline
                if (itemContent && itemContent.type === 'inline') {
                    const textContent = this.extractTextFromInline(itemContent)
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({ text: `${itemNumber}. ${textContent}` })
                            ],
                            spacing: { after: 100 }
                        })
                    )
                    itemNumber++
                }
                // 跳到下一个list_item
                while (i < tokens.length && tokens[i].type !== 'list_item_close') {
                    i++
                }
            }
            i++
        }

        return i + 1 // 跳过ordered_list_close
    }

    // 简单内容解析（回退方案）
    parseSimpleContent(content, children) {
        const lines = content.split('\n').filter(line => line.trim())

        lines.forEach(line => {
            line = line.trim()
            if (!line) return

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
            } else if (/^\d+\.\s/.test(line)) {
                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({ text: line })
                        ],
                        spacing: { after: 100 }
                    })
                )
            } else {
                // 处理粗体和斜体的简单替换
                const textRuns = this.parseSimpleFormatting(line)
                children.push(
                    new Paragraph({
                        children: textRuns,
                        spacing: { after: 120 }
                    })
                )
            }
        })
    }

    // 简单格式化解析
    parseSimpleFormatting(text) {
        const textRuns = []
        let currentText = text

        // 处理粗体 **text**
        const boldRegex = /\*\*(.*?)\*\*/g
        const parts = currentText.split(boldRegex)

        for (let i = 0; i < parts.length; i++) {
            if (i % 2 === 0) {
                // 普通文本
                if (parts[i]) {
                    // 处理斜体 *text*
                    const italicParts = parts[i].split(/\*(.*?)\*/)
                    for (let j = 0; j < italicParts.length; j++) {
                        if (j % 2 === 0) {
                            if (italicParts[j]) {
                                textRuns.push(new TextRun({ text: italicParts[j] }))
                            }
                        } else {
                            textRuns.push(new TextRun({ text: italicParts[j], italics: true }))
                        }
                    }
                }
            } else {
                // 粗体文本
                textRuns.push(new TextRun({ text: parts[i], bold: true }))
            }
        }

        return textRuns.length > 0 ? textRuns : [new TextRun({ text: text })]
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
            // 等待内容渲染完成
            await new Promise(resolve => setTimeout(resolve, 300))

            const canvas = await html2canvas(tempDiv, {
                scale: 3, // 超高清
                useCORS: true,
                backgroundColor: '#ffffff',
                width: tempDiv.scrollWidth,
                height: tempDiv.scrollHeight,
                logging: false,
                allowTaint: true
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

            // 调试信息
            console.log('PDF导出 - 原始内容:', content)
            console.log('PDF导出 - 内容长度:', content.length)

            // 使用MarkdownIt正确渲染Markdown
            const md = new MarkdownIt({
                html: true,
                linkify: true,
                typographer: true
            })

            let htmlContent = md.render(content)
            console.log('PDF导出 - 渲染后HTML:', htmlContent)

            // 添加内联样式到生成的HTML
            htmlContent = htmlContent
                .replace(/<h1>/g, '<h1 style="color: #2E86C1; font-size: 26px; margin: 25px 0 20px 0; font-weight: bold;">')
                .replace(/<h2>/g, '<h2 style="color: #3498DB; font-size: 22px; margin: 20px 0 15px 0; font-weight: bold;">')
                .replace(/<h3>/g, '<h3 style="color: #5DADE2; font-size: 18px; margin: 15px 0 10px 0; font-weight: bold;">')
                .replace(/<h4>/g, '<h4 style="color: #85C1E9; font-size: 16px; margin: 12px 0 8px 0; font-weight: bold;">')
                .replace(/<p>/g, '<p style="margin: 12px 0; line-height: 1.7; color: #2c3e50;">')
                .replace(/<ul>/g, '<ul style="margin: 15px 0; padding-left: 25px; list-style-type: disc;">')
                .replace(/<ol>/g, '<ol style="margin: 15px 0; padding-left: 25px;">')
                .replace(/<li>/g, '<li style="margin: 6px 0; line-height: 1.6;">')
                .replace(/<strong>/g, '<strong style="font-weight: 600; color: #2c3e50;">')
                .replace(/<em>/g, '<em style="font-style: italic; color: #34495e;">')
                .replace(/<blockquote>/g, '<blockquote style="margin: 15px 0; padding: 10px 20px; border-left: 4px solid #3498db; background: #f8f9fa; font-style: italic;">')
                .replace(/<code>/g, '<code style="background: #f1f2f6; padding: 2px 4px; border-radius: 3px; font-family: monospace; font-size: 14px;">')
                .replace(/<pre>/g, '<pre style="background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto; margin: 15px 0;">')

            // 如果没有内容，添加提示信息
            if (!htmlContent.trim()) {
                htmlContent = '<p style="text-align: center; color: #999; font-style: italic;">暂无行程内容</p>'
            }

            const finalHTML = `
      <div style="max-width: 100%; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;">
        <!-- 标题区域 -->
        <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #3498db;">
          <h1 style="color: #2c3e50; font-size: 32px; margin: 0 0 15px 0; font-weight: bold; letter-spacing: 1px;">
            ${this.tripData.title || '行程单'}
          </h1>
          <div style="color: #7f8c8d; font-size: 16px; font-weight: 500;">
            ${this.tripData.destinationName ? `📍 ${this.tripData.destinationName}` : ''}
            ${this.tripData.days ? ` | 📅 ${this.tripData.days}天` : ''}
            ${this.tripData.mate ? ` | 👥 ${this.tripData.mate}人` : ''}
            ${this.tripData.totalBudget ? ` | 💰 ¥${this.tripData.totalBudget}` : ''}
          </div>
        </div>
        
        <!-- 行程内容 -->
        <div style="font-size: 15px; line-height: 1.8; color: #2c3e50; min-height: 200px;">
          ${htmlContent}
        </div>
        
        <!-- 页脚 -->
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ecf0f1; text-align: center; color: #95a5a6; font-size: 14px;">
          <div style="margin-bottom: 5px;">生成时间：${new Date().toLocaleString('zh-CN')}</div>
          <div style="color: #3498db; font-weight: 500;">GoingTour 智能行程规划</div>
        </div>
      </div>
    `
            
            console.log('PDF导出 - 最终HTML:', finalHTML)
            return finalHTML
    }
}