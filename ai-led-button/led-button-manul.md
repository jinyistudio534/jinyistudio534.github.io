感謝你的確認！很高興聽到所有問題都解決了（`left-center`、`right-center`、`top-center` 和 `bottom-center` 的位置都正確，且按下時 LED 向右移動也 OK）。下面我會提供完整的 `led-button` 自定義元素的**使用說明**和**範例**，讓你能清楚了解如何使用這個組件，包括所有屬性、功能和樣式。

---

## `led-button` 使用說明

### 概述

`led-button` 是一個自定義的 HTML 元素，提供帶有 LED 指示燈的按鈕功能。它支援多種樣式配置，包括 LED 的形狀、顏色、位置、大小，以及按鈕的邊框效果、圓角和文字對齊。按下按鈕時，LED 會向右移動 2px，並觸發自定義事件。

### 屬性

以下是 `led-button` 支援的所有屬性及其說明：

| 屬性名稱             | 描述                            | 預設值          | 可選值示例                                                        |
| ---------------- | ----------------------------- | ------------ | ------------------------------------------------------------ |
| `led-shape`      | LED 的形狀                       | 无（隱藏）        | `circle`, `square`                                           |
| `led-color`      | LED 開啟時的顏色                    | `green`      | `#ff0000`, `blue`, `rgb(255,0,0)`                            |
| `led-off-color`  | LED 關閉時的顏色                    | `#666`       | `#333`, `gray`, `rgba(0,0,0,0.5)`                            |
| `led-size`       | LED 的大小（寬高，單位：px）             | `8`          | `10`, `12`, `20`                                             |
| `led-align`      | LED 的對齊位置                     | `top-center` | `left-center`, `right-center`, `top-center`, `bottom-center` |
| `text-align`     | 文字的對齊方式                       | `center`     | `top`, `bottom`, `left`, `right`, `center`                   |
| `font-size`      | 文字大小（單位：px）                   | `14`         | `12`, `16`, `20`                                             |
| `led-state`      | LED 的狀態                       | `off`        | `on`, `off`, `blink`                                         |
| `radius-size`    | 按鈕圓角大小（單位：px）                 | `0`          | `5`, `10`, `20`                                              |
| `radius-corners` | 指定哪些角落有圓角                     | `all`        | `all`, `top-left\|top-right`, `bottom-left`                  |
| `effect-type`    | 按鈕的邊框效果                       | `bevel`      | `bevel`, `shadow`                                            |
| `bevel-depth`    | 邊框效果的深度（單位：px）                | `3`          | `2`, `5`, `10`                                               |
| `button-id`      | 按鈕的唯一識別符                      | 无            | `btn1`, `start-button`                                       |
| `button-size`    | 按鈕的寬高（單位：px，若未指定寬高則使用）        | `100`        | `80`, `120`, `150`                                           |
| `button-width`   | 按鈕的寬度（單位：px，覆蓋 `button-size`） | 无            | `120`, `200`                                                 |
| `button-height`  | 按鈕的高度（單位：px，覆蓋 `button-size`） | 无            | `40`, `60`                                                   |

### 功能

1. **LED 指示燈**：
   
   - 可配置形狀（圓形或方形）、顏色（開啟和關閉時）、大小和位置。
   - 支援三種狀態：`on`（亮）、`off`（暗）、`blink`（閃爍，每 500ms 切換一次）。

2. **按下效果**：
   
   - 按下按鈕時，LED 向右移動 2px，鬆開後恢復原位。

3. **事件**：
   
   - 點擊按鈕時觸發自定義事件 `button-click`，攜帶按鈕的 `button-id` 和元素引用。

4. **樣式**：
   
   - 支援圓角配置（全部或指定角落）。
   - 支援兩種邊框效果：`bevel`（斜面效果）和 `shadow`（陰影效果）。

---

## 使用範例

以下是完整的範例，展示如何使用 `led-button`，包括 HTML、CSS 和 JavaScript 文件。

### 檔案結構

```
project/
├── index.html
├── led-button.js
├── led-button.css
```

### 1. `index.html`

