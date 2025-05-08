class AIChineseWriting extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.hasRendered = false;
        this.container = null;
        this.styleSheet = null;
    }

    connectedCallback() {
        console.log('AIChineseWriting: connectedCallback 執行');
        requestAnimationFrame(() => {
            this.render();
            this.hasRendered = true;
        });
    }

    disconnectedCallback() {
        console.log('AIChineseWriting: disconnectedCallback 執行');
        this.hasRendered = false;
    }

    static get observedAttributes() {
        return ['line-spacing', 'src'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        console.log(`AIChineseWriting: attributeChangedCallback 執行，屬性=${name}, 舊值=${oldValue}, 新值=${newValue}`);
        if (this.isConnected) {
            this.render();
        }
    }

    async render() {
        console.log('AIChineseWriting: render 開始');
        const lineSpacing = parseInt(this.getAttribute('line-spacing')) || 15;
        const src = this.getAttribute('src');

        // 初始化影子 DOM（僅在首次渲染時）
        if (!this.container) {
            this.styleSheet = document.createElement('style');
            this.container = document.createElement('div');
            this.container.className = 'container';
            this.shadowRoot.appendChild(this.styleSheet);
            this.shadowRoot.appendChild(this.container);

            this.styleSheet.textContent = `
                .container {
                    height: 100%;
                    width: 100%;
                    display: flex;
                    flex-direction: row-reverse;
                    justify-content: var(--justify, flex-start);
                    align-items: stretch;
                }
                .chinese-line {
                    writing-mode: vertical-lr;
                    padding: 5px;
                    box-sizing: border-box;
                    height: 100%;
                    width: auto;
                    margin-right: ${lineSpacing}px;
                    position: relative;
                    overflow: hidden;
                }
                .text-content {
                    display: inline-block;
                    width: 100%;
                    white-space: nowrap;
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                    text-rendering: optimizeLegibility;
                }
            `;
        }

        // 清空容器內容（僅清空 .chinese-line）
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }

        if (src) {
            try {
                const response = await fetch(src);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                if (!Array.isArray(data)) throw new Error('JSON data must be an array');
                console.log('AIChineseWriting: 從 JSON 渲染，數據=', JSON.stringify(data));
                this.renderFromJSON(data, this.container);
            } catch (error) {
                console.error('AIChineseWriting: 載入 JSON 失敗:', error);
                this.container.textContent = 'Error loading JSON data';
            }
        } else {
            const chineseWritings = this.querySelectorAll('chinese-writing');
            console.log(`AIChineseWriting: 找到 ${chineseWritings.length} 個 <chinese-writing> 元素`);
            this.renderFromElements(chineseWritings, this.container);
        }

        // 應用對齊方式
        const parent = this.closest('red-head, red-tail');
        const parentAlign = parent ? parent.getAttribute('align') || 'right' : 'right';
        console.log(`AIChineseWriting: parentAlign=${parentAlign}, parent=${parent ? parent.tagName : 'none'}`);
        let justifyContent;
        switch (parentAlign) {
            case 'left':
                justifyContent = 'flex-end';
                break;
            case 'center':
                justifyContent = 'center';
                break;
            case 'right':
            default:
                justifyContent = 'flex-start';
                break;
        }
        console.log(`AIChineseWriting: 設置 --justify=${justifyContent}`);
        this.container.style.setProperty('--justify', justifyContent);
        console.log('AIChineseWriting: render 完成');
    }

    renderFromElements(chineseWritings, container) {
        chineseWritings.forEach((writing, index) => {
            const isLocked = writing.getAttribute('data-locked') === 'true';
            const text = isLocked ? writing.textContent.trim() : writing.getAttribute('text') || writing.textContent.trim();
            console.log(`AIChineseWriting: 渲染 <chinese-writing> #${index}, text=${text}, locked=${isLocked}`);
            this.createWritingLine(text, {
                color: writing.getAttribute('color'),
                size: writing.getAttribute('size'),
                spacing: writing.getAttribute('spacing')
            }, index, container);
        });
    }

    renderFromJSON(data, container) {
        data.forEach((item, index) => {
            console.log(`AIChineseWriting: 從 JSON 渲染 #${index}, text=${item.text}`);
            this.createWritingLine(item.text || '', {
                color: item.color,
                size: item.size,
                spacing: item.spacing
            }, index, container);
        });
    }

    createWritingLine(text, { color, size, spacing }, index, container) {
        const lineDiv = document.createElement('div');
        lineDiv.className = 'chinese-line';

        const textDiv = document.createElement('div');
        textDiv.className = 'text-content';

        const textColor = color || 'black';
        const textSize = parseInt(size) || 100;
        const textSpacing = spacing || '0';

        lineDiv.style.color = textColor;
        textDiv.style.fontSize = `${textSize}px`;
        lineDiv.style.minWidth = `${textSize + 10}px`;

        if (textSpacing === 'center') {
            textDiv.style.top = '50%';
            textDiv.style.transform = 'translateY(-50%)';
        } else if (textSpacing === 'end') {
            textDiv.style.top = 'auto';
            textDiv.style.bottom = '0';
            textDiv.style.maxHeight = '100%';
            textDiv.style.overflow = 'hidden';
        } else {
            const spacingValue = parseInt(textSpacing) || 0;
            textDiv.style.top = `${spacingValue}px`;
        }

        textDiv.textContent = text;
        lineDiv.appendChild(textDiv);
        container.appendChild(lineDiv);
    }
}

class ChineseWriting extends HTMLElement {
    constructor() {
        super();
    }
}

customElements.define('ai-chinese-writing', AIChineseWriting);
customElements.define('chinese-writing', ChineseWriting);