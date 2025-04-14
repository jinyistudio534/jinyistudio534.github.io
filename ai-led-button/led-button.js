class LedButton extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      const template = document.createElement('template');
      template.innerHTML = `
        <div class="button">
          <div class="led" if-led></div>
          <div class="label">
            <slot></slot>
          </div>
        </div>
      `;
      this.shadowRoot.appendChild(template.content.cloneNode(true));
      
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'led-button.css';
      this.shadowRoot.appendChild(link);
  
      this.ledState = 'off';
      this.blinkInterval = null;
      const button = this.shadowRoot.querySelector('.button');
      const led = this.shadowRoot.querySelector('.led');
  
      button.addEventListener('click', () => this.handleClick());
      button.addEventListener('mousedown', () => {
        const baseTransform = this.getBaseTransform(led);
        led.style.transform = `${baseTransform} translate(2px, 0)`; // LED 向右移動
      });
      button.addEventListener('mouseup', () => {
        led.style.transform = this.getBaseTransform(led); // LED 恢復
      });
    }
  
    connectedCallback() {
      this.render();
    }
  
    static get observedAttributes() {
      return ['led-shape', 'led-color', 'led-off-color', 'led-size', 'led-align', 
              'text-align', 'font-size', 'led-state', 'radius-size', 'radius-corners',
              'effect-type', 'bevel-depth', 'button-id', 'button-size', 'button-width', 'button-height'];
    }
  
    attributeChangedCallback(name, oldValue, newValue) {
      if (name === 'led-state') {
        this.updateLedState(newValue);
      }
      this.render();
    }
  
    render() {
      const ledShape = this.getAttribute('led-shape');
      const ledColor = this.getAttribute('led-color') || 'green';
      const ledOffColor = this.getAttribute('led-off-color') || '#666';
      const ledSize = this.getAttribute('led-size') || '8';
      const ledAlign = this.getAttribute('led-align') || 'top-center';
      const textAlign = this.getAttribute('text-align') || 'center';
      const fontSize = this.getAttribute('font-size') || '14';
      const ledState = this.getAttribute('led-state') || 'off';
      const radiusSize = this.getAttribute('radius-size') || '0';
      const radiusCorners = this.getAttribute('radius-corners') || 'all';
      const effectType = this.getAttribute('effect-type') || 'bevel';
      const bevelDepth = this.getAttribute('bevel-depth') || '3';
      const buttonId = this.getAttribute('button-id');
      const buttonSize = this.getAttribute('button-size') || '100';
      const buttonWidth = this.getAttribute('button-width');
      const buttonHeight = this.getAttribute('button-height');
  
      let ledHAlign, ledVAlign;
      if (ledAlign === 'top-center') {
        ledHAlign = 'center';
        ledVAlign = 'top';
      } else if (ledAlign === 'bottom-center') {
        ledHAlign = 'center';
        ledVAlign = 'bottom';
      } else {
        [ledHAlign, ledVAlign] = ledAlign.split('-');
      }
  
      const led = this.shadowRoot.querySelector('.led');
      const label = this.shadowRoot.querySelector('.label');
      const button = this.shadowRoot.querySelector('.button');
  
      if (buttonWidth && buttonHeight) {
        button.style.setProperty('--button-width', `${buttonWidth}px`);
        button.style.setProperty('--button-height', `${buttonHeight}px`);
      } else {
        button.style.setProperty('--button-width', `${buttonSize}px`);
        button.style.setProperty('--button-height', `${buttonSize}px`);
      }
  
      if (ledShape) {
        led.style.display = 'block';
        led.style.width = `${ledSize}px`;
        led.style.height = `${ledSize}px`;
        led.style.borderRadius = ledShape === 'circle' ? '50%' : '0';
        led.style.transition = 'transform 0.1s ease';
        this.applyPositionStyles(led, ledVAlign, ledHAlign, ledSize);
        led.dataset.onColor = ledColor;
        led.dataset.offColor = ledOffColor;
      } else {
        led.style.display = 'none';
      }
  
      label.style.fontSize = `${fontSize}px`;
      this.applyTextPositionStyles(label, textAlign, fontSize, bevelDepth);
  
      this.applyRadiusStyles(button, radiusSize, radiusCorners);
      this.applyEffectStyles(button, effectType, bevelDepth);
      this.updateLedState(ledState);
  
      if (buttonId) {
        button.dataset.buttonId = buttonId;
      }
    }
  
    applyEffectStyles(button, effectType, bevelDepth) {
      button.style.boxShadow = 'none';
      button.style.borderStyle = 'solid';
      button.style.borderWidth = '2px';
      button.style.borderTopColor = '#333';
      button.style.borderLeftColor = '#333';
      button.style.borderRightColor = '#333';
      button.style.borderBottomColor = '#333';
      button.classList.remove('bevel', 'shadow');
      button.classList.add(effectType);
  
      if (effectType === 'shadow') {
        button.style.boxShadow = `3px 3px 5px rgba(0,0,0,0.3),
                                -2px -2px 4px rgba(255,255,255,0.5)`;
        button.style.borderWidth = '2px';
      } else {
        const depth = `${bevelDepth}px`;
        button.style.borderWidth = depth;
        button.style.borderTopColor = '#fff';
        button.style.borderLeftColor = '#fff';
        button.style.borderRightColor = '#999';
        button.style.borderBottomColor = '#999';
      }
    }
  
    applyRadiusStyles(button, radiusSize, corners) {
      const radius = `${radiusSize}px`;
      if (corners === 'all') {
        button.style.borderRadius = radius;
        return;
      }
      
      const cornerStyles = {
        'border-top-left-radius': '0',
        'border-top-right-radius': '0',
        'border-bottom-left-radius': '0',
        'border-bottom-right-radius': '0'
      };
      
      corners.split('|').forEach(corner => {
        switch(corner.trim()) {
          case 'top-left':
            cornerStyles['border-top-left-radius'] = radius;
            break;
          case 'top-right':
            cornerStyles['border-top-right-radius'] = radius;
            break;
          case 'bottom-left':
            cornerStyles['border-bottom-left-radius'] = radius;
            break;
          case 'bottom-right':
            cornerStyles['border-bottom-right-radius'] = radius;
            break;
        }
      });
      
      Object.assign(button.style, cornerStyles);
    }
    
    updateLedState(state) {
      const led = this.shadowRoot.querySelector('.led');
      if (!led) return;
  
      if (this.blinkInterval) {
        clearInterval(this.blinkInterval);
        this.blinkInterval = null;
      }
  
      this.ledState = state;
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
          led.style.backgroundColor = led.dataset.onColor;
          led.style.opacity = '1';
          this.blinkInterval = setInterval(() => {
            led.style.opacity = led.style.opacity === '1' ? '0' : '1';
          }, 500);
          break;
        default:
          led.style.backgroundColor = led.dataset.offColor;
          led.style.opacity = '1';
      }
    }
  
    handleClick() {
      const event = new CustomEvent('button-click', {
        bubbles: true,
        composed: true,
        detail: { 
          button: this,
          id: this.getAttribute('button-id') || 'Unnamed Button'
        }
      });
      this.dispatchEvent(event);
    }
  
    applyPositionStyles(element, vAlign, hAlign, size = 0) {
      const ledSize = parseInt(size) || 0;
      const margin = 5;
  
      element.style.position = 'absolute';
      element.style.top = '';
      element.style.bottom = '';
      element.style.left = '';
      element.style.right = '';
      element.style.transform = '';
  
      let verticalTransform = '';
      switch (vAlign) {
        case 'top':
          element.style.top = `${margin}px`;
          verticalTransform = '';
          break;
        case 'center':
          element.style.top = '50%';
          verticalTransform = 'translateY(-50%)';
          break;
        case 'bottom':
          element.style.bottom = `${margin}px`;
          verticalTransform = '';
          break;
        default:
          element.style.top = `${margin}px`;
          verticalTransform = '';
      }
  
      let horizontalTransform = '';
      switch (hAlign) {
        case 'left':
          element.style.left = `${margin}px`;
          horizontalTransform = '';
          break;
        case 'center':
          element.style.left = '50%';
          horizontalTransform = 'translateX(-50%)';
          break;
        case 'right':
          element.style.right = `${margin}px`;
          horizontalTransform = '';
          break;
        default:
          element.style.left = '50%';
          horizontalTransform = 'translateX(-50%)';
      }
  
      element.style.transform = `${verticalTransform} ${horizontalTransform}`.trim();
    }
  
    getBaseTransform(led) {
      const ledAlign = this.getAttribute('led-align') || 'top-center';
      let hAlign, vAlign;
  
      if (ledAlign === 'top-center') {
        hAlign = 'center';
        vAlign = 'top';
      } else if (ledAlign === 'bottom-center') {
        hAlign = 'center';
        vAlign = 'bottom';
      } else {
        [hAlign, vAlign] = ledAlign.split('-');
      }
  
      let verticalTransform = '';
      let horizontalTransform = '';
  
      switch (vAlign) {
        case 'center':
          verticalTransform = 'translateY(-50%)';
          break;
      }
  
      switch (hAlign) {
        case 'center':
          horizontalTransform = 'translateX(-50%)';
          break;
      }
  
      return `${verticalTransform} ${horizontalTransform}`.trim();
    }
  
    applyTextPositionStyles(element, align, fontSize, bevelDepth) {
      element.style.position = 'absolute';
      element.style.top = '';
      element.style.bottom = '';
      element.style.left = '';
      element.style.right = '';
      element.style.width = '100%';
      element.style.height = '100%';
      element.style.transform = '';
      element.style.display = 'flex';
      element.style.flexDirection = 'column';
      element.style.padding = `${bevelDepth}px`;
      element.style.textAlign = 'center';
      element.style.boxSizing = 'border-box';
      element.style.transition = 'transform 0.1s ease'; // 文字移動動畫
  
      const paddingOffset = Math.max(parseInt(bevelDepth) - 2, 2);
  
      switch(align) {
        case 'top':
          element.style.alignItems = 'center';
          element.style.justifyContent = 'flex-start';
          element.style.paddingTop = `${paddingOffset}px`;
          element.style.paddingBottom = '0';
          element.style.lineHeight = '1.1';
          break;
        case 'bottom':
          element.style.alignItems = 'center';
          element.style.justifyContent = 'flex-end';
          element.style.paddingBottom = `${paddingOffset}px`;
          element.style.paddingTop = '0';
          element.style.lineHeight = '1.1';
          break;
        case 'right':
          element.style.alignItems = 'flex-end';
          element.style.justifyContent = 'center';
          element.style.paddingRight = `${paddingOffset}px`;
          element.style.textAlign = 'right';
          break;
        case 'left':
          element.style.alignItems = 'flex-start';
          element.style.justifyContent = 'center';
          element.style.paddingLeft = `${paddingOffset}px`;
          element.style.textAlign = 'left';
          break;
        case 'center':
        default:
          element.style.alignItems = 'center';
          element.style.justifyContent = 'center';
          break;
      }
  
      const slot = element.querySelector('slot');
      if (slot) {
        slot.style.display = 'block';
        slot.style.margin = '0';
      }
    }
  }
  
  customElements.define('led-button', LedButton);