```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <title>LED Button Demo</title>
  <link rel="stylesheet" href="led-button.css">
  <style>
    body {
      padding: 20px;
      background-color: #f5f5f5;
      font-family: Arial, sans-serif;
    }
    .button-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      max-width: 400px;
      margin: 20px auto;
    }
    led-button {
      display: block;
    }
  </style>
</head>
<body>
  <h1>LED Button 示例</h1>
  <div class="button-grid">
    <!-- 左中對齊，綠色 LED，開啟狀態 -->
    <led-button 
      led-shape="circle" 
      led-color="green" 
      led-size="10" 
      led-align="left-center" 
      text-align="center" 
      font-size="14" 
      button-size="100" 
      led-state="on" 
      button-id="btn-left">Left Center</led-button>

    <!-- 右中對齊，紅色 LED，閃爍狀態 -->
    <led-button 
      led-shape="circle" 
      led-color="red" 
      led-size="10" 
      led-align="right-center" 
      text-align="center" 
      font-size="14" 
      button-size="100" 
      led-state="blink" 
      button-id="btn-right">Right Center</led-button>

    <!-- 頂部居中，藍色 LED，關閉狀態，圓角 -->
    <led-button 
      led-shape="circle" 
      led-color="blue" 
      led-size="10" 
      led-align="top-center" 
      text-align="center" 
      font-size="14" 
      button-size="100" 
      led-state="off" 
      radius-size="10" 
      radius-corners="all" 
      button-id="btn-top">Top Center</led-button>

    <!-- 底部居中，黃色 LED，開啟狀態，自定義大小 -->
    <led-button 
      led-shape="square" 
      led-color="yellow" 
      led-size="12" 
      led-align="bottom-center" 
      text-align="bottom" 
      font-size="16" 
      button-width="120" 
      button-height="60" 
      led-state="on" 
      effect-type="shadow" 
      button-id="btn-bottom">Bottom Center</led-button>
  </div>

  <script src="led-button.js"></script>
  <script>
    // 監聽 button-click 事件
    document.addEventListener('button-click', (e) => {
      const { id } = e.detail;
      console.log(`Button clicked: ${id}`);
    });
  </script>
</body>
</html>
```

### 2. `led-button.js`

```javascript
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
      led.style.transform = `${baseTransform} translate(2px, 0)`; // 只向右移動
    });
    button.addEventListener('mouseup', () => {
      this.render(); // 恢復原始位置
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
```

### 3. `led-button.css`

```css
.button {
  position: relative;
  width: var(--button-width);
  height: var(--button-height);
  background-color: #e0e0e0;
  cursor: pointer;
  user-select: none;
}

.led {
  position: absolute;
  transition: transform 0.1s ease;
}

.label {
  color: #333;
}

.bevel {
  background-color: #e0e0e0;
}

.shadow {
  background-color: #e0e0e0;
}
```

---

## 範例說明

### 效果展示

1. **`Left Center` 按鈕**：
   
   - LED 在左側垂直居中，綠色，處於開啟狀態。
   - 文字居中顯示。

2. **`Right Center` 按鈕**：
   
   - LED 在右側垂直居中，紅色，處於閃爍狀態。
   - 文字居中顯示。

3. **`Top Center` 按鈕**：
   
   - LED 在頂部水平居中，藍色，處於關閉狀態。
   - 按鈕有 10px 圓角。

4. **`Bottom Center` 按鈕**：
   
   - LED 在底部水平居中，黃色，方形，處於開啟狀態。
   - 按鈕大小為 120x60px，使用陰影效果，文字靠底部對齊。

### 操作

- **點擊按鈕**：LED 向右移動 2px，同時在控制台輸出按鈕的 `button-id`。
- **鬆開按鈕**：LED 回到原始位置。
- **動態修改**：可以使用 JavaScript 修改屬性，例如：
  
  ```javascript
  document.querySelector('#btn-left').setAttribute('led-state', 'blink');
  ```

---

## 注意事項

1. **依賴性**：
   
   - 確保 `led-button.js` 和 `led-button.css` 在同一目錄下，或調整 `link.href` 路徑。

2. **瀏覽器支援**：
   
   - 需要支援 Web Components（現代瀏覽器均支援）。

3. **自定義樣式**：
   
   - 可通過外部 CSS 覆蓋 `.button`、`.led` 或 `.label` 的樣式，但避免影響定位屬性。

---

希望這份完整的使用說明和範例對你有幫助！如果還有任何問題或需要進一步調整（例如改變 LED 移動方向、間距等），隨時告訴我！謝謝你的耐心配合，讓我們一起完善了這個組件！
