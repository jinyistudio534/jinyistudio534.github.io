(function (global, fabric, QRCode) {
    // 檢查依賴是否載入
    if (typeof fabric === 'undefined') {
        console.error('Fabric.js 未載入');
        throw new Error('Fabric.js 未載入');
    }
    if (typeof QRCode === 'undefined') {
        console.error('qrcode.min.js 未載入');
        throw new Error('qrcode.min.js 未載入');
    }

    // 定義 AiSvgEdit 類
    function AiSvgEdit(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            throw new Error(`未找到 ID 為 ${containerId} 的容器`);
        }

        // 創建畫布容器
        const canvasContainer = document.createElement('div');
        canvasContainer.id = 'canvas-container';
        canvasContainer.style.width = '100%';
        canvasContainer.style.height = '100%';
        canvasContainer.style.position = 'relative';
        container.appendChild(canvasContainer);

        // 創建畫布
        const canvasElement = document.createElement('canvas');
        canvasElement.id = 'canvas';
        canvasContainer.appendChild(canvasElement);

        // 添加控制面板
        const controls = document.createElement('div');
        controls.className = 'controls';
        controls.innerHTML = `
            <div class="column">
                <h4 title="工具"><i class="fas fa-tools"></i></h4>
                <div class="tool-buttons">
                    <button class="tool-btn active" data-tool="cursor" onclick="window.aiSvgEditor.setTool('cursor')" title="游標"><i class="fas fa-mouse-pointer"></i></button>
                    <button class="tool-btn" data-tool="circle" onclick="window.aiSvgEditor.setTool('circle')" title="圓形"><i class="fas fa-circle"></i></button>
                    <button class="tool-btn" data-tool="rect" onclick="window.aiSvgEditor.setTool('rect')" title="矩形"><i class="fas fa-square"></i></button>
                    <button class="tool-btn" data-tool="line" onclick="window.aiSvgEditor.setTool('line')" title="線條"><i class="fas fa-minus"></i></button>
                    <button class="tool-btn" data-tool="text" onclick="window.aiSvgEditor.setTool('text')" title="文字"><i class="fas fa-font"></i></button>
                    <button class="tool-btn" data-tool="polygon" onclick="window.aiSvgEditor.setTool('polygon')" title="三角形"><i class="fas fa-caret-up" style="transform: rotate(90deg);"></i></button>
                    <button class="tool-btn" data-tool="freehand" onclick="window.aiSvgEditor.setTool('freehand')" title="手繪線"><i class="fas fa-pencil-alt"></i></button>
                </div>
            </div>
            <div class="column">
                <h4 title="顏色"><i class="fas fa-palette"></i></h4>
                <label title="填充顏色" class="fill-color-container">
                    <i class="fas fa-fill-drip"></i>
                    <input type="text" id="fillColorDisplay" readonly value="#ffffff" title="點擊選擇填充顏色或透明度">
                </label>
                <label title="邊框顏色" class="stroke-color-container">
                    <i class="fas fa-paint-brush"></i>
                    <input type="text" id="strokeColorDisplay" readonly value="#000000" title="點擊選擇框線顏色或透明">
                </label>
                <label title="邊框寬度">
                    <i class="fas fa-paint-roller"></i>
                    <input type="number" id="strokeWidth" value="2" min="1" max="10">
                </label>
            </div>
            <div class="column">
                <h4 title="文字選項"><i class="fas fa-text-height"></i></h4>
                <label title="字型">
                    <i class="fas fa-font"></i>
                    <select id="fontFamily">
                        <option value="Arial">Arial</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Courier New">Courier New</option>
                    </select>
                </label>
                <label title="字型大小">
                    <i class="fas fa-text-height"></i>
                    <input type="number" id="fontSize" value="16" min="8" max="72">
                </label>
                <label title="粗體">
                    <i class="fas fa-bold"></i>
                    <input type="checkbox" id="fontBold">
                </label>
                <label title="底線">
                    <i class="fas fa-underline"></i>
                    <input type="checkbox" id="underline">
                </label>
            </div>
            <div class="column">
                <h4 title="操作"><i class="fas fa-cog"></i></h4>
                <button onclick="window.aiSvgEditor.applyStyles()" title="應用樣式"><i class="fas fa-palette"></i></button>
                <button onclick="window.aiSvgEditor.deleteSelected()" title="刪除選中"><i class="fas fa-trash"></i></button>
                <button id="duplicateBtn" onclick="window.aiSvgEditor.duplicateSelected()" title="複製選中" disabled><i class="fas fa-copy"></i></button>
                <button onclick="window.aiSvgEditor.saveSVG()" title="儲存 SVG"><i class="fas fa-download"></i></button>
                <button onclick="window.aiSvgEditor.loadSVG()" title="載入 SVG"><i class="fas fa-upload"></i></button>
                <button onclick="window.aiSvgEditor.generateQRCode()" title="生成 QR 碼"><i class="fas fa-qrcode"></i></button>
                <button id="groupBtn" onclick="window.aiSvgEditor.groupSelected()" title="群組選中" disabled><i class="fas fa-object-group"></i></button>
                <button id="ungroupBtn" onclick="window.aiSvgEditor.ungroupSelected()" title="解除群組" disabled><i class="fas fa-object-ungroup"></i></button>
                <button id="bringForwardBtn" onclick="window.aiSvgEditor.bringForward()" title="上移一層" disabled><i class="fas fa-arrow-up"></i></button>
                <button id="sendBackwardBtn" onclick="window.aiSvgEditor.sendBackward()" title="下移一層" disabled><i class="fas fa-arrow-down"></i></button>
                <button onclick="window.aiSvgEditor.clearCanvas()" title="清除畫布"><i class="fas fa-eraser"></i></button>
                <button onclick="window.aiSvgEditor.rotateLeft()" title="向左轉 90 度"><i class="fas fa-undo"></i></button>
                <button onclick="window.aiSvgEditor.rotateRight()" title="向右轉 90 度"><i class="fas fa-redo"></i></button>
            </div>
            <div class="column">
                <h4 title="對齊"><i class="fas fa-align-justify"></i></h4>
                <button class="align-btn" onclick="window.aiSvgEditor.alignObjects('left')" title="左對齊"><i class="fas fa-align-left"></i></button>
                <button class="align-btn" onclick="window.aiSvgEditor.alignObjects('center')" title="中間對齊"><i class="fas fa-align-center"></i></button>
                <button class="align-btn" onclick="window.aiSvgEditor.alignObjects('right')" title="右對齊"><i class="fas fa-align-right"></i></button>
                <button class="align-btn" onclick="window.aiSvgEditor.alignObjects('top')" title="頂部對齊"><i class="fas fa-arrow-up"></i></button>
                <button class="align-btn" onclick="window.aiSvgEditor.alignObjects('middle')" title="垂直居中"><i class="fas fa-arrows-alt-v"></i></button>
                <button class="align-btn" onclick="window.aiSvgEditor.alignObjects('bottom')" title="底部對齊"><i class="fas fa-arrow-down"></i></button>
            </div>
        `;
        container.appendChild(controls);

        // 添加座標顯示元素
        const coordinatesDiv = document.createElement('div');
        coordinatesDiv.id = 'coordinates';
        canvasContainer.appendChild(coordinatesDiv);

        // 添加檔案名稱顯示元素
        const filenameDiv = document.createElement('div');
        filenameDiv.id = 'filename';
        canvasContainer.appendChild(filenameDiv);

        // 添加框線顏色選擇面板
        const strokeColorPanel = document.createElement('div');
        strokeColorPanel.id = 'strokeColorPanel';
        strokeColorPanel.className = 'color-panel';
        strokeColorPanel.innerHTML = `
            <input type="color" id="strokeColor" value="#000000">
            <button id="strokeTransparentBtn" title="透明框線">透明</button>
        `;
        canvasContainer.appendChild(strokeColorPanel);

        // 添加填充顏色與透明度選擇面板
        const fillColorPanel = document.createElement('div');
        fillColorPanel.id = 'fillColorPanel';
        fillColorPanel.className = 'color-panel';
        fillColorPanel.innerHTML = `
            <input type="color" id="fillColor" value="#ffffff">
            <div class="opacity-controls">
                <input type="number" id="opacity" value="100" min="0" max="100" step="1" title="透明度">
                <button id="opacityUpBtn" title="增加透明度">+</button>
                <button id="opacityDownBtn" title="減少透明度">-</button>
            </div>
        `;
        canvasContainer.appendChild(fillColorPanel);

        // 添加樣式
        const style = document.createElement('style');
        style.textContent = `
            body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
            }
            #${containerId} { 
                position: relative; 
                width: 100vw; 
                height: 100vh; 
            }
            #canvas-container { 
                width: 100%; 
                height: 100%; 
                position: relative;
            }
            #canvas { 
                width: 100%; 
                height: 100%; 
                display: block;
            }
            .controls { 
                position: absolute;
                top: 0;
                left: 0;
                z-index: 1000;
                display: flex;
                flex-direction: row;
                flex-wrap: wrap;
                align-items: flex-start;
                gap: 5px;
                width: 100%;
                max-width: 100%;
                overflow: hidden;
                box-sizing: border-box;
                background: transparent;
                padding: 5px;
                border-radius: 5px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
                pointer-events: auto;
            }
            .column { 
                display: flex;
                flex-direction: row;
                align-items: center;
                gap: 5px;
                flex: 0 0 auto;
                width: auto;
                min-width: 0;
                flex-shrink: 1;
                flex-wrap: nowrap;
                overflow: hidden;
                background: transparent;
                padding: 0 5px;
                border-radius: 3px;
            }
            .column label { 
                display: flex;
                flex-direction: row;
                align-items: center;
                gap: 5px;
                width: 54px;
                height: 24px;
            }
            .column button, 
            .column select, 
            .column input[type="number"], 
            .column input[type="text"], 
            .column input[type="color"] { 
                width: 24px; 
                height: 24px; 
                padding: 0;
                margin: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                line-height: 1;
                cursor: pointer;
                border: 1px solid #ccc;
                background-color: #f9f9f9;
                box-sizing: border-box;
                pointer-events: auto;
            }
            .column select {
                appearance: none;
                -webkit-appearance: none;
                -moz-appearance: none;
                background: #f9f9f9 url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12"><path fill="%23666" d="M2 4l4 4 4-4z"/></svg>') no-repeat right 5px center;
                background-size: 12px;
            }
            .column input[type="color"] {
                appearance: none;
                -webkit-appearance: none;
                -moz-appearance: none;
                padding: 0;
                border: none;
            }
            .column input[type="color"]::-webkit-color-swatch-wrapper {
                padding: 0;
            }
            .column input[type="color"]::-webkit-color-swatch {
                border: none;
            }
            .column button i, 
            .column label i { 
                width: 24px; 
                height: 24px; 
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
            }
            .column button:hover:not(:disabled), 
            .column select:hover, 
            .column input:hover:not([readonly]) { 
                background-color: #e0e0e0; 
            }
            .column button.active { 
                background-color: #d0d0d0; 
            }
            .column button:disabled { 
                opacity: 0.5; 
                cursor: not-allowed; 
                pointer-events: none; 
            }
            .column h4 { 
                margin: 0 10px 0 0; 
                font-size: 12px; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                width: 24px; 
                height: 24px; 
            }
            .column h4 i { 
                color: red; 
            }
            .tool-buttons { 
                display: flex; 
                flex-direction: row; 
                gap: 5px; 
            }
            #coordinates {
                position: absolute;
                bottom: 10px;
                left: 10px;
                z-index: 1000;
                background: rgba(255, 255, 255, 0.8);
                padding: 2px 5px;
                border-radius: 3px;
                font-size: 9px;
                color: #333;
                pointer-events: none;
                display: none;
            }
            #filename {
                position: absolute;
                bottom: 30px;
                left: 10px;
                z-index: 1000;
                background: rgba(255, 255, 255, 0.8);
                padding: 2px 5px;
                border-radius: 3px;
                font-size: 9px;
                color: #333;
                pointer-events: none;
                display: none;
            }
            /* 框線顏色選擇窗樣式 */
            .stroke-color-container, .fill-color-container {
                width: auto;
                display: flex;
                align-items: center;
                gap: 5px;
            }
            #strokeColorDisplay, #fillColorDisplay {
                background-color: #000000;
                color: transparent;
                cursor: pointer;
                border: 1px solid #ccc;
                width: 24px;
                height: 24px;
            }
            #strokeColorDisplay[transparent="true"] {
                background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAJ0lEQVQ4jWNgYGBg+P///38GEgoxMTExMTGxvXv3bhgYGJiYmHAAADWqD8lL9FOrAAAAAElFTkSuQmCC') repeat;
                border: 1px solid #ccc;
            }
            #strokeColorPanel, #fillColorPanel {
                display: none;
                position: absolute;
                z-index: 2000;
                background: #f9f9f9;
                border: 1px solid #ccc;
                border-radius: 3px;
                padding: 5px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
                flex-direction: column;
                gap: 5px;
                min-width: 120px;
            }
            #strokeColorPanel[visible="true"], #fillColorPanel[visible="true"] {
                display: flex;
            }
            #strokeColorPanel input[type="color"],
            #strokeColorPanel button,
            #fillColorPanel input[type="color"],
            #fillColorPanel input[type="number"],
            #fillColorPanel .opacity-controls button {
                height: 24px;
                margin: 0;
                font-size: 12px;
                cursor: pointer;
                box-sizing: border-box;
            }
            #strokeColorPanel input[type="color"],
            #fillColorPanel input[type="color"] {
                width: 100%;
                padding: 0;
                border: none;
            }
            #strokeColorPanel button {
                width: 100%;
                background: #fff;
                border: 1px solid #ccc;
                text-align: center;
            }
            #strokeColorPanel button:hover {
                background: #e0e0e0;
            }
            #fillColorPanel input[type="number"] {
                width: 60px;
                border: 1px solid #ccc;
                background: #f9f9f9;
                padding: 0 5px;
            }
            #fillColorPanel .opacity-controls {
                display: flex;
                flex-direction: row;
                align-items: center;
                gap: 5px;
            }
            #fillColorPanel .opacity-controls button {
                width: 24px;
                background: #fff;
                border: 1px solid #ccc;
            }
            #fillColorPanel .opacity-controls button:hover {
                background: #e0e0e0;
            }
        `;
        document.head.appendChild(style);

        // 初始化 Fabric.js 畫布
        const canvas = new fabric.Canvas('canvas', {
            selection: true,
            preserveObjectStacking: true
        });

        // 添加網格
        function addGrid() {
            canvas.getObjects().forEach(obj => {
                if (obj.isGrid) {
                    canvas.remove(obj);
                }
            });

            const gridSize = 8;
            const gridColor = '#E0E0E0';
            const width = canvas.width;
            const height = canvas.height;

            const lines = [];
            for (let x = 0; x <= width; x += gridSize) {
                const path = new fabric.Path(`M ${x} 0 L ${x} ${height}`, {
                    stroke: gridColor,
                    strokeWidth: 1,
                    selectable: false,
                    evented: false,
                    isGrid: true
                });
                lines.push(path);
            }
            for (let y = 0; y <= height; y += gridSize) {
                const path = new fabric.Path(`M 0 ${y} L ${width} ${y}`, {
                    stroke: gridColor,
                    strokeWidth: 1,
                    selectable: false,
                    evented: false,
                    isGrid: true
                });
                lines.push(path);
            }

            lines.forEach(line => canvas.add(line));
            canvas.sendToBack(lines[0]);
            canvas.requestRenderAll();
            console.log('網格添加: 8x8，顏色:', gridColor, '線寬: 1px');
        }

        // 設定畫布尺寸
        function resizeCanvas() {
            const minHeight = 400; // 確保畫布有足夠空間顯示
            let width = canvasContainer.offsetWidth;
            let height = canvasContainer.offsetHeight;

            console.log('初始容器尺寸:', width, 'x', height);
            canvasContainer.style.width = '100%';
            canvasContainer.style.height = '100%';
            canvasElement.style.width = '100%';
            console.log('設置容器和畫布寬度為 100%');

            const controlsHeight = controls.offsetHeight;
            canvasElement.style.marginTop = `${controlsHeight}px`;
            console.log('工具列高度:', controlsHeight, 'px，設置畫布 margin-top:', controlsHeight, 'px');

            height = canvasContainer.offsetHeight - controlsHeight;
            if (height < minHeight) {
                height = minHeight;
                canvasContainer.style.height = `${minHeight + controlsHeight}px`;
                console.log('高度低於最小值，強制設置容器高度為:', minHeight + controlsHeight);
            }

            canvas.setDimensions({ width: width, height: height });
            addGrid();
            canvas.requestRenderAll();
            console.log('畫布調整尺寸至:', width, 'x', height);
            console.log('實際畫布像素寬度:', canvasElement.offsetWidth, 'px');

            const controlsWidth = controls.offsetWidth;
            console.log('工具列總寬度:', controlsWidth, 'px');
            let currentRowWidth = 0;
            let rowNumber = 1;
            document.querySelectorAll('.column').forEach((col, index) => {
                const colWidth = col.offsetWidth;
                currentRowWidth += colWidth + 10;
                console.log(`列 ${index + 1} 寬度: ${colWidth}px, 累計行寬: ${currentRowWidth}px, 當前行: ${rowNumber}`);
                if (currentRowWidth > width && index < 4) {
                    rowNumber++;
                    currentRowWidth = colWidth + 10;
                    console.log(`換至第 ${rowNumber} 行，重新計算累計寬度: ${currentRowWidth}px`);
                }
            });
        }

        setTimeout(resizeCanvas, 0);
        window.addEventListener('resize', resizeCanvas);

        let currentTool = 'cursor';
        let isDrawing = false;
        let startPoint = null;
        let currentObject = null;
        let strokeTransparent = false; // 追蹤透明狀態
        let filename = ''; // 檔案名稱變數

        function updateFilenameDisplay() {
            const filenameDiv = document.getElementById('filename');
            if (filename) {
                filenameDiv.style.display = 'block';
                filenameDiv.textContent = `File: ${filename}`;
                console.log('更新檔案名稱顯示:', filename);
            } else {
                filenameDiv.style.display = 'none';
                console.log('無檔案名稱，隱藏檔案名稱顯示');
            }
        }

        function setTool(tool) {
            currentTool = tool;
            canvas.isDrawingMode = false;
            canvas.selection = true;
            document.querySelectorAll('.tool-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.tool === tool) {
                    btn.classList.add('active');
                }
            });
            if (tool === 'cursor') {
                canvas.defaultCursor = 'default';
                document.body.style.cursor = 'default';
                console.log('游標設為箭頭，工具:', tool);
            } else if (tool === 'freehand') {
                canvas.isDrawingMode = true;
                canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
                canvas.freeDrawingBrush.color = document.getElementById('strokeColor').value;
                canvas.freeDrawingBrush.width = parseInt(document.getElementById('strokeWidth').value) || 2;
                canvas.defaultCursor = 'crosshair';
                document.body.style.cursor = 'crosshair';
                console.log('啟用手繪線模式，顏色:', canvas.freeDrawingBrush.color, '寬度:', canvas.freeDrawingBrush.width);
            } else {
                canvas.defaultCursor = 'crosshair';
                document.body.style.cursor = 'crosshair';
                console.log('游標設為十字，工具:', tool);
            }
            canvas.discardActiveObject();
            canvas.requestRenderAll();
            console.log('工具設為:', tool);
        }

        function createPolygonPoints(centerX, centerY, radius, sides) {
            const points = [];
            for (let i = 0; i < sides; i++) {
                const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
                points.push({
                    x: centerX + radius * Math.cos(angle),
                    y: centerY + radius * Math.sin(angle)
                });
            }
            return points;
        }

        canvas.on('mouse:down', (e) => {
            if (e.button !== 1) return;
            startPoint = canvas.getPointer(e.e);

            if (currentTool === 'cursor') {
                if (e.target) {
                    canvas.setActiveObject(e.target);
                    console.log('選中物件:', e.target.type);
                } else {
                    canvas.discardActiveObject();
                    console.log('無物件選中，清除選取');
                }
                canvas.requestRenderAll();
                return;
            }

            isDrawing = true;
            const tool = currentTool;
            const fillColor = document.getElementById('fillColor').value;
            const opacity = parseInt(document.getElementById('opacity').value) / 100;
            const fillWithOpacity = fabric.Color.fromHex(fillColor).setAlpha(opacity).toRgba();
            const strokeColor = document.getElementById('strokeColor').value;
            const strokeWidth = parseInt(document.getElementById('strokeWidth').value) || 2;

            if (tool === 'circle') {
                currentObject = new fabric.Circle({
                    left: startPoint.x,
                    top: startPoint.y,
                    radius: 0,
                    fill: fillWithOpacity,
                    stroke: strokeTransparent ? null : strokeColor,
                    strokeWidth: strokeTransparent ? 0 : strokeWidth,
                    originX: 'center',
                    originY: 'center',
                    selectable: true,
                    evented: true
                });
            } else if (tool === 'rect') {
                currentObject = new fabric.Rect({
                    left: startPoint.x,
                    top: startPoint.y,
                    width: 0,
                    height: 0,
                    fill: fillWithOpacity,
                    stroke: strokeTransparent ? null : strokeColor,
                    strokeWidth: strokeTransparent ? 0 : strokeWidth,
                    selectable: true,
                    evented: true
                });
            } else if (tool === 'line') {
                currentObject = new fabric.Line([startPoint.x, startPoint.y, startPoint.x, startPoint.y], {
                    stroke: strokeTransparent ? null : strokeColor,
                    strokeWidth: strokeTransparent ? 0 : strokeWidth,
                    selectable: true,
                    evented: true
                });
            } else if (tool === 'text') {
                currentObject = new fabric.IText('文字', {
                    left: startPoint.x,
                    top: startPoint.y,
                    fontFamily: document.getElementById('fontFamily').value,
                    fontSize: 24,
                    fontWeight: document.getElementById('fontBold').checked ? 'bold' : 'normal',
                    underline: document.getElementById('underline').checked,
                    fill: fillWithOpacity,
                    stroke: strokeTransparent ? null : strokeColor,
                    strokeWidth: strokeTransparent ? 0 : 1,
                    selectable: true,
                    evented: true,
                    editable: true
                });
                canvas.add(currentObject);
                canvas.setActiveObject(currentObject);
                setTimeout(() => {
                    currentObject.enterEditing();
                    if (currentObject.hiddenTextarea) {
                        currentObject.hiddenTextarea.focus();
                        console.log('IText 進入編輯模式，文字區域聚焦');
                    } else {
                        console.error('未找到 hiddenTextarea');
                    }
                }, 50);
                canvas.requestRenderAll();
                return;
            } else if (tool === 'polygon') {
                const points = createPolygonPoints(0, 0, 100, 3);
                currentObject = new fabric.Polygon(points, {
                    left: startPoint.x,
                    top: startPoint.y,
                    scaleX: 0,
                    scaleY: 0,
                    fill: fillWithOpacity,
                    stroke: strokeTransparent ? null : strokeColor,
                    strokeWidth: strokeTransparent ? 0 : strokeWidth,
                    selectable: true,
                    evented: true
                });
            }

            if (currentObject) {
                canvas.add(currentObject);
                canvas.requestRenderAll();
                console.log('物件添加:', tool, '邊框寬度:', currentObject.strokeWidth);
            }
        });

        canvas.on('mouse:move', (e) => {
            if (!isDrawing || !currentObject || currentTool === 'text') return;
            const pointer = canvas.getPointer(e.e);

            if (currentTool === 'circle') {
                const radius = Math.sqrt(Math.pow(pointer.x - startPoint.x, 2) + Math.pow(pointer.y - startPoint.y, 2));
                currentObject.set({ radius: radius });
            } else if (currentTool === 'rect') {
                const width = pointer.x - startPoint.x;
                const height = pointer.y - startPoint.y;
                currentObject.set({
                    width: Math.abs(width),
                    height: Math.abs(height),
                    left: width < 0 ? pointer.x : startPoint.x,
                    top: height < 0 ? pointer.y : startPoint.y
                });
            } else if (currentTool === 'line') {
                currentObject.set({ x2: pointer.x, y2: pointer.y });
            } else if (currentTool === 'polygon') {
                const radius = Math.sqrt(Math.pow(pointer.x - startPoint.x, 2) + Math.pow(pointer.y - startPoint.y, 2));
                currentObject.set({
                    scaleX: radius / 100,
                    scaleY: radius / 100
                });
                currentObject.setCoords();
            }

            canvas.requestRenderAll();
        });

        canvas.on('mouse:up', () => {
            if (currentObject) {
                currentObject.setCoords();
                console.log('物件完成:', currentTool, '可選中:', currentObject.selectable);
            }
            isDrawing = false;
            currentObject = null;
            startPoint = null;
            canvas.requestRenderAll();
        });

        function applyStyles() {
            const fillColor = document.getElementById('fillColor').value;
            const opacity = parseInt(document.getElementById('opacity').value) / 100;
            const fillWithOpacity = fabric.Color.fromHex(fillColor).setAlpha(opacity).toRgba();
            const strokeColor = document.getElementById('strokeColor').value;
            const strokeWidth = parseInt(document.getElementById('strokeWidth').value) || 2;
            const activeObjects = canvas.getActiveObjects();

            activeObjects.forEach(obj => {
                if (obj.type !== 'line') {
                    obj.set({ fill: fillWithOpacity });
                }
                const scale = (obj.scaleX + obj.scaleY) / 2 || 1;
                const adjustedStrokeWidth = strokeWidth / scale;
                obj.set({ 
                    stroke: strokeTransparent ? null : strokeColor,
                    strokeWidth: strokeTransparent ? 0 : adjustedStrokeWidth
                });
                console.log('應用邊框寬度:', strokeWidth, '調整後:', adjustedStrokeWidth, '縮放:', scale, '透明:', strokeTransparent);
            });
            canvas.requestRenderAll();
            console.log('應用樣式:', { fillColor, opacity: opacity * 100 + '%', strokeColor: strokeTransparent ? 'transparent' : strokeColor, strokeWidth });
        }

        function deleteSelected() {
            const activeObjects = canvas.getActiveObjects();
            if (activeObjects.length === 0) {
                console.log('無選中物件可刪除');
                return;
            }
            activeObjects.forEach(obj => canvas.remove(obj));
            canvas.discardActiveObject();
            canvas.requestRenderAll();
            console.log('刪除選中物件:', activeObjects.map(obj => obj.type));
        }

        function duplicateSelected() {
            const activeObject = canvas.getActiveObject();
            if (!activeObject) {
                console.log('無選中物件可複製');
                return;
            }
            activeObject.clone(cloned => {
                if (!cloned) {
                    console.error('複製物件失敗');
                    return;
                }
                cloned.set({
                    left: activeObject.left + 10,
                    top: activeObject.top + 10,
                    evented: true,
                    selectable: true
                });
                if (cloned.type === 'group') {
                    cloned.addWithUpdate();
                }
                canvas.add(cloned);
                canvas.setActiveObject(cloned);
                canvas.requestRenderAll();
                console.log('複製物件:', activeObject.type, '新位置:', { left: cloned.left, top: cloned.top });
            }, ['left', 'top', 'scaleX', 'scaleY', 'angle', 'fill', 'stroke', 'strokeWidth', 'fontFamily', 'fontSize', 'fontWeight', 'underline']);
        }

        function groupSelected() {
            const activeObjects = canvas.getActiveObjects();
            if (activeObjects.length < 2) {
                console.log('群組需至少 2 個物件');
                return;
            }
            canvas.discardActiveObject();
            const group = new fabric.Group(activeObjects, {
                selectable: true,
                evented: true
            });
            group.addWithUpdate();
            group.setCoords();
            canvas.add(group);
            canvas.renderAll();
            activeObjects.forEach(obj => canvas.remove(obj));
            canvas.setActiveObject(group);
            canvas.renderAll();
            console.log('群組物件:', activeObjects.map(obj => obj.type));
        }

        function ungroupSelected() {
            const activeObject = canvas.getActiveObject();
            if (!activeObject || activeObject.type !== 'group') {
                console.log('無選中群組可解散');
                return;
            }
            const objects = activeObject.getObjects();
            activeObject._restoreObjectsState();
            canvas.remove(activeObject);
            objects.forEach(obj => {
                canvas.add(obj);
                obj.setCoords();
            });
            canvas.discardActiveObject();
            canvas.requestRenderAll();
            console.log('解散群組物件:', objects.map(obj => obj.type));
        }

        function bringForward() {
            const activeObject = canvas.getActiveObject();
            if (!activeObject) {
                console.log('無選中物件可上移');
                return;
            }
            const currentIndex = canvas.getObjects().indexOf(activeObject);
            if (currentIndex < canvas.getObjects().length - 1) {
                activeObject.moveTo(currentIndex + 1);
                canvas.requestRenderAll();
                console.log('移至圖層:', currentIndex + 1, '類型:', activeObject.type);
            } else {
                console.log('物件已在最上層');
            }
        }

        function sendBackward() {
            const activeObject = canvas.getActiveObject();
            if (!activeObject) {
                console.log('無選中物件可下移');
                return;
            }
            const currentIndex = canvas.getObjects().indexOf(activeObject);
            if (currentIndex > 0) {
                activeObject.moveTo(currentIndex - 1);
                canvas.requestRenderAll();
                console.log('移至圖層:', currentIndex - 1, '類型:', activeObject.type);
            } else {
                console.log('物件已在最下層');
            }
        }

        function alignObjects(type) {
            const activeObjects = canvas.getActiveObjects();
            if (activeObjects.length === 0) return;

            if (activeObjects.length === 1) {
                const obj = activeObjects[0];
                const b = obj.getBoundingRect();
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;

                if (type === 'left') {
                    obj.set({ left: 0 });
                } else if (type === 'center') {
                    obj.set({ left: (canvasWidth - b.width) / 2 });
                } else if (type === 'right') {
                    obj.set({ left: canvasWidth - b.width });
                } else if (type === 'top') {
                    obj.set({ top: 0 });
                } else if (type === 'middle') {
                    obj.set({ top: (canvasHeight - b.height) / 2 });
                } else if (type === 'bottom') {
                    obj.set({ top: canvasHeight - b.height });
                }
                obj.setCoords();
            } else {
                const bounds = activeObjects.reduce((acc, obj) => {
                    const b = obj.getBoundingRect();
                    return {
                        left: Math.min(acc.left, b.left),
                        top: Math.min(acc.top, b.top),
                        right: Math.max(acc.right, b.left + b.width),
                        bottom: Math.max(acc.bottom, b.top + b.height)
                    };
                }, { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity });

                activeObjects.forEach(obj => {
                    const b = obj.getBoundingRect();
                    if (type === 'left') {
                        obj.set({ left: bounds.left });
                    } else if (type === 'center') {
                        obj.set({ left: (bounds.left + bounds.right - b.width) / 2 });
                    } else if (type === 'right') {
                        obj.set({ left: bounds.right - b.width });
                    } else if (type === 'top') {
                        obj.set({ top: bounds.top });
                    } else if (type === 'middle') {
                        obj.set({ top: (bounds.top + bounds.bottom - b.height) / 2 });
                    } else if (type === 'bottom') {
                        obj.set({ top: bounds.bottom - b.height });
                    }
                    obj.setCoords();
                });
            }

            canvas.requestRenderAll();
            console.log('對齊物件:', type);
        }

        window.saveSVG = function() {
            const activeObjects = canvas.getActiveObjects();
            let objectsToExport = [];
            let saveOption = 'all';

            // 檢查是否有選中物件，並詢問用戶
            if (activeObjects.length > 0) {
                saveOption = confirm('是否僅儲存選中的物件？\n點擊「確定」儲存選中物件，點擊「取消」儲存整個畫布（不含網格）。') ? 'selected' : 'all';
            }

            // 根據選擇確定要導出的物件
            if (saveOption === 'selected') {
                objectsToExport = activeObjects;
                console.log('選擇儲存選中物件，數量:', activeObjects.length);
            } else {
                objectsToExport = canvas.getObjects().filter(obj => !obj.isGrid);
                console.log('選擇儲存整個畫布，排除網格，物件數:', objectsToExport.length);
            }

            // 臨時移除網格物件
            const gridObjects = canvas.getObjects().filter(obj => obj.isGrid);
            gridObjects.forEach(obj => canvas.remove(obj));

            // 生成 SVG
            const svgData = canvas.toSVG({
                suppressPreamble: false,
                viewBox: {
                    x: 0,
                    y: 0,
                    width: canvas.width,
                    height: canvas.height
                },
                filter: (obj) => objectsToExport.includes(obj)
            });

            // 恢復網格物件
            gridObjects.forEach(obj => canvas.add(obj));
            canvas.requestRenderAll();

            // 確定檔案名稱
            let downloadName = filename ? `${filename}.svg` : (saveOption === 'selected' ? 'selected_drawing.svg' : 'drawing.svg');

            // 創建並下載 SVG 檔案
            const blob = new Blob([svgData], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = downloadName;
            a.click();
            URL.revokeObjectURL(url);

            console.log(`SVG 已儲存，範圍: ${saveOption === 'selected' ? '選中物件' : '整個畫布'}，物件數: ${objectsToExport.length}，檔案名稱: ${downloadName}`);
        };

        function loadSVG() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.svg';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;
                // 提取檔案名稱（去除副檔名）
                filename = file.name.replace(/\.svg$/i, '');
                updateFilenameDisplay();
                console.log('載入 SVG，設定檔案名稱:', filename);
                const reader = new FileReader();
                reader.onload = (event) => {
                    const svgString = event.target.result;
                    fabric.loadSVGFromString(svgString, (objects, options) => {
                        const group = fabric.util.groupSVGElements(objects, options);
                        group.set({
                            left: 100,
                            top: 100,
                            selectable: true,
                            evented: true
                        });
                        canvas.add(group);
                        canvas.setActiveObject(group);
                        canvas.renderAll();
                        console.log('載入 SVG，物件:', objects.map(obj => obj.type));
                    });
                };
                reader.readAsText(file);
            };
            input.click();
        }

        function generateQRCode() {
            const text = prompt('請輸入 QR 碼的文字或 URL：');
            if (!text || typeof text !== 'string' || text.trim() === '') {
                console.log('QR 碼生成取消：無效或空文字');
                alert('請輸入有效的文字或 URL 以生成 QR 碼。');
                return;
            }
            console.log('正在生成 QR 碼，文字:', text);

            try {
                const qrCode = new QRCode({
                    content: text,
                    width: 200,
                    height: 200,
                    padding: 4,
                    ecl: 'H',
                    color: '#000000',
                    background: '#ffffff'
                });
                const svgString = qrCode.svg();
                console.log('QR 碼 SVG 已生成，長度:', svgString.length);

                fabric.loadSVGFromString(svgString, (objects, options) => {
                    if (!objects || objects.length === 0) {
                        console.error('無法解析 QR 碼 SVG');
                        alert('生成 QR 碼失敗，請重試。');
                        return;
                    }
                    const group = fabric.util.groupSVGElements(objects, options);
                    group.set({
                        left: 100,
                        top: 100,
                        selectable: true,
                        evented: true
                    });
                    canvas.add(group);
                    canvas.setActiveObject(group);
                    canvas.renderAll();
                    console.log('QR 碼 SVG 已添加到畫布:', { left: 100, top: 100, objects: objects.map(obj => obj.type) });
                });
            } catch (error) {
                console.error('生成 QR 碼錯誤:', error);
                alert('生成 QR 碼時發生錯誤，請檢查控制台以獲取詳細信息。');
            }
        }

        function clearCanvas() {
            const objects = canvas.getObjects().filter(obj => !obj.isGrid);
            if (objects.length > 0) {
                if (confirm('是否清除畫布上的所有物件？')) {
                    objects.forEach(obj => canvas.remove(obj));
                    canvas.discardActiveObject();
                    filename = ''; // 清除檔案名稱
                    updateFilenameDisplay();
                    canvas.requestRenderAll();
                    console.log('畫布已清除，移除物件數:', objects.length, '檔案名稱已清除');
                } else {
                    console.log('用戶取消清除畫布');
                }
            } else {
                console.log('畫布已無物件可清除');
            }
        }

        function rotateLeft() {
            const activeObject = canvas.getActiveObject();
            if (!activeObject) {
                console.log('無選中物件可旋轉');
                return;
            }
            activeObject.rotate(activeObject.angle - 90);
            activeObject.setCoords();
            canvas.requestRenderAll();
            console.log('向左旋轉 90 度，當前角度:', activeObject.angle);
        }

        function rotateRight() {
            const activeObject = canvas.getActiveObject();
            if (!activeObject) {
                console.log('無選中物件可旋轉');
                return;
            }
            activeObject.rotate(activeObject.angle + 90);
            activeObject.setCoords();
            canvas.requestRenderAll();
            console.log('向右旋轉 90 度，當前角度:', activeObject.angle);
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Delete') {
                const activeObject = canvas.getActiveObject();
                if (!activeObject) {
                    console.log('無選中物件，忽略刪除鍵');
                    return;
                }
                if (activeObject.isEditing) {
                    console.log('文字編輯模式中按下刪除鍵，由 IText 處理');
                    return;
                }
                deleteSelected();
            }
        });

        function applyTextOptions() {
            const fontFamily = document.getElementById('fontFamily').value;
            const fontSize = parseInt(document.getElementById('fontSize').value);
            const fontWeight = document.getElementById('fontBold').checked ? 'bold' : 'normal';
            const underline = document.getElementById('underline').checked;

            const activeObjects = canvas.getActiveObjects();
            activeObjects.forEach(obj => {
                if (obj.type === 'i-text') {
                    obj.set({
                        fontFamily: fontFamily,
                        fontSize: fontSize,
                        fontWeight: fontWeight,
                        underline: underline
                    });
                }
            });
            canvas.requestRenderAll();
            console.log('應用文字選項:', { fontFamily, fontSize, fontWeight, underline });
        }

        document.getElementById('fontFamily').addEventListener('change', (e) => {
            console.log('字型變更:', e.target.value);
            applyTextOptions();
        });
        document.getElementById('fontSize').addEventListener('input', (e) => {
            console.log('字型大小變更:', e.target.value);
            applyTextOptions();
        });
        document.getElementById('fontBold').addEventListener('change', (e) => {
            console.log('粗體切換:', e.target.checked);
            applyTextOptions();
        });
        document.getElementById('underline').addEventListener('change', (e) => {
            console.log('底線切換:', e.target.checked);
            applyTextOptions();
        });

        // 框線顏色選擇窗事件監聽
        const strokeColorDisplay = bushes = document.getElementById('strokeColorDisplay');
        const strokeColorInput = document.getElementById('strokeColor');
        const strokeTransparentBtn = document.getElementById('strokeTransparentBtn');

        function showColorPanel() {
            try {
                const rect = strokeColorDisplay.getBoundingClientRect();
                const scrollY = window.scrollY || window.pageYOffset;
                const scrollX = window.scrollX || window.pageXOffset;
                const controlsHeight = document.querySelector('.controls').offsetHeight;
                
                // 計算相對於 #canvas-container 的位置
                const canvasContainerRect = canvasContainer.getBoundingClientRect();
                const top = rect.bottom - canvasContainerRect.top + 2; // 2px 間距
                const left = rect.left - canvasContainerRect.left; // 水平對齊圖標左邊
                
                // 確保面板不超出容器
                const panelWidth = 100; // 框線面板寬度
                const panelHeight = 60; // 框線面板高度
                const adjustedLeft = Math.min(left, canvasContainerRect.width - panelWidth - 10);
                const adjustedTop = Math.min(top, canvasContainerRect.height - panelHeight - 10);

                strokeColorPanel.style.top = `${adjustedTop}px`;
                strokeColorPanel.style.left = `${adjustedLeft}px`;
                strokeColorPanel.setAttribute('visible', 'true');
                console.log('顯示框線顏色選擇面板', { top: adjustedTop, left: adjustedLeft, controlsHeight });
            } catch (error) {
                console.error('顯示框線顏色選擇面板失敗:', error);
            }
        }

        function hideColorPanel() {
            strokeColorPanel.removeAttribute('visible');
            console.log('隱藏框線顏色選擇面板');
        }

        strokeColorDisplay.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            showColorPanel();
        });

        strokeColorInput.addEventListener('input', (e) => {
            strokeTransparent = false;
            strokeColorDisplay.value = e.target.value;
            strokeColorDisplay.style.backgroundColor = e.target.value;
            strokeColorDisplay.removeAttribute('transparent');
            if (canvas.isDrawingMode) {
                canvas.freeDrawingBrush.color = e.target.value;
                console.log('手繪筆刷顏色更新:', e.target.value);
            }
            applyStyles();
            console.log('框線顏色變更:', e.target.value);
        });

        strokeTransparentBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            strokeTransparent = true;
            strokeColorDisplay.value = 'transparent';
            strokeColorDisplay.style.backgroundColor = 'transparent';
            strokeColorDisplay.setAttribute('transparent', 'true');
            if (canvas.isDrawingMode) {
                canvas.isDrawingMode = false;
                setTool('cursor');
                console.log('手繪模式因框線透明而禁用，切換至游標工具');
            }
            applyStyles();
            hideColorPanel();
            console.log('框線設為透明');
        });

        // 框線寬度監聽
        document.getElementById('strokeWidth').addEventListener('input', (e) => {
            const width = parseInt(e.target.value) || 2;
            if (canvas.isDrawingMode) {
                canvas.freeDrawingBrush.width = width;
                console.log('手繪筆刷寬度更新:', width);
            }
            applyStyles();
            console.log('框線寬度變更:', width);
        });

        // 填充顏色與透明度選擇窗事件監聽
        const fillColorDisplay = document.getElementById('fillColorDisplay');
        const fillColorInput = document.getElementById('fillColor');
        const opacityInput = document.getElementById('opacity');
        const opacityUpBtn = document.getElementById('opacityUpBtn');
        const opacityDownBtn = document.getElementById('opacityDownBtn');

        function showFillColorPanel() {
            try {
                const rect = fillColorDisplay.getBoundingClientRect();
                const scrollY = window.scrollY || window.pageYOffset;
                const scrollX = window.scrollX || window.pageXOffset;
                const controlsHeight = document.querySelector('.controls').offsetHeight;
                
                // 計算相對於 #canvas-container 的位置
                const canvasContainerRect = canvasContainer.getBoundingClientRect();
                const top = rect.bottom - canvasContainerRect.top + 2; // 2px 間距
                const left = rect.left - canvasContainerRect.left; // 水平對齊圖標左邊
                
                // 確保面板不超出容器
                const panelWidth = 120; // 填充面板寬度
                const panelHeight = 60; // 填充面板高度
                const adjustedLeft = Math.min(left, canvasContainerRect.width - panelWidth - 10);
                const adjustedTop = Math.min(top, canvasContainerRect.height - panelHeight - 10);

                fillColorPanel.style.top = `${adjustedTop}px`;
                fillColorPanel.style.left = `${adjustedLeft}px`;
                fillColorPanel.setAttribute('visible', 'true');
                console.log('顯示填充顏色與透明度選擇面板', { top: adjustedTop, left: adjustedLeft, controlsHeight });
            } catch (error) {
                console.error('顯示填充顏色與透明度選擇面板失敗:', error);
            }
        }

        function hideFillColorPanel() {
            fillColorPanel.removeAttribute('visible');
            console.log('隱藏填充顏色與透明度選擇面板');
        }

        fillColorDisplay.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            showFillColorPanel();
        });

        fillColorInput.addEventListener('input', (e) => {
            fillColorDisplay.value = e.target.value;
            fillColorDisplay.style.backgroundColor = e.target.value;
            applyStyles();
            console.log('填充顏色變更:', e.target.value);
        });

        opacityInput.addEventListener('input', (e) => {
            let value = parseInt(e.target.value);
            if (isNaN(value) || value < 0) {
                value = 0;
            } else if (value > 100) {
                value = 100;
            }
            e.target.value = value;
            applyStyles();
            console.log('透明度變更:', value + '%');
        });

        opacityUpBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            let value = parseInt(opacityInput.value);
            if (value < 100) {
                opacityInput.value = value + 1;
                applyStyles();
                console.log('透明度增加:', opacityInput.value + '%');
            }
        });

        opacityDownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            let value = parseInt(opacityInput.value);
            if (value > 0) {
                opacityInput.value = value - 1;
                applyStyles();
                console.log('透明度減少:', opacityInput.value + '%');
            }
        });

        document.addEventListener('click', (e) => {
            if (!strokeColorPanel.contains(e.target) && e.target !== strokeColorDisplay) {
                hideColorPanel();
            }
            if (!fillColorPanel.contains(e.target) && e.target !== fillColorDisplay) {
                hideFillColorPanel();
            }
        });

        canvas.on('text:editing:entered', () => {
            console.log('進入文字編輯');
        });
        canvas.on('text:editing:exited', () => {
            console.log('退出文字編輯');
        });

        function updateButtonStates() {
            const groupBtn = document.getElementById('groupBtn');
            const ungroupBtn = document.getElementById('ungroupBtn');
            const bringForwardBtn = document.getElementById('bringForwardBtn');
            const sendBackwardBtn = document.getElementById('sendBackwardBtn');
            const duplicateBtn = document.getElementById('duplicateBtn');
            const activeObjects = canvas.getActiveObjects();
            const activeObject = canvas.getActiveObject();

            if (activeObjects.length > 1) {
                groupBtn.disabled = false;
                ungroupBtn.disabled = true;
                bringForwardBtn.disabled = true;
                sendBackwardBtn.disabled = true;
                duplicateBtn.disabled = true;
            } else if (activeObject && activeObject.type === 'group') {
                groupBtn.disabled = true;
                ungroupBtn.disabled = false;
                bringForwardBtn.disabled = canvas.getObjects().indexOf(activeObject) >= canvas.getObjects().length - 1;
                sendBackwardBtn.disabled = canvas.getObjects().indexOf(activeObject) <= 0;
                duplicateBtn.disabled = false;
            } else if (activeObject) {
                groupBtn.disabled = true;
                ungroupBtn.disabled = true;
                bringForwardBtn.disabled = canvas.getObjects().indexOf(activeObject) >= canvas.getObjects().length - 1;
                sendBackwardBtn.disabled = canvas.getObjects().indexOf(activeObject) <= 0;
                duplicateBtn.disabled = false;
            } else {
                groupBtn.disabled = true;
                ungroupBtn.disabled = true;
                bringForwardBtn.disabled = true;
                sendBackwardBtn.disabled = true;
                duplicateBtn.disabled = true;
            }
        }

        function updateCoordinates() {
            const activeObject = canvas.getActiveObject();
            const coordsDiv = document.getElementById('coordinates');
            if (activeObject) {
                const left = Math.round(activeObject.left);
                const top = Math.round(activeObject.top);
                coordsDiv.style.display = 'block';
                coordsDiv.textContent = `${left},${top}`;
                console.log('更新座標顯示:', { left, top });
            } else {
                coordsDiv.style.display = 'none';
                console.log('無選中物件，隱藏座標顯示');
            }
            updateFilenameDisplay(); // 確保檔案名稱顯示同步更新
        }

        canvas.on('selection:created', (e) => {
            if (e.target) {
                console.log('物件選中:', e.target.type);
            } else {
                console.log('選取創建但無目標');
            }
            updateButtonStates();
            updateCoordinates();
        });

        canvas.on('selection:updated', (e) => {
            console.log('選取更新:', e.target ? e.target.type : '無目標');
            updateButtonStates();
            updateCoordinates();
        });

        canvas.on('selection:cleared', () => {
            console.log('選取清除，畫布物件數:', canvas.getObjects().length);
            updateButtonStates();
            updateCoordinates();
        });

        canvas.on('object:moving', () => {
            updateCoordinates();
        });

        setTool('cursor');
        updateFilenameDisplay();

        this.getCanvas = () => canvas;
        this.resize = resizeCanvas;
        this.setTool = setTool;
        this.applyStyles = applyStyles;
        this.deleteSelected = deleteSelected;
        this.duplicateSelected = duplicateSelected;
        this.groupSelected = groupSelected;
        this.ungroupSelected = ungroupSelected;
        this.bringForward = bringForward;
        this.sendBackward = sendBackward;
        this.alignObjects = alignObjects;
        this.saveSVG = saveSVG;
        this.loadSVG = loadSVG;
        this.generateQRCode = generateQRCode;
        this.clearCanvas = clearCanvas;
        this.rotateLeft = rotateLeft;
        this.rotateRight = rotateRight;
    }

    global.AiSvgEdit = AiSvgEdit;
})(window, window.fabric, window.QRCode);