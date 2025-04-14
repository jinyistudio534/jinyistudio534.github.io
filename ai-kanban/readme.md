以下是 `float_kanban` 元件的使用說明，使用繁體中文撰寫。這個指南解釋了如何將其整合到您的專案中、其運作方式，以及如何使用提供的事件和函數來控制它。

---

### `float_kanban` 使用說明

#### 概覽

`float_kanban` 函數會創建一個帶有切換按鈕的浮動看板面板。該面板可以從螢幕的左側、右側、上方或下方滑入。您可以：

- 透過按鈕點擊觸發切換，發出 `floatKanbanToggle` 事件。
- 使用返回的函數以程式化的方式控制面板的顯示與隱藏。
- 自訂其位置、大小和邊距。

`floatKanbanToggle` 事件中的 `isOpen` 反映按鈕點擊 *前* 的面板狀態，讓您能在事件監聽器中決定下一步動作（顯示或隱藏）。

---

#### 所需檔案

1. **`float_kanban.js`**：JavaScript 邏輯（前述最終版本）。
2. **`float_kanban.css`**：CSS 樣式（來自您提供的原始文件）。
3. **HTML**：您的頁面結構，用於嵌入看板。

---

#### HTML 設定

以下是一個基本範例：

```html
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>浮動看板範例</title>
    <link rel="stylesheet" href="float_kanban.css">
</head>
<body>
    <!-- 看板容器 -->
    <div id="kanban-container">
        <div class="float-kanban-panel-content">
            <h2>面板標題</h2>
            <p>這是看板面板內的內容。</p>
            <ul>
                <li>項目 1</li>
                <li>項目 2</li>
                <li>項目 3</li>
            </ul>
        </div>
    </div>

    <!-- 其他頁面內容 -->
    <div style="padding: 20px;">
        <h1>主要內容</h1>
        <p>這是頁面主要內容。</p>
        <button id="external-toggle">切換看板</button>
    </div>

    <script src="float_kanban.js"></script>
    <script>
        // 初始化看板
        const kanban = float_kanban('kanban-container', 'left', 400, 20);

        // 內建按鈕的事件監聽器
        document.getElementById('kanban-container').addEventListener('floatKanbanToggle', (e) => {
            if (e.detail.isOpen) {
                kanban.hide(); // 若原本是開啟狀態，則隱藏
            } else {
                kanban.show(); // 若原本是關閉狀態，則顯示
            }
        });

        // 可選：外部按鈕切換
        document.getElementById('external-toggle').addEventListener('click', () => {
            if (kanban.isOpen()) {
                kanban.hide();
            } else {
                kanban.show();
            }
        });
    </script>
</body>
</html>
```

---

#### 參數

`float_kanban` 函數接受以下參數：

- **`containerId`** (字串)：看板初始化的 HTML 元素 ID（例如 `'kanban-container'`）。
- **`position`** (字串，可選)：面板滑入的方向。選項：`'left'`（預設）、`'right'`、`'top'`、`'bottom'`。
- **`panelSize`** (數字，可選)：面板大小（單位：像素）。預設值：`150`。
  - `'left'` 或 `'right'`：面板寬度。
  - `'top'` 或 `'bottom'`：面板高度。
- **`margin`** (數字，可選)：面板內容周圍的邊距（單位：像素）。預設值：`3`。

---

#### 返回物件

函數返回一個包含以下三個方法的物件：

- **`show()`**：顯示看板面板，並將 `isOpen` 設為 `true`。
- **`hide()`**：隱藏看板面板，並將 `isOpen` 設為 `false`。
- **`isOpen()`**：返回面板當前狀態（`true` 表示顯示，`false` 表示隱藏）。

範例：

```javascript
const kanban = float_kanban('kanban-container', 'left', 400, 20);
kanban.show(); // 顯示面板
console.log(kanban.isOpen()); // true
kanban.hide(); // 隱藏面板
console.log(kanban.isOpen()); // false
```

---

#### 事件：`floatKanbanToggle`

- **觸發時機**：當看板按鈕被點擊時。
- **詳細資料**：包含 `{ isOpen: boolean }`，其中 `isOpen` 是點擊 *前* 的狀態。
- **用途**：讓您決定下一步動作（顯示或隱藏）。

範例用法：

```javascript
document.getElementById('kanban-container').addEventListener('floatKanbanToggle', (e) => {
    if (e.detail.isOpen) {
        kanban.hide(); // 原本是開啟狀態，現在隱藏
    } else {
        kanban.show(); // 原本是關閉狀態，現在顯示
    }
});
```

**行為**：

- 初始狀態為隱藏（`isOpen = false`）。
- 第一次點擊：`e.detail.isOpen = false` → `kanban.show()` → 面板顯示。
- 第二次點擊：`e.detail.isOpen = true` → `kanban.hide()` → 面板隱藏。

---

#### CSS 自訂

面板和按鈕的樣式定義在 `float_kanban.css` 中。主要類別：

- **`.float-kanban-button`**：切換按鈕的樣式。
- **`.float-kanban-panel`**：滑動面板的樣式。
- **`.float-kanban-panel-content`**：面板內內容的樣式。

您可以在 `float_kanban.css` 中修改這些樣式，例如顏色、透明度或過渡效果。

---

#### 注意事項

1. **初始狀態**：面板預設為隱藏（`isOpen = false`）。
2. **視窗調整**：面板會自動適應視窗大小變化。
3. **內容**：將您的內容放入容器內的 `<div class="float-kanban-panel-content">`，腳本會將其移入面板。
4. **錯誤處理**：若 `containerId` 未找到，會在控制台記錄錯誤並退出函數。

---

#### 故障排除

- **面板未顯示/隱藏**：檢查是否正確載入 `float_kanban.css`，並確認容器 ID 是否正確。
- **事件未觸發**：確保事件監聽器附加到正確的容器 ID。
- **異常行為**：確認沒有其他腳本干擾 DOM 元素。

---

這份說明應涵蓋您使用 `float_kanban` 元件所需的所有資訊。如果您有任何問題或需要特定自訂的幫助，請隨時告訴我！