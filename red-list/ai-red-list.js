class RedList extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.hasRendered = false;
        this.elementId = `red-list-${Math.random().toString(36).slice(2, 8)}`;
        this.lastAttributes = {};
    }

    connectedCallback() {
        requestAnimationFrame(() => {
            this.render();
            this.hasRendered = true;
        });
    }

    disconnectedCallback() {
        this.hasRendered = false;
    }

    static get observedAttributes() {
        return ['width', 'height', 'peak', 'shape', 'color'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (this.isConnected && oldValue !== newValue) {
            this.render();
        }
    }

    render() {
        const width = parseInt(this.getAttribute('width')) || 180;
        const svgHeight = parseInt(this.getAttribute('height')) || window.innerHeight;
        const peak = parseInt(this.getAttribute('peak')) || 20;
        const shape = this.getAttribute('shape') || 'outer';
        const color = this.getAttribute('color') || '#00ff00';

        const screenHeight = window.innerHeight;

        const currentAttributes = { width, svgHeight, peak, shape, color, screenHeight };
        if (JSON.stringify(currentAttributes) === JSON.stringify(this.lastAttributes)) {
            console.log(`[${new Date().toISOString()}] RedList (id: ${this.elementId}): No attribute change, skipping render`);
            return;
        }
        this.lastAttributes = currentAttributes;

        console.log(`[${new Date().toISOString()}] RedList (id: ${this.elementId}): shape=${shape}, color=${color}, attributes: ${JSON.stringify(currentAttributes)}`);

        const redHead = this.querySelector('red-head');
        if (!redHead) {
            console.error(`[${new Date().toISOString()}] red-head is required in red-list (id: ${this.elementId}, width: ${width}, svgHeight: ${svgHeight})`);
            this.remove();
            return;
        }

        const redTail = this.querySelector('red-tail');
        const headClone = redHead.cloneNode(true);
        const tailClone = redTail ? redTail.cloneNode(true) : null;

        const headSpacing = parseInt(headClone.getAttribute('spacing')) || 10;
        const headHeight = parseInt(headClone.getAttribute('height')) || 250;
        const headAlign = headClone.getAttribute('align') || 'center';
        const tailSpacing = tailClone ? (parseInt(tailClone.getAttribute('spacing')) || 10) : 0;
        const tailAlign = tailClone ? (tailClone.getAttribute('align') || 'center') : 'center';
        // 修正：當 shape="inner" 或 "outer" 時，減去 peak 高度
        const adjustedTailHeight = svgHeight - headHeight - headSpacing - tailSpacing - (shape === 'inner' || shape === 'outer' ? peak : 0);

        this.shadowRoot.innerHTML = '';

        const styleSheet = document.createElement('style');
        const container = document.createElement('div');
        const background = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

        background.setAttribute('class', 'background');
        background.setAttribute('width', width);
        background.setAttribute('height', svgHeight);
        background.setAttribute('viewBox', `0 0 ${width} ${svgHeight}`);
        background.setAttribute('preserveAspectRatio', 'none');
        background.setAttribute('data-timestamp', Date.now());
        background.setAttribute('id', `svg-${this.elementId}`);

        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
        clipPath.setAttribute('id', `clip-${this.elementId}`);
        const clipRect = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        let clipD;
        if (shape === 'inner') {
            clipD = `M 0,0 H ${width} V ${svgHeight} L ${width / 2},${svgHeight - peak} L 0,${svgHeight} Z`;
        } else if (shape === 'outer') {
            clipD = `M 0,0 H ${width} V ${svgHeight - peak} L ${width / 2},${svgHeight} L 0,${svgHeight - peak} Z`;
        } else {
            clipD = `M 0,0 H ${width} V ${svgHeight} H 0 Z`;
        }
        clipRect.setAttribute('d', clipD);
        clipPath.appendChild(clipRect);
        defs.appendChild(clipPath);
        background.setAttribute('clip-path', `url(#clip-${this.elementId})`);
        background.appendChild(defs);

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        let d;
        if (shape === 'inner') {
            d = `M 0,0 H ${width} V ${svgHeight} L ${width / 2},${svgHeight - peak} L 0,${svgHeight} Z`;
        } else if (shape === 'outer') {
            d = `M 0,0 H ${width} V ${svgHeight - peak} L ${width / 2},${svgHeight} L 0,${svgHeight - peak} Z`;
        } else {
            d = `M 0,0 H ${width} V ${svgHeight} H 0 Z`;
        }
        path.setAttribute('d', d);
        path.setAttribute('fill', color === 'transparent' ? 'none' : color);
        background.appendChild(path);

        console.log(`[${new Date().toISOString()}] RedList (id: ${this.elementId}): SVG path=${d}`);
        console.log(`[${new Date().toISOString()}] RedList (id: ${this.elementId}): SVG clipPath=${clipD}`);

        styleSheet.textContent = `
            :host {
                display: block;
                width: ${width}px !important;
                height: ${svgHeight}px !important;
                overflow: hidden !important;
                margin: 0 !important;
                padding: 0 !important;
                background-color: transparent !important;
                border: none !important;
                isolation: isolate !important;
            }
            .container {
                position: relative;
                width: ${width}px !important;
                height: ${svgHeight}px !important;
                overflow: hidden !important;
                background-color: transparent !important;
                margin: 0 !important;
                padding: 0 !important;
                display: flex;
                flex-direction: column;
            }
            .background {
                position: absolute;
                top: 0;
                left: 0;
                width: ${width}px !important;
                height: ${svgHeight}px !important;
                z-index: 0;
            }
            .content {
                position: relative;
                width: ${width}px !important;
                height: ${svgHeight}px !important;
                z-index: 1;
                background-color: transparent !important;
                display: flex;
                flex-direction: column;
            }
            red-head {
                position: relative;
                top: ${headSpacing}px !important;
                left: 0;
                width: ${width}px !important;
                min-width: ${width}px !important;
                max-width: ${width}px !important;
                height: ${headHeight}px !important;
                min-height: ${headHeight}px !important;
                max-height: ${headHeight}px !important;
                overflow: hidden !important;
                --align: ${headAlign};
                margin: 0 !important;
                padding: 0 !important;
                background-color: transparent !important;
                box-sizing: border-box !important;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
            }
            red-tail {
                position: relative;
                top: ${tailSpacing}px !important;
                left: 0;
                width: ${width}px !important;
                min-width: ${width}px !important;
                max-width: ${width}px !important;
                height: ${adjustedTailHeight}px !important; /* 使用修正後的高度 */
                overflow: hidden !important;
                --align: ${tailAlign};
                padding: ${shape === 'inner' || shape === 'outer' ? `${peak}px 0 0 0` : '0'} !important; /* 為尖角預留空間 */
                margin: 0 !important;
                background-color: transparent !important;
                box-sizing: border-box !important;
                display: flex;
                flex-direction: column;
                justify-content: flex-start;
                align-items: center;
            }
            ai-chinese-writing {
                width: 100% !important;
                height: 100% !important;
                box-sizing: border-box !important;
                line-height: 1.2 !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: var(--align, center) !important;
                align-items: var(--align, center) !important;
                padding: 5px !important;
                overflow: hidden !important;
                margin: 0 !important;
                background-color: transparent !important;
            }
            chinese-writing {
                display: block;
                text-align: var(--align, center);
                margin: 0 !important;
                padding: 0 !important;
                font-size: min(calc(attr(size px, 30) * 0.8), 50px) !important;
                color: attr(color, #000000);
                line-height: 1.2;
                max-height: 100% !important;
                overflow: hidden !important;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        `;

        container.className = 'container';
        background.alt = 'Red List Background';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'content';
        contentDiv.appendChild(headClone);
        if (tailClone) {
            contentDiv.appendChild(tailClone);
        }

        container.appendChild(background);
        container.appendChild(contentDiv);
        this.shadowRoot.appendChild(styleSheet);
        this.shadowRoot.appendChild(container);

        setTimeout(() => {
            background.style.display = 'none';
            background.offsetHeight;
            background.style.display = '';
        }, 100);

        setTimeout(() => {
            const computedContainerStyle = getComputedStyle(container);
            const computedBackgroundStyle = getComputedStyle(background);
            const computedHostStyle = getComputedStyle(this);
            const parentStyle = this.parentElement ? getComputedStyle(this.parentElement) : {};
            const headStyle = headClone ? getComputedStyle(headClone) : {};
            const tailStyle = tailClone ? getComputedStyle(tailClone) : {};
            console.log(`[${new Date().toISOString()}] RedList (id: ${this.elementId}): Final SVG=${background.outerHTML}`);
            console.log(`[${new Date().toISOString()}] RedList (id: ${this.elementId}): Final attributes=${JSON.stringify({ shape, peak, color, width, svgHeight, screenHeight, headHeight, adjustedTailHeight })}`);
            console.log(`[${new Date().toISOString()}] RedList (id: ${this.elementId}): Container computed style=width: ${computedContainerStyle.width}, height: ${computedContainerStyle.height}, boundingRect=${JSON.stringify(container.getBoundingClientRect())}`);
            console.log(`[${new Date().toISOString()}] RedList (id: ${this.elementId}): Background computed style=width: ${computedBackgroundStyle.width}, height: ${computedBackgroundStyle.height}, boundingRect=${JSON.stringify(background.getBoundingClientRect())}`);
            console.log(`[${new Date().toISOString()}] RedList (id: ${this.elementId}): Host computed style=width: ${computedHostStyle.width}, height: ${computedHostStyle.height}, boundingRect=${JSON.stringify(this.getBoundingClientRect())}`);
            console.log(`[${new Date().toISOString()}] RedList (id: ${this.elementId}): Parent computed style=width: ${parentStyle.width || 'N/A'}, height: ${parentStyle.height || 'N/A'}, boundingRect=${JSON.stringify(this.parentElement?.getBoundingClientRect() || {})}`);
            console.log(`[${new Date().toISOString()}] RedList (id: ${this.elementId}): Head computed style=width: ${headStyle.width || 'N/A'}, height: ${headStyle.height || 'N/A'}, boundingRect=${JSON.stringify(headClone?.getBoundingClientRect() || {})}`);
            console.log(`[${new Date().toISOString()}] RedList (id: ${this.elementId}): Tail computed style=width: ${tailStyle.width || 'N/A'}, height: ${tailStyle.height || 'N/A'}, boundingRect=${JSON.stringify(tailClone?.getBoundingClientRect() || {})}`);
            console.log(`[${new Date().toISOString()}] RedList (id: ${this.elementId}): SVG path bounding box=${JSON.stringify(path.getBBox())}`);
        }, 500);
    }
}

class RedHead extends HTMLElement {
    constructor() {
        super();
    }
}

class RedTail extends HTMLElement {
    constructor() {
        super();
    }
}

customElements.define('red-list', RedList);
customElements.define('red-head', RedHead);
customElements.define('red-tail', RedTail);