document.addEventListener('DOMContentLoaded', async () => {
    const mainScreen = document.getElementById('main-screen');
    const jsonListScreen = document.getElementById('json-list-screen');
    const editScreen = document.getElementById('edit-screen');
    const mainWriting = document.getElementById('main-writing');
    let editingJson = null;
    const MAIN_JSON_KEY = 'ai-chinese-writing-main';
    const JSON_LIST_KEY = 'ai-chinese-writing-list';
    const IMAGE_LIST_KEY = 'ai-chinese-writing-images';

    // 初始化 IndexedDB
    let db;
    const DB_NAME = 'AIChineseWritingDB';
    const DB_VERSION = 1;

    async function initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                // 創建三個 object store：主畫面 JSON、JSON 列表、圖片列表
                db.createObjectStore('main', { keyPath: 'key' });
                db.createObjectStore('jsonList', { keyPath: 'key' });
                db.createObjectStore('images', { keyPath: 'key' });
            };

            request.onsuccess = (event) => {
                db = event.target.result;
                resolve(db);
            };

            request.onerror = (event) => {
                console.error('IndexedDB 初始化失敗:', event);
                reject(event);
            };
        });
    }

    // 儲存資料到 IndexedDB
    async function saveToDB(storeName, key, data) {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.put({ key, data });
            request.onsuccess = () => resolve();
            request.onerror = (event) => reject(event);
        });
    }

    // 從 IndexedDB 讀取資料
    async function getFromDB(storeName, key) {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result ? request.result.data : null);
            request.onerror = (event) => reject(event);
        });
    }

    // 從 IndexedDB 刪除資料
    async function deleteFromDB(storeName, key) {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.delete(key);
            request.onsuccess = () => resolve();
            request.onerror = (event) => reject(event);
        });
    }

    // 初始化資料庫並載入主畫面
    await initDB();
    let imageList = (await getFromDB('images', IMAGE_LIST_KEY)) || [];
    await loadAndRenderMain();

    function showScreen(screen) {
        [mainScreen, jsonListScreen, editScreen].forEach(s => s.classList.remove('active'));
        screen.classList.add('active');
    }

    function renderMainWriting(data) {
        mainWriting.innerHTML = '';

        const backgroundLayer = document.createElement('div');
        backgroundLayer.className = 'background-layer';

        const aiWriting = document.createElement('ai-chinese-writing');
        aiWriting.setAttribute('line-spacing', '20');

        const validData = Array.isArray(data.data) && data.data.length > 0 ? data.data : [
            { text: '默然回首', color: '#000000', size: '100', spacing: 'end' },
            { text: '往事如煙', color: '#0000ff', size: '80', spacing: '30' }
        ];

        validData.forEach(item => {
            const writing = document.createElement('chinese-writing');
            writing.setAttribute('color', item.color || '#000000');
            writing.setAttribute('size', item.size || '100');
            writing.setAttribute('spacing', item.spacing || '0');
            writing.textContent = item.text || '';
            aiWriting.appendChild(writing);
        });

        mainWriting.appendChild(backgroundLayer);
        mainWriting.appendChild(aiWriting);
        applyBackgroundSettings(data.background || {}, backgroundLayer);
    }

    function applyBackgroundSettings(bg, layer) {
        layer.style.backgroundColor = bg.color || 'transparent';
        layer.style.backgroundImage = bg.image ? `url(${bg.image})` : 'none';
        layer.style.backgroundSize = 'cover';
        layer.style.backgroundPosition = 'center';
        layer.style.opacity = bg.opacity !== undefined ? bg.opacity : 1;
        layer.style.position = 'absolute';
        layer.style.top = '0';
        layer.style.left = '0';
        layer.style.width = '100%';
        layer.style.height = '100%';
        layer.style.zIndex = '1';
    }

    document.getElementById('menu-btn').addEventListener('click', () => {
        showScreen(jsonListScreen);
        loadJsonList();
    });

    document.getElementById('exit-json').addEventListener('click', async () => {
        await loadAndRenderMain();
        showScreen(mainScreen);
    });

    document.getElementById('add-json').addEventListener('click', () => {
        editingJson = { name: `new_${Date.now()}`, data: [], background: {} };
        showEditScreen();
    });

    document.getElementById('cancel-edit').addEventListener('click', () => {
        showScreen(jsonListScreen);
        loadJsonList();
    });

    document.getElementById('save-json').addEventListener('click', async () => {
        const filename = document.getElementById('json-filename').value.trim();
        if (!filename) {
            alert('請輸入檔案名稱！');
            return;
        }
        editingJson.name = filename.endsWith('.json') ? filename : `${filename}.json`;
        await saveJson();
        showScreen(jsonListScreen);
        await loadJsonList();
    });

    document.getElementById('add-line').addEventListener('click', () => {
        if (!editingJson) return;
        if (!Array.isArray(editingJson.data)) editingJson.data = [];
        editingJson.data.push({ text: '', size: '100', color: '#000000', spacing: '0' });
        renderEditTable();
    });

    document.getElementById('bg-color').addEventListener('input', e => {
        if (editingJson) {
            if (!editingJson.background) editingJson.background = {};
            editingJson.background.color = e.target.value;
        }
    });

    document.getElementById('bg-image').addEventListener('change', e => {
        if (editingJson) {
            if (!editingJson.background) editingJson.background = {};
            editingJson.background.image = e.target.value;
        }
    });

    document.getElementById('bg-opacity').addEventListener('input', e => {
        if (editingJson) {
            if (!editingJson.background) editingJson.background = {};
            editingJson.background.opacity = e.target.value;
        }
    });

    document.getElementById('upload-image').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const base64Image = event.target.result;
                imageList.push({ name: file.name, data: base64Image });
                await saveToDB('images', IMAGE_LIST_KEY, imageList);
                loadImageList();
            };
            reader.readAsDataURL(file);
        }
    });

    async function loadAndRenderMain() {
        const mainContent = await loadMainJson();
        renderMainWriting(mainContent);
    }

    async function loadJsonList() {
        const jsonList = (await getFromDB('jsonList', JSON_LIST_KEY)) || [];
        const list = document.getElementById('json-list');
        list.innerHTML = '';
        jsonList.forEach((file, index) => {
            if (!Array.isArray(file.data)) file.data = [];
            const displayName = file.name.replace('.json', '');
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${displayName}</td>
                <td>
                    <button class="btn btn-sm btn-primary action-btn edit-btn">編輯</button>
                    <button class="btn btn-sm btn-success action-btn display-btn">顯示</button>
                    <button class="btn btn-sm btn-danger action-btn delete-btn">刪除</button>
                </td>
            `;
            tr.querySelector('.edit-btn').addEventListener('click', () => {
                editingJson = JSON.parse(JSON.stringify(file));
                if (!Array.isArray(editingJson.data)) editingJson.data = [];
                if (!editingJson.background) editingJson.background = {};
                showEditScreen();
            });
            tr.querySelector('.display-btn').addEventListener('click', async () => {
                await saveToDB('main', MAIN_JSON_KEY, file);
                await loadAndRenderMain();
                showScreen(mainScreen);
            });
            tr.querySelector('.delete-btn').addEventListener('click', async () => {
                if (confirm(`確定要刪除 ${displayName} 嗎？`)) {
                    jsonList.splice(index, 1);
                    await saveToDB('jsonList', JSON_LIST_KEY, jsonList);
                    await loadJsonList();
                }
            });
            list.appendChild(tr);
        });
    }

    function showEditScreen() {
        if (!editingJson) return;
        if (!Array.isArray(editingJson.data)) editingJson.data = [];
        if (!editingJson.background) editingJson.background = {};
        showScreen(editScreen);
        document.getElementById('json-filename').value = editingJson.name.replace('.json', '');
        document.getElementById('bg-color').value = editingJson.background.color || '#ffffff';
        document.getElementById('bg-opacity').value = editingJson.background.opacity || 1;
        renderEditTable();
        loadImageList();
    }

    function renderEditTable() {
        const tbody = document.getElementById('edit-lines');
        tbody.innerHTML = '';
        editingJson.data.forEach((line, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><span class="drag-handle"></span></td>
                <td><input type="text" class="form-control text-input" value="${line.text}"></td>
                <td><input type="number" class="form-control size-input" value="${line.size}"></td>
                <td><input type="color" class="form-control color-input" value="${line.color}"></td>
                <td><input type="text" class="form-control spacing-input" value="${line.spacing}"></td>
                <td><button class="btn btn-sm btn-danger delete-line">刪除</button></td>
            `;
            tr.querySelector('.delete-line').addEventListener('click', () => {
                editingJson.data.splice(index, 1);
                renderEditTable();
            });
            tr.querySelector('.text-input').addEventListener('input', e => line.text = e.target.value);
            tr.querySelector('.size-input').addEventListener('input', e => line.size = e.target.value);
            tr.querySelector('.color-input').addEventListener('input', e => line.color = e.target.value);
            tr.querySelector('.spacing-input').addEventListener('input', e => line.spacing = e.target.value);

            const dragHandle = tr.querySelector('.drag-handle');
            let pressTimer;
            dragHandle.addEventListener('mousedown', () => {
                pressTimer = setTimeout(() => startDragging(tr, index), 500);
            });
            dragHandle.addEventListener('mouseup', () => clearTimeout(pressTimer));
            dragHandle.addEventListener('mouseleave', () => clearTimeout(pressTimer));

            tbody.appendChild(tr);
        });
    }

    function startDragging(row, startIndex) {
        row.classList.add('dragging');
        const tbody = document.getElementById('edit-lines');
        const rows = Array.from(tbody.getElementsByTagName('tr'));

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);

        function onMouseMove(e) {
            const targetRow = e.target.closest('tr');
            if (targetRow && targetRow !== row) {
                const targetIndex = rows.indexOf(targetRow);
                if ((startIndex === 0 && targetIndex < startIndex) || 
                    (startIndex === rows.length - 1 && targetIndex > startIndex)) return;

                tbody.removeChild(row);
                if (targetIndex < startIndex) {
                    tbody.insertBefore(row, targetRow);
                } else {
                    tbody.insertBefore(row, targetRow.nextSibling);
                }
                updateDataOrder();
            }
        }

        function onMouseUp() {
            row.classList.remove('dragging');
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }

        function updateDataOrder() {
            const newRows = Array.from(tbody.getElementsByTagName('tr'));
            const newData = newRows.map(row => ({
                text: row.querySelector('.text-input').value,
                size: row.querySelector('.size-input').value,
                color: row.querySelector('.color-input').value,
                spacing: row.querySelector('.spacing-input').value
            }));
            editingJson.data = newData;
        }
    }

    async function loadMainJson() {
        const mainJson = await getFromDB('main', MAIN_JSON_KEY);
        let data;
        try {
            data = mainJson || undefined;
        } catch (e) {
            console.error('解析主畫面 JSON 錯誤:', e);
        }
        if (!data || !Array.isArray(data.data)) {
            const defaultContent = {
                data: [
                    { text: '默然回首', color: '#000000', size: '100', spacing: 'end' },
                    { text: '往事如煙', color: '#0000ff', size: '80', spacing: '30' }
                ],
                background: {}
            };
            await saveToDB('main', MAIN_JSON_KEY, defaultContent);
            return defaultContent;
        }
        return data;
    }

    async function saveJson() {
        if (!editingJson) return;
        if (!Array.isArray(editingJson.data)) editingJson.data = [];
        if (!editingJson.background) editingJson.background = {};
        const jsonList = (await getFromDB('jsonList', JSON_LIST_KEY)) || [];
        const existingIndex = jsonList.findIndex(item => item.name === editingJson.name);
        if (existingIndex >= 0) {
            jsonList[existingIndex] = editingJson;
        } else {
            jsonList.push(editingJson);
        }
        await saveToDB('jsonList', JSON_LIST_KEY, jsonList);
    }

    function loadImageList() {
        const select = document.getElementById('bg-image');
        select.innerHTML = '<option value="">無圖片</option>';
        imageList.forEach(img => {
            const option = document.createElement('option');
            option.value = img.data;
            option.textContent = img.name;
            if (editingJson && editingJson.background.image === img.data) option.selected = true;
            select.appendChild(option);
        });
    }
});