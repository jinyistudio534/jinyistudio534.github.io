以下是基於最後修復版本的 **json2Html.js** 的 JSON 格式使用說明，涵蓋所有支援的元素類型及其屬性。這份說明將幫助你了解如何構造 `formJson`，以正確生成 HTML 元素並實現預期功能。

---

### JSON 格式使用說明

#### 通用屬性

所有元素類型都可以包含以下通用屬性（除非特別註明）：

- **type**（必填，字串）：指定元素的類型，例如 `"text"`、`"button"` 等。
- **id**（選填，字串）：元素的唯一標識符，用於 DOM 操作和事件綁定。如果未提供，某些功能（如事件綁定）可能無法正常運作。
- **label**（選填，字串）：元素的顯示標籤，通常顯示在元素上方或旁邊。
- **value**（選填，根據類型而定）：元素的預設值，具體格式取決於元素類型。

#### 支援的元素類型與屬性

1. **文字輸入框（text, password, email）**
   
   - **type**: `"text"`, `"password"`, 或 `"email"`
   
   - **id**: 唯一標識符（建議提供）
   
   - **label**: 輸入框上方顯示的標籤
   
   - **value**: 預設文字內容（字串）
   
   - **範例**:
     
     ```json
     {
         "type": "text",
         "id": "username",
         "label": "使用者名稱",
         "value": "預設名稱"
     }
     ```
   
   - **說明**: 生成一個 Bootstrap 樣式的輸入框，根據 `type` 決定是普通文字、密碼或電子郵件輸入。

2. **標籤（label）**
   
   - **type**: `"label"`
   
   - **id**: 唯一標識符（選填）
   
   - **label**: 顯示的文字內容（必填）
   
   - **align**: 對齊方式，可選值為 `"left"`（預設）、`"center"`、`"right"`
   
   - **範例**:
     
     ```json
     {
         "type": "label",
         "label": "這是一個新的標籤",
         "id": "info-label",
         "align": "right"
     }
     ```
   
   - **說明**: 生成一個純文字標籤，支持左右中對齊，使用 Bootstrap 的 `text-start`、`text-center` 或 `text-end` 類別。

3. **間隔（spacer）**
   
   - **type**: `"spacer"`
   
   - **height**: 間隔高度（數字或字串，例如 `20` 或 `"20px"`，預設 `"10px"`）
   
   - **line**: 是否顯示分隔線（布林值，預設 `false`）
   
   - **範例**:
     
     ```json
     {
         "type": "spacer",
         "height": 20,
         "line": true
     }
     ```
   
   - **說明**: 生成一個指定高度的空白間隔，可選擇是否在中間顯示水平線。

4. **下拉選單（select）**
   
   - **type**: `"select"`
   
   - **id**: 唯一標識符（建議提供）
   
   - **label**: 選單上方顯示的標籤
   
   - **options**: 選項陣列，每個選項包含 `value`（值）和 `label`（顯示文字）
   
   - **value**: 預設選中的值（與某個選項的 `value` 對應）
   
   - **範例**:
     
     ```json
     {
         "type": "select",
         "id": "gender",
         "label": "性別",
         "options": [
             { "value": "male", "label": "男" },
             { "value": "female", "label": "女" },
             { "value": "other", "label": "其他" }
         ],
         "value": "male"
     }
     ```
   
   - **說明**: 生成一個 Bootstrap 下拉選單，預設值由 `value` 指定。

5. **文字區域（textarea）**
   
   - **type**: `"textarea"`
   
   - **id**: 唯一標識符（建議提供）
   
   - **label**: 文字區域上方的標籤
   
   - **value**: 預設文字內容（字串）
   
   - **範例**:
     
     ```json
     {
         "type": "textarea",
         "id": "bio",
         "label": "自我介紹",
         "value": "這是我的介紹"
     }
     ```
   
   - **說明**: 生成一個多行文字輸入框，固定為 3 行高度。

6. **複選框（checkbox）**
   
   - **type**: `"checkbox"`
   
   - **id**: 唯一標識符（建議提供）
   
   - **label**: 複選框旁邊的標籤
   
   - **value**: 預設是否勾選（布林值，`true` 或 `false`）
   
   - **範例**:
     
     ```json
     {
         "type": "checkbox",
         "id": "subscribe",
         "label": "訂閱通知",
         "value": true
     }
     ```
   
   - **說明**: 生成一個 Bootstrap 樣式的複選框，預設勾選狀態由 `value` 決定。

7. **單選框（radio）**
   
   - **type**: `"radio"`
   
   - **id**: 唯一標識符（建議提供）
   
   - **label**: 單選框組上方的標籤
   
   - **options**: 選項陣列，每個選項包含 `value`（值）和 `label`（顯示文字）
   
   - **value**: 預設選中的值（與某個選項的 `value` 對應）
   
   - **範例**:
     
     ```json
     {
         "type": "radio",
         "id": "role",
         "label": "角色",
         "options": [
             { "value": "user", "label": "使用者" },
             { "value": "admin", "label": "管理員" }
         ],
         "value": "user"
     }
     ```
   
   - **說明**: 生成一組垂直排列的單選框，預設選中項由 `value` 指定。

8. **圖片（image）**
   
   - **type**: `"image"`
   
   - **id**: 唯一標識符（選填）
   
   - **label**: 圖片上方的標籤（選填）
   
   - **value**: 圖片 URL（必填）
   
   - **align**: 對齊方式，可選值為 `"left"`（預設）、`"center"`、`"right"`
   
   - **範例**:
     
     ```json
     {
         "type": "image",
         "id": "profile-pic",
         "value": "https://via.placeholder.com/150",
         "align": "center"
     }
     ```
   
   - **說明**: 生成一個圖片元素，使用 Bootstrap 的 `img-fluid` 類別，支持左右中對齊。

9. **按鈕（button）**
   
   - **type**: `"button"`
   
   - **id**: 唯一標識符（必填，用於事件綁定）
   
   - **label**: 按鈕顯示的文字（必填）
   
   - **group**: 按鈕組名稱（選填，若指定，同一 `group` 的按鈕會顯示在同一行）
   
   - **callback**: 按鈕點擊時觸發的動作（字串，與事件監聽器中的 `switch` 對應）
   
   - **範例**:
     
     ```json
     [
         {
             "type": "button",
             "id": "submit",
             "label": "提交",
             "group": "actions",
             "callback": "submit"
         },
         {
             "type": "button",
             "id": "cancel",
             "label": "取消",
             "group": "actions",
             "callback": "cancel"
         },
         {
             "type": "button",
             "id": "extra",
             "label": "額外按鈕",
             "callback": "extra"
         }
     ]
     ```
   
   - **說明**:
     
     - 生成 Bootstrap 樣式的按鈕，預設為藍色（`btn-primary`）。
     - 若 `callback` 為 `"cancel"`，按鈕為灰色（`btn-secondary`）；若為 `"extra"`，按鈕為淺藍色（`btn-info`）。
     - 同一 `group` 的按鈕會並排顯示在一行，使用 `btn-group d-flex gap-2` 樣式。
     - 未指定 `group` 的按鈕會單獨顯示在自己的行。

---

### 注意事項

1. **按鈕事件**：
   
   - 在 `index.html` 的 `<script>` 中，透過 `jsonButtonClick` 自訂事件監聽按鈕點擊。
   - `callback` 值會傳遞到 `event.detail.action`，可用於 `switch` 處理不同動作。
   - 若 `callback` 為 `"submit"`，事件會自動收集表單資料並包含在 `event.detail.formData` 中。

2. **表單資料收集**：
   
   - 僅收集非 `"button"`、`"image"`、`"label"`、`"spacer"` 的元素值。
   - 支援 `text`、`password`、`email`（文字）、`select`（選中值）、`textarea`（文字）、`checkbox`（布林值）、`radio`（選中值）。

3. **樣式調整**：
   
   - 所有元素間距由 `defaultMargin`（預設 `10px`）和 `marginBottom: 10px` 控制，可透過 `setMargin()` 方法修改。
   - 使用 Bootstrap 5.3.3 的樣式，確保引入相關 CSS 和 JS。

---

### 使用範例

以下是一個簡化範例，展示按鈕組和其他元素的使用：

```json
[
    {
        "type": "text",
        "id": "username",
        "label": "使用者名稱",
        "value": "預設名稱"
    },
    {
        "type": "label",
        "label": "請輸入資料",
        "align": "center"
    },
    {
        "type": "button",
        "id": "submit",
        "label": "提交",
        "group": "actions",
        "callback": "submit"
    },
    {
        "type": "button",
        "id": "cancel",
        "label": "取消",
        "group": "actions",
        "callback": "cancel"
    },
    {
        "type": "button",
        "id": "extra",
        "label": "額外按鈕",
        "callback": "extra"
    }
]
```

- **結果**:
  - 第一行：文字輸入框 "使用者名稱"。
  - 第二行：居中標籤 "請輸入資料"。
  - 第三行：並排按鈕 "提交" 和 "取消"（同 `group: "actions"`）。
  - 第四行：單獨按鈕 "額外按鈕"。

---

希望這份使用說明對你有幫助！如果有任何疑問或需要進一步澄清，隨時告訴我。
