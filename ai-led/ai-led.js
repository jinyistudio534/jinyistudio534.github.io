class AiLed extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        const template = document.createElement('template');
        template.innerHTML = `
            <div class="container">
                <div class="led"></div>
                <div class="label">
                    <slot></slot>
                </div>
            </div>
        `;
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'ai-led.css';
        this.shadowRoot.appendChild(link);
        
        this.blinkInterval = null;

        // Add click event listener to container
        const container = this.shadowRoot.querySelector('.container');
        container.addEventListener('click', () => this.handleClick());
    }

    connectedCallback() {
        this.render();
    }

    disconnectedCallback() {
        if (this.blinkInterval) {
            clearInterval(this.blinkInterval);
        }
    }

    static get observedAttributes() {
        return ['led-shape', 'led-size', 'label-position', 'label-size', 
                'led-color', 'led-state', 'blink-on-time', 'blink-off-time', 
                'bevel-type', 'led-border', 'container-width', 'container-height', 
                'border-radius', 'click-event'];
    }

    attributeChangedCallback(name) {
        if (name === 'led-state' || name === 'blink-on-time' || name === 'blink-off-time') {
            this.updateLedState();
        }
        this.render();
    }

    render() {
        const ledShape = this.getAttribute('led-shape') || 'circle';
        const ledSize = parseInt(this.getAttribute('led-size')) || 24;
        const labelPosition = this.getAttribute('label-position') || 'bottom';
        const labelSize = parseInt(this.getAttribute('label-size')) || 14;
        const bevelType = this.getAttribute('bevel-type') || 'none'; // Default to none
        const ledColor = this.getAttribute('led-color') || 'green';
        const ledState = this.getAttribute('led-state') || 'on';
        const ledBorder = this.getAttribute('led-border') || 'solid'; // Default to solid
        const containerWidth = parseInt(this.getAttribute('container-width')) || 80; // Default to 80px
        const containerHeight = parseInt(this.getAttribute('container-height')) || 80; // Default to 80px
        const borderRadius = parseInt(this.getAttribute('border-radius')) || 0; // Default to 0px

        const container = this.shadowRoot.querySelector('.container');
        const led = this.shadowRoot.querySelector('.led');
        const label = this.shadowRoot.querySelector('.label');

        // Container styling
        container.style.width = `${containerWidth}px`;
        container.style.height = `${containerHeight}px`;
        
        // Bevel type (container)
        container.classList.remove('none', 'inner', 'outer', 'solid');
        container.classList.add(bevelType);

        // Apply border-radius only when bevel-type is not "none"
        if (bevelType !== 'none') {
            container.style.borderRadius = `${borderRadius}px`;
        } else {
            container.style.borderRadius = '0px'; // Reset for "none"
        }

        // LED styling
        led.style.width = `${ledSize}px`;
        led.style.height = `${ledSize}px`;
        led.style.borderRadius = ledShape === 'circle' ? '50%' : '0';
        led.dataset.onColor = ledColor;
        led.dataset.offColor = '#666';

        // LED border type
        led.classList.remove('solid', 'inner', 'outer');
        led.classList.add(ledBorder);

        // Label styling
        label.style.fontSize = `${labelSize}px`;
        label.style.width = '100%'; // Full width to ensure centering works

        // Positioning
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.alignItems = 'center'; // Ensures horizontal centering of both LED and label
        
        if (labelPosition === 'top') {
            led.style.order = '2';
            label.style.order = '1';
        } else {
            led.style.order = '1';
            label.style.order = '2';
        }

        this.updateLedState();
    }

    updateLedState() {
        const led = this.shadowRoot.querySelector('.led');
        const state = this.getAttribute('led-state') || 'on';
        const onTime = parseInt(this.getAttribute('blink-on-time')) || 500;
        const offTime = parseInt(this.getAttribute('blink-off-time')) || 500;

        if (this.blinkInterval) {
            clearInterval(this.blinkInterval);
            this.blinkInterval = null;
        }

        switch (state) {
            case 'on':
                led.style.backgroundColor = led.dataset.onColor;
                led.style.opacity = '1';
                break;
            case 'off':
                led.style.backgroundColor = led.dataset.offColor;
                led.style.opacity = '1';
                break;
            case 'blink':
                let isOn = true;
                led.style.backgroundColor = led.dataset.onColor;
                led.style.opacity = '1';
                this.blinkInterval = setInterval(() => {
                    isOn = !isOn;
                    led.style.backgroundColor = isOn ? led.dataset.onColor : led.dataset.offColor;
                    led.style.opacity = '1';
                }, isOn ? onTime : offTime);
                break;
            default:
                led.style.backgroundColor = led.dataset.onColor;
                led.style.opacity = '1';
        }
    }

    handleClick() {
        const clickEventName = this.getAttribute('click-event');
        if (clickEventName) {
            const event = new CustomEvent(clickEventName, {
                bubbles: true,
                composed: true,
                detail: {
                    component: this,
                    timestamp: Date.now()
                }
            });
            this.dispatchEvent(event);
        }
    }
}

customElements.define('ai-led', AiLed);