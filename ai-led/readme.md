### `ai-led` 元件使用說明

`ai-led` 是一個自訂的 HTML Web Component，用於模擬 LED 指示燈的行為。它支援多種外觀和行為的客製化，例如形狀、大小、顏色、閃爍狀態、邊框樣式等，並可透過點擊觸發自訂事件。以下是使用該元件時的詳細說明。

#### 1. **基本結構**

在 HTML 中使用 `<ai-led>` 標籤，並透過屬性設定其外觀和行為。元件需要搭配 `ai-led.js` 和 `ai-led.css` 檔案來運作。

```html
<ai-led led-shape="circle" led-size="24" led-color="green" led-state="on">Label</ai-led>
```

- `<slot>` 內的文字（例如 "Label"）會顯示為 LED 的標籤。

#### 2. **可用屬性**

以下是 `ai-led` 元件支援的所有屬性及其說明：

| 屬性名稱               | 說明              | 預設值      | 可選值範例                             |
| ------------------ | --------------- | -------- | --------------------------------- |
| `led-shape`        | LED 的形狀         | `circle` | `circle`, `square`                |
| `led-size`         | LED 的大小（單位：像素）  | `24`     | 任意正整數（如 `30`）                     |
| `label-position`   | 標籤相對於 LED 的位置   | `bottom` | `top`, `bottom`                   |
| `label-size`       | 標籤文字大小（單位：像素）   | `14`     | 任意正整數（如 `16`）                     |
| `led-color`        | LED 開啟時的顏色      | `green`  | 任何 CSS 顏色（如 `red`）                |
| `led-state`        | LED 的狀態         | `on`     | `on`, `off`, `blink`              |
| `blink-on-time`    | 閃爍時開啟的時間（單位：毫秒） | `500`    | 任意正整數（如 `300`）                    |
| `blink-off-time`   | 閃爍時關閉的時間（單位：毫秒） | `500`    | 任意正整數（如 `700`）                    |
| `bevel-type`       | 容器邊框的立體效果       | `none`   | `none`, `inner`, `outer`, `solid` |
| `led-border`       | LED 的邊框樣式       | `solid`  | `solid`, `inner`, `outer`         |
| `container-width`  | 容器寬度（單位：像素）     | `80`     | 任意正整數（如 `100`）                    |
| `container-height` | 容器高度（單位：像素）     | `80`     | 任意正整數（如 `120`）                    |
| `border-radius`    | 容器的圓角半徑（單位：像素）  | `0`      | 任意正整數（如 `10`）                     |
| `click-event`      | 點擊時觸發的自訂事件名稱    | 无        | 任意字串（如 `status-clicked`）          |

#### 3. **事件處理**

- 當設定了 `click-event` 屬性時，點擊元件會觸發一個自訂事件。
- 事件物件包含 `detail` 屬性，提供元件的參考和時間戳。

#### 4. **樣式檔案**

- 元件依賴外部 CSS 檔案 `ai-led.css`，用於定義容器、LED 和標籤的樣式。
- 確保將 `ai-led.css` 放在與 HTML 相同的目錄中，或調整路徑。

#### 5. **腳本檔案**

- 元件需要 `ai-led.js` 檔案來定義其行為。
- 在 HTML 中引入 `<script src="ai-led.js"></script>`。

---

### 使用範例

以下是一些實際使用 `ai-led` 元件的範例，展示不同配置和功能的應用。

#### 範例 1：基本的綠色圓形 LED

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Basic LED</title>
    <link rel="stylesheet" href="ai-led.css">
</head>
<body>
    <ai-led 
        led-shape="circle" 
        led-size="24" 
        led-color="green" 
        led-state="on" 
        label-position="bottom">Status</ai-led>
    <script src="ai-led.js"></script>
</body>
</html>
```

- 顯示一個綠色的圓形 LED，標籤 "Status" 在下方。

#### 範例 2：紅色方形 LED 帶內凹邊框

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Red Square LED</title>
    <link rel="stylesheet" href="ai-led.css">
</head>
<body>
    <ai-led 
        led-shape="square" 
        led-size="30" 
        led-color="red" 
        led-state="off" 
        label-position="top" 
        bevel-type="inner" 
        led-border="inner">Error</ai-led>
    <script src="ai-led.js"></script>
</body>
</html>
```

- 顯示一個紅色的方形 LED（關閉狀態），標籤 "Error" 在上方，容器和 LED 都有內凹邊框效果。

#### 範例 3：藍色閃爍 LED 帶事件

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Blinking LED with Event</title>
    <link rel="stylesheet" href="ai-led.css">
    <style>
        body { padding: 20px; }
    </style>
</head>
<body>
    <ai-led 
        led-shape="circle" 
        led-size="20" 
        led-color="blue" 
        led-state="blink" 
        blink-on-time="300" 
        blink-off-time="700" 
        label-position="bottom" 
        bevel-type="solid" 
        led-border="outer" 
        click-event="power-clicked">Power</ai-led>
    <script src="ai-led.js"></script>
    <script>
        document.addEventListener('power-clicked', (e) => {
            console.log('Power LED clicked!', e.detail);
        });
    </script>
</body>
</html>
```

- 顯示一個藍色的圓形 LED，以 300ms 開啟、700ms 關閉的頻率閃爍。
- 點擊時會在控制台輸出事件資訊。

#### 範例 4：多個 LED 的網格佈局

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>LED Grid</title>
    <link rel="stylesheet" href="ai-led.css">
    <style>
        .led-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            max-width: 400px;
            margin: 20px auto;
        }
    </style>
</head>
<body>
    <div class="led-grid">
        <ai-led led-shape="circle" led-size="24" led-color="green" led-state="on">Status</ai-led>
        <ai-led led-shape="square" led-size="30" led-color="red" led-state="off">Error</ai-led>
        <ai-led led-shape="circle" led-size="20" led-color="blue" led-state="blink">Power</ai-led>
        <ai-led led-shape="square" led-size="24" led-color="yellow" led-state="blink">Warning</ai-led>
    </div>
    <script src="ai-led.js"></script>
</body>
</html>
```

- 展示一個 2x2 的 LED 網格，包含不同形狀、顏色和狀態的 LED。

---

### 注意事項

1. **檔案依賴**：確保 `ai-led.js` 和 `ai-led.css` 已正確引入，否則元件無法正常運作。
2. **瀏覽器支援**：該元件使用 Web Components，需在支援 Shadow DOM 的現代瀏覽器中運行。
3. **動態更新**：屬性變更會自動觸發重新渲染，例如更改 `led-state` 會更新 LED 的顯示狀態。
