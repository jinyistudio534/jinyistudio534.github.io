class AIChineseWriting extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.hasRendered = false;
    }

    connectedCallback() {
        requestAnimationFrame(() => {
            this.render();
            this.hasRendered = true;
        });
    }

    disconnectedCallback() {
        this.hasRendered = false; // 重置渲染狀態
    }

    static get observedAttributes() {
        return ['line-spacing', 'src'];
    }

    attributeChangedCallback() {
        if (this.isConnected) {
            this.render();
        }
    }

    async render() {
        const lineSpacing = parseInt(this.getAttribute('line-spacing')) || 15;
        const src = this.getAttribute('src');
        this.shadowRoot.innerHTML = ''; // 清空 Shadow DOM

        const styleSheet = document.createElement('style');
        const container = document.createElement('div');

        styleSheet.textContent = `
            .container {
                height: 100%;
                width: 100%;
                display: flex;
                flex-direction: row-reverse;
                justify-content: flex-start;
                align-items: stretch;
                min-height: 400px;
            }
            .chinese-line {
                writing-mode: vertical-lr;
                padding: 5px;
                box-sizing: border-box;
                min-height: 400px;
                height: 100%;
                width: auto;
                margin-right: ${lineSpacing}px;
                position: relative;
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

        container.className = 'container';
        this.shadowRoot.appendChild(styleSheet);
        this.shadowRoot.appendChild(container);

        if (src) {
            try {
                const response = await fetch(src);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                if (!Array.isArray(data)) throw new Error('JSON data must be an array');
                this.renderFromJSON(data, container);
            } catch (error) {
                console.error('Error loading JSON:', error);
                container.textContent = 'Error loading JSON data';
            }
        } else {
            const chineseWritings = this.querySelectorAll('chinese-writing');
            this.renderFromElements(chineseWritings, container);
        }
    }

    renderFromElements(chineseWritings, container) {
        chineseWritings.forEach((writing, index) => {
            this.createWritingLine(writing.textContent.trim(), {
                color: writing.getAttribute('color'),
                size: writing.getAttribute('size'),
                spacing: writing.getAttribute('spacing')
            }, index, container);
        });
    }

    renderFromJSON(data, container) {
        data.forEach((item, index) => {
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