document.addEventListener('DOMContentLoaded', () => {
    const jsonFileInput = document.getElementById('json-file');
    const jsonFileFilename = document.getElementById('json-file-filename');
    const headFieldTableBody = document.getElementById('head-field-table-body');
    const tailFieldTableBody = document.getElementById('tail-field-table-body');
    const listFieldTableBody = document.getElementById('list-field-table-body');
    const applyFormatBtn = document.getElementById('apply-format');
    const importRosterBtn = document.getElementById('import-roster');
    const exportRosterBtn = document.getElementById('export-roster');
    const saveRosterBtn = document.getElementById('save-roster');
    const importRosterFile = document.getElementById('import-roster-file');
    const headRosterTableHeader = document.getElementById('head-roster-table-header');
    const headRosterTableBody = document.getElementById('head-roster-table-body');
    const tailRosterTableHeader = document.getElementById('tail-roster-table-header');
    const tailRosterTableBody = document.getElementById('tail-roster-table-body');
    const listRosterTableHeader = document.getElementById('list-roster-table-header');
    const listRosterTableBody = document.getElementById('list-roster-table-body');
    const loadFromDBBtn = document.getElementById('load-from-db');
    const rosterDescriptionInput = document.getElementById('roster-description');

    let headFields = [];
    let tailFields = [];
    let listFields = [];
    let headRosterData = [{}];
    let tailRosterData = [{}];
    let listRosterData = [];
    let rosterDescription = '';
    let templateJsonData = null;
    let dataSource = null; // 追蹤資料來源：'jsonFile', 'bulletinDB', 或 null

    const DB_NAME = 'RosterDB';
    const STORE_NAME = 'rosterStore';
    let db;

    const showToast = (message, isError = false) => {
        const toastContainer = document.querySelector('.toast-container') || document.createElement('div');
        if (!document.querySelector('.toast-container')) {
            toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            document.body.appendChild(toastContainer);
        }

        const messageToast = document.getElementById('messageToast') || document.createElement('div');
        if (!document.getElementById('messageToast')) {
            messageToast.id = 'messageToast';
            messageToast.className = 'toast align-items-center text-white';
            messageToast.setAttribute('role', 'alert');
            messageToast.setAttribute('aria-live', 'assertive');
            messageToast.setAttribute('aria-atomic', 'true');
            messageToast.setAttribute('data-bs-autohide', 'true');
            messageToast.setAttribute('data-bs-delay', '3000');
            messageToast.innerHTML = `
                <div class="d-flex">
                    <div class="toast-body"></div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="關閉"></button>
                </div>
            `;
            toastContainer.appendChild(messageToast);
        }

        const toastBody = messageToast.querySelector('.toast-body');
        toastBody.textContent = message;
        messageToast.classList.remove('bg-success', 'bg-danger');
        messageToast.classList.add(isError ? 'bg-danger' : 'bg-success');

        const toast = new bootstrap.Toast(messageToast);
        toast.show();
    };

    const showConfirmToast = (message, onConfirm) => {
        const toastContainer = document.querySelector('.toast-container') || document.createElement('div');
        if (!document.querySelector('.toast-container')) {
            toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            document.body.appendChild(toastContainer);
        }

        const toastId = `toast-confirm-${Date.now()}`;
        const toastHtml = `
            <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header bg-warning text-dark">
                    <strong class="me-auto">確認</strong>
                    <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="關閉"></button>
                </div>
                <div class="toast-body">
                    ${message}
                    <div class="mt-2">
                        <button class="btn btn-primary btn-sm me-2 confirm-btn">確認</button>
                        <button class="btn btn-secondary btn-sm cancel-btn" data-bs-dismiss="toast">取消</button>
                    </div>
                </div>
            </div>
        `;
        toastContainer.insertAdjacentHTML('beforeend', toastHtml);

        const toastElement = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastElement, {
            autohide: false
        });
        toast.show();

        const confirmBtn = toastElement.querySelector('.confirm-btn');
        const cancelBtn = toastElement.querySelector('.cancel-btn');
        confirmBtn.addEventListener('click', () => {
            onConfirm();
            toast.hide();
        });
        cancelBtn.addEventListener('click', () => {
            toast.hide();
        });
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    };

    const initDB = () => {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, 1);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            };
            request.onsuccess = (event) => {
                db = event.target.result;
                resolve();
            };
            request.onerror = (event) => {
                reject('IndexedDB 初始化失敗: ' + event.target.error);
            };
        });
    };

    const saveToDB = async () => {
        try {
            const headFieldRows = document.querySelectorAll('#head-field-table-body tr');
            const tailFieldRows = document.querySelectorAll('#tail-field-table-body tr');
            const listFieldRows = document.querySelectorAll('#list-field-table-body tr');
            const headFieldData = Array.from(headFieldRows)
                .filter(row => row.querySelector('.field-name')?.value?.trim())
                .map(row => ({
                    key: row.querySelector('.field-name').value.trim(),
                    label: row.querySelector('.field-label')?.value?.trim() || row.querySelector('.field-name').value.trim(),
                    type: row.querySelector('.field-type')?.value || 'text',
                    list: row.querySelector('.list-items')?.value?.trim() || ''
                }));
            const tailFieldData = Array.from(tailFieldRows)
                .filter(row => row.querySelector('.field-name')?.value?.trim())
                .map(row => ({
                    key: row.querySelector('.field-name').value.trim(),
                    label: row.querySelector('.field-label')?.value?.trim() || row.querySelector('.field-name').value.trim(),
                    type: row.querySelector('.field-type')?.value || 'text',
                    list: row.querySelector('.list-items')?.value?.trim() || ''
                }));
            const listFieldData = Array.from(listFieldRows)
                .filter(row => row.querySelector('.field-name')?.value?.trim())
                .map(row => ({
                    key: row.querySelector('.field-name').value.trim(),
                    label: row.querySelector('.field-label')?.value?.trim() || row.querySelector('.field-name').value.trim(),
                    type: row.querySelector('.field-type')?.value || 'text',
                    list: row.querySelector('.list-items')?.value?.trim() || ''
                }));

            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            await store.put({ 
                id: 'roster', 
                headFields: headFieldData,
                tailFields: tailFieldData,
                listFields: listFieldData,
                headRoster: headRosterData,
                tailRoster: tailRosterData,
                listRoster: listRosterData,
                rosterDescription: rosterDescriptionInput.value.trim(),
                filename: jsonFileFilename.textContent 
            });
            showToast('儲存成功！');
        } catch (error) {
            console.error('儲存到 IndexedDB 失敗:', error);
            showToast(`儲存失敗：${error.message}`, true);
        }
    };

    const loadFromDB = async () => {
        try {
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get('roster');
            request.onsuccess = (event) => {
                const data = event.target.result;
                if (!data) {
                    console.log('IndexedDB 中無資料');
                    renderFieldList([], [], []);
                    return;
                }
                headFields = (data.headFields && Array.isArray(data.headFields)) ? data.headFields.filter(f => f.key?.trim()).map(f => f.key) : [];
                tailFields = (data.tailFields && Array.isArray(data.tailFields)) ? data.tailFields.filter(f => f.key?.trim()).map(f => f.key) : [];
                listFields = (data.listFields && Array.isArray(data.listFields)) ? data.listFields.filter(f => f.key?.trim()).map(f => f.key) : [];
                headRosterData = (data.headRoster && Array.isArray(data.headRoster)) ? data.headRoster : [{}];
                tailRosterData = (data.tailRoster && Array.isArray(data.tailRoster)) ? data.tailRoster : [{}];
                listRosterData = (data.listRoster && Array.isArray(data.listRoster)) ? data.listRoster : [];
                rosterDescription = data.rosterDescription || '';
                rosterDescriptionInput.value = rosterDescription;
                jsonFileFilename.textContent = data.filename || '從IndexedDB讀取';
                dataSource = null; // 從 RosterDB 載入，設置為 null
                templateJsonData = null; // 從 RosterDB 載入時無範本資料
                console.log('從 IndexedDB 載入:', { headFields, tailFields, listFields, rosterDescription });
                renderFieldList(data.headFields || [], data.tailFields || [], data.listFields || []);
                if (headFields.length > 0 || tailFields.length > 0 || listFields.length > 0) {
                    const headFormat = {};
                    const tailFormat = {};
                    const listFormat = {};
                    (data.headFields || []).forEach(field => {
                        if (field.key?.trim()) {
                            headFormat[field.key] = {
                                label: field.label || field.key,
                                type: field.type || 'text',
                                items: field.list ? field.list.split(',').map(item => item.trim()).filter(item => item) : []
                            };
                        }
                    });
                    (data.tailFields || []).forEach(field => {
                        if (field.key?.trim()) {
                            tailFormat[field.key] = {
                                label: field.label || field.key,
                                type: field.type || 'text',
                                items: field.list ? field.list.split(',').map(item => item.trim()).filter(item => item) : []
                            };
                        }
                    });
                    (data.listFields || []).forEach(field => {
                        if (field.key?.trim()) {
                            listFormat[field.key] = {
                                label: field.label || field.key,
                                type: field.type || 'text',
                                items: field.list ? field.list.split(',').map(item => item.trim()).filter(item => item) : []
                            };
                        }
                    });
                    renderRosterTables(headFormat, tailFormat, listFormat);
                } else {
                    console.log('無有效欄位資料，跳過渲染名冊表格');
                }
            };
            request.onerror = (event) => {
                console.error('載入 IndexedDB 資料失敗:', event.target.error);
                showToast('載入 IndexedDB 資料失敗', true);
            };
        } catch (error) {
            console.error('載入 IndexedDB 資料失敗:', error);
            showToast(`載入 IndexedDB 資料失敗：${error.message}`, true);
        }
    };

    const loadFieldsFromDB = async () => {
        try {
            const BULLETIN_DB_NAME = 'BulletinDB';
            const BULLETIN_STORE_NAME = 'settings';
            const request = indexedDB.open(BULLETIN_DB_NAME);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(BULLETIN_STORE_NAME)) {
                    db.createObjectStore(BULLETIN_STORE_NAME, { keyPath: 'id' });
                }
            };
            request.onsuccess = async (event) => {
                const bulletinDB = event.target.result;
                const transaction = bulletinDB.transaction([BULLETIN_STORE_NAME], 'readonly');
                const store = transaction.objectStore(BULLETIN_STORE_NAME);

                const headRequest = store.get('headData');
                const listRequest = store.get('listData');
                const tailRequest = store.get('tailData');

                const promises = [
                    new Promise((resolve) => {
                        headRequest.onsuccess = () => resolve(headRequest.result ? headRequest.result.data : {});
                        headRequest.onerror = () => resolve({});
                    }),
                    new Promise((resolve) => {
                        listRequest.onsuccess = () => resolve(listRequest.result ? listRequest.result.data : {});
                        listRequest.onerror = () => resolve({});
                    }),
                    new Promise((resolve) => {
                        tailRequest.onsuccess = () => resolve(tailRequest.result ? tailRequest.result.data : {});
                        tailRequest.onerror = () => resolve({});
                    })
                ];

                const [headData, listData, tailData] = await Promise.all(promises);
                const jsonData = { headData, listData, tailData };
                console.log('從 BulletinDB 載入原始數據:', jsonData);

                const { headFields: newHeadFields, tailFields: newTailFields, listFields: newListFields } = extractFields(jsonData);
                headFields = newHeadFields.filter(f => f.trim());
                tailFields = newTailFields.filter(f => f.trim());
                listFields = newListFields.filter(f => f.trim());
                jsonFileFilename.textContent = '從BulletinDB讀取';
                rosterDescriptionInput.value = ''; // Reset description when loading from BulletinDB
                rosterDescription = '';
                dataSource = 'bulletinDB'; // 設置資料來源為 bulletinDB
                templateJsonData = null; // 從 BulletinDB 載入時無範本檔案
                console.log('從 BulletinDB 載入欄位:', { headFields, tailFields, listFields });

                const headFieldData = headFields.map(key => ({
                    key: key.trim(),
                    label: key.trim(),
                    type: 'text',
                    list: ''
                }));
                const tailFieldData = tailFields.map(key => ({
                    key: key.trim(),
                    label: key.trim(),
                    type: 'text',
                    list: ''
                }));
                const listFieldData = listFields.map(key => ({
                    key: key.trim(),
                    label: key.trim(),
                    type: 'text',
                    list: ''
                }));
                console.log('轉換後的欄位數據:', { headFieldData, tailFieldData, listFieldData });

                renderFieldList(headFieldData, tailFieldData, listFieldData);
                if (headFields.length === 0 && tailFields.length === 0 && listFields.length === 0) {
                    console.log('BulletinDB 中無有效欄位資料');
                    showToast('BulletinDB 中無有效欄位資料', true);
                }
                bulletinDB.close();
            };
            request.onerror = (event) => {
                console.error('開啟 BulletinDB 失敗:', event.target.error);
                showToast(`開啟 BulletinDB 失敗：${event.target.error.message}`, true);
            };
        } catch (error) {
            console.error('從 BulletinDB 讀取欄位失敗:', error);
            showToast(`從 BulletinDB 讀取欄位失敗：${error.message}`, true);
        }
    };

    const extractFields = (jsonData) => {
        const headFieldSet = new Set();
        const tailFieldSet = new Set();
        const listFieldSet = new Set();

        const extractFromLines = (lines, fieldSet) => {
            if (!Array.isArray(lines)) return;
            lines.forEach(line => {
                if (line.text && typeof line.text === 'string') {
                    const matches = line.text.match(/\{([a-zA-Z0-9_]+)\}/g);
                    if (matches) {
                        matches.forEach(match => {
                            const field = match.slice(1, -1).trim();
                            if (field) {
                                fieldSet.add(field);
                                console.log(`提取欄位: ${field} from ${line.text}`);
                            }
                        });
                    }
                }
            });
        };

        if (jsonData.headData) {
            extractFromLines(jsonData.headData.head?.lines, headFieldSet);
            extractFromLines(jsonData.headData.tail?.lines, headFieldSet);
        }

        if (jsonData.listData) {
            extractFromLines(jsonData.listData.head?.lines, listFieldSet);
            extractFromLines(jsonData.listData.tail?.lines, listFieldSet);
        }

        if (jsonData.tailData) {
            extractFromLines(jsonData.tailData.head?.lines, tailFieldSet);
            extractFromLines(jsonData.tailData.tail?.lines, tailFieldSet);
        }

        const result = {
            headFields: Array.from(headFieldSet),
            tailFields: Array.from(tailFieldSet),
            listFields: Array.from(listFieldSet)
        };
        console.log('提取結果:', result);
        return result;
    };

    const renderFieldList = (headFieldData = [], tailFieldData = [], listFieldData = []) => {
        headFieldTableBody.innerHTML = '';
        tailFieldTableBody.innerHTML = '';
        listFieldTableBody.innerHTML = '';

        const renderTable = (fields, fieldData, tableBody, sectionName) => {
            console.log(`${sectionName} 輸入:`, { fields, fieldData });
            if (!fieldData.length && !fields.length) {
                tableBody.innerHTML = `<tr><td colspan="4" class="text-muted text-center">${sectionName} 無欄位標籤，請檢查 JSON 檔案</td></tr>`;
                console.log(`${sectionName} 無欄位標籤`);
                return;
            }
            const fieldsToRender = fieldData.length 
                ? fieldData.filter(f => f.key?.trim()) 
                : fields.filter(f => f.trim()).map(field => ({
                    key: field,
                    label: field,
                    type: 'text',
                    list: ''
                }));
            console.log(`${sectionName} fieldsToRender:`, fieldsToRender);
            if (!fieldsToRender.length) {
                tableBody.innerHTML = `<tr><td colspan="4" class="text-muted text-center">${sectionName} 無有效欄位</td></tr>`;
                console.log(`${sectionName} 無有效欄位`);
                return;
            }
            fieldsToRender.forEach((field, index) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>
                        <input type="text" class="form-control field-name" value="${field.key || ''}" readonly>
                    </td>
                    <td>
                        <input type="text" class="form-control field-label" placeholder="輸入標籤" value="${field.label || field.key || ''}">
                    </td>
                    <td>
                        <select class="form-select field-type">
                            <option value="text" ${field.type === 'text' ? 'selected' : ''}>文字</option>
                            <option value="list" ${field.type === 'list' ? 'selected' : ''}>列表</option>
                        </select>
                    </td>
                    <td>
                        <input type="text" class="form-control list-items" placeholder="用逗號分隔，例如: 男,女" value="${field.list || ''}" style="display: ${field.type === 'list' ? 'block' : 'none'};">
                    </td>
                `;
                tableBody.appendChild(tr);

                const typeSelect = tr.querySelector('.field-type');
                const listItemsInput = tr.querySelector('.list-items');
                typeSelect.addEventListener('change', () => {
                    listItemsInput.style.display = typeSelect.value === 'list' ? 'block' : 'none';
                });
            });
            console.log(`${sectionName} 渲染 ${fieldsToRender.length} 個欄位`);
        };

        renderTable(headFields, headFieldData, headFieldTableBody, 'Head Fields');
        renderTable(tailFields, tailFieldData, tailFieldTableBody, 'Tail Fields');
        renderTable(listFields, listFieldData, listFieldTableBody, 'List Fields');
    };

    jsonFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) {
            jsonFileFilename.textContent = '';
            rosterDescriptionInput.value = '';
            rosterDescription = '';
            headFieldTableBody.innerHTML = '';
            tailFieldTableBody.innerHTML = '';
            listFieldTableBody.innerHTML = '';
            templateJsonData = null;
            dataSource = null;
            console.log('未選擇檔案，重置 templateJsonData 和 dataSource');
            return;
        }
        jsonFileFilename.textContent = `已選擇: ${file.name}`;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const jsonData = JSON.parse(e.target.result);
                templateJsonData = jsonData;
                dataSource = 'jsonFile'; // 設置資料來源為 jsonFile
                rosterDescription = jsonData.rosterDescription || '';
                rosterDescriptionInput.value = rosterDescription;
                console.log('JSON 檔案載入成功:', { filename: file.name, rosterDescription, data: templateJsonData });
                const { headFields: newHeadFields, tailFields: newTailFields, listFields: newListFields } = extractFields(jsonData);
                headFields = newHeadFields.filter(f => f.trim());
                tailFields = newTailFields.filter(f => f.trim());
                listFields = newListFields.filter(f => f.trim());
                console.log('JSON 載入後欄位:', { headFields, tailFields, listFields });
                renderFieldList(
                    newHeadFields.map(key => ({ key, label: key, type: 'text', list: '' })), 
                    newTailFields.map(key => ({ key, label: key, type: 'text', list: '' })), 
                    newListFields.map(key => ({ key, label: key, type: 'text', list: '' }))
                );
                showToast(`成功載入 JSON 檔案：${file.name}`);
            } catch (error) {
                console.error('JSON 解析錯誤:', error);
                showToast(`無法解析 JSON 檔案：${error.message}`, true);
                headFieldTableBody.innerHTML = '<tr><td colspan="4" class="text-danger text-center">JSON 檔案解析失敗</td></tr>';
                tailFieldTableBody.innerHTML = '<tr><td colspan="4" class="text-danger text-center">JSON 檔案解析失敗</td></tr>';
                listFieldTableBody.innerHTML = '<tr><td colspan="4" class="text-danger text-center">JSON 檔案解析失敗</td></tr>';
                templateJsonData = null;
                dataSource = null;
                rosterDescriptionInput.value = '';
                rosterDescription = '';
                console.log('JSON 解析失敗，重置 templateJsonData 和 dataSource');
            }
        };
        reader.onerror = () => {
            showToast('無法讀取檔案', true);
            headFieldTableBody.innerHTML = '<tr><td colspan="4" class="text-danger text-center">無法讀取檔案</td></tr>';
            tailFieldTableBody.innerHTML = '<tr><td colspan="4" class="text-danger text-center">無法讀取檔案</td></tr>';
            listFieldTableBody.innerHTML = '<tr><td colspan="4" class="text-danger text-center">無法讀取檔案</td></tr>';
            templateJsonData = null;
            dataSource = null;
            rosterDescriptionInput.value = '';
            rosterDescription = '';
            console.log('檔案讀取失敗，重置 templateJsonData 和 dataSource');
        };
        reader.readAsText(file);
    });

    loadFromDBBtn.addEventListener('click', () => {
        loadFieldsFromDB();
    });

    applyFormatBtn.addEventListener('click', () => {
        const headFieldRows = document.querySelectorAll('#head-field-table-body tr');
        const tailFieldRows = document.querySelectorAll('#tail-field-table-body tr');
        const listFieldRows = document.querySelectorAll('#list-field-table-body tr');
        
        if (headFieldRows.length === 0 && tailFieldRows.length === 0 && listFieldRows.length === 0) {
            showToast('請先載入含有欄位標籤的 JSON 檔案或從DB讀取', true);
            return;
        }

        const headFormat = {};
        const tailFormat = {};
        const listFormat = {};
        let isValid = true;

        const processRows = (rows, format, sectionName) => {
            const validRows = Array.from(rows).filter(row => row.querySelector('.field-name')?.value?.trim());
            console.log(`${sectionName} 有效行數:`, validRows.length);
            if (validRows.length === 0) {
                console.log(`${sectionName} 無有效欄位，跳過處理`);
                return;
            }
            validRows.forEach((row, index) => {
                const nameInput = row.querySelector('.field-name');
                const labelInput = row.querySelector('.field-label');
                const typeSelect = row.querySelector('.field-type');
                const listItemsInput = row.querySelector('.list-items');
                if (!nameInput || !labelInput || !typeSelect) {
                    console.error(`${sectionName} 欄位 DOM 元素缺失`, row.outerHTML);
                    isValid = false;
                    return;
                }
                const name = nameInput.value.trim();
                const label = labelInput.value.trim();
                const type = typeSelect.value;
                const listItems = listItemsInput?.value?.trim() || '';
                if (!name) {
                    console.warn(`${sectionName} 欄位缺少名稱`, row.outerHTML);
                    isValid = false;
                    return;
                }
                if (!label) {
                    showToast(`請為 ${sectionName} 欄位 "${name}" 輸入標籤`, true);
                    isValid = false;
                    return;
                }
                format[name] = { label, type };
                if (type === 'list' && listItems) {
                    format[name].items = listItems.split(',').map(item => item.trim()).filter(item => item);
                }
                console.log(`${sectionName} 處理欄位:`, { name, label, type, items: format[name].items });
            });
        };

        processRows(headFieldRows, headFormat, 'Head');
        processRows(tailFieldRows, tailFormat, 'Tail');
        processRows(listFieldRows, listFormat, 'List');

        if (!isValid) {
            console.error('欄位格式驗證失敗，清除舊表格');
            headRosterTableHeader.innerHTML = '';
            headRosterTableBody.innerHTML = '';
            tailRosterTableHeader.innerHTML = '';
            tailRosterTableBody.innerHTML = '';
            listRosterTableHeader.innerHTML = '';
            listRosterTableBody.innerHTML = '';
            showToast('欄位格式驗證失敗，請檢查所有欄位標籤是否完整', true);
            return;
        }

        console.log('欄位格式:', { headFormat, tailFormat, listFormat });

        const applyFormats = () => {
            const newHeadRoster = [{}];
            const headKeys = Object.keys(headFormat);
            if (headRosterData[0]) {
                headKeys.forEach(key => {
                    newHeadRoster[0][key] = headRosterData[0][key] || '';
                });
            }
            headRosterData = newHeadRoster;

            const newTailRoster = [{}];
            const tailKeys = Object.keys(tailFormat);
            if (tailRosterData[0]) {
                tailKeys.forEach(key => {
                    newTailRoster[0][key] = tailRosterData[0][key] || '';
                });
            }
            tailRosterData = newTailRoster;

            const newListRoster = [];
            const listKeys = Object.keys(listFormat);
            listRosterData.forEach(row => {
                if (row.isdivider) {
                    newListRoster.push({ isdivider: true, text: row.text || '' });
                } else {
                    const newRow = {};
                    listKeys.forEach(key => {
                        newRow[key] = row[key] || '';
                    });
                    newListRoster.push(newRow);
                }
            });
            listRosterData = newListRoster;

            headFields = headKeys;
            tailFields = tailKeys;
            listFields = listKeys;

            renderRosterTables(headFormat, tailFormat, listFormat);
            showToast('欄位格式已套用');
        };

        if (headRosterTableHeader.children.length > 0 || tailRosterTableHeader.children.length > 0 || listRosterTableHeader.children.length > 0) {
            showConfirmToast('已有名冊表單，是否套用新的欄位格式？', applyFormats);
        } else {
            applyFormats();
        }
    });

    const renderRosterTables = (headFormat, tailFormat, listFormat) => {
        console.log('開始渲染名冊表格:', { headFormat, tailFormat, listFormat });

        headRosterTableHeader.innerHTML = '';
        headRosterTableBody.innerHTML = '';
        tailRosterTableHeader.innerHTML = '';
        tailRosterTableBody.innerHTML = '';
        listRosterTableHeader.innerHTML = '';
        listRosterTableBody.innerHTML = '';

        if (Object.keys(headFormat).length === 0) {
            headRosterTableHeader.innerHTML = '<th class="text-muted">無欄位</th>';
            headRosterTableBody.innerHTML = '<tr><td class="text-muted text-center">無資料</td></tr>';
        } else {
            Object.entries(headFormat).forEach(([name, { label }]) => {
                const th = document.createElement('th');
                th.textContent = label;
                headRosterTableHeader.appendChild(th);
            });

            const headRow = headRosterData[0];
            const headTr = document.createElement('tr');
            Object.keys(headFormat).forEach(name => {
                const td = document.createElement('td');
                if (headFormat[name].type === 'list' && headFormat[name].items) {
                    const select = document.createElement('select');
                    select.className = 'form-select';
                    select.innerHTML = '<option value="">選擇...</option>' + 
                        headFormat[name].items.map(item => `<option value="${item}" ${headRow[name] === item ? 'selected' : ''}>${item}</option>`).join('');
                    select.addEventListener('change', (e) => {
                        headRosterData[0][name] = e.target.value;
                    });
                    td.appendChild(select);
                } else {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.className = 'form-control';
                    input.value = headRow[name] || '';
                    input.addEventListener('input', (e) => {
                        headRosterData[0][name] = e.target.value;
                    });
                    td.appendChild(input);
                }
                headTr.appendChild(td);
            });
            headRosterTableBody.appendChild(headTr);
        }

        if (Object.keys(tailFormat).length === 0) {
            tailRosterTableHeader.innerHTML = '<th class="text-muted">無欄位</th>';
            tailRosterTableBody.innerHTML = '<tr><td class="text-muted text-center">無資料</td></tr>';
        } else {
            Object.entries(tailFormat).forEach(([name, { label }]) => {
                const th = document.createElement('th');
                th.textContent = label;
                tailRosterTableHeader.appendChild(th);
            });

            const tailRow = tailRosterData[0];
            const tailTr = document.createElement('tr');
            Object.keys(tailFormat).forEach(name => {
                const td = document.createElement('td');
                if (tailFormat[name].type === 'list' && tailFormat[name].items) {
                    const select = document.createElement('select');
                    select.className = 'form-select';
                    select.innerHTML = '<option value="">選擇...</option>' + 
                        tailFormat[name].items.map(item => `<option value="${item}" ${tailRow[name] === item ? 'selected' : ''}>${item}</option>`).join('');
                    select.addEventListener('change', (e) => {
                        tailRosterData[0][name] = e.target.value;
                    });
                    td.appendChild(select);
                } else {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.className = 'form-control';
                    input.value = tailRow[name] || '';
                    input.addEventListener('input', (e) => {
                        tailRosterData[0][name] = e.target.value;
                    });
                    td.appendChild(input);
                }
                tailTr.appendChild(td);
            });
            tailRosterTableBody.appendChild(tailTr);
        }

        if (Object.keys(listFormat).length === 0) {
            listRosterTableHeader.innerHTML = '<th class="text-muted">無欄位</th>';
            listRosterTableBody.innerHTML = '<tr><td class="text-muted text-center">無資料</td></tr>';
        } else {
            Object.entries(listFormat).forEach(([name, { label }]) => {
                const th = document.createElement('th');
                th.textContent = label;
                listRosterTableHeader.appendChild(th);
            });
            const actionTh = document.createElement('th');
            actionTh.textContent = '操作';
            actionTh.style.width = '144px';
            listRosterTableHeader.appendChild(actionTh);

            listRosterData.forEach((row, rowIndex) => {
                const tr = document.createElement('tr');
                if (row.isdivider) {
                    tr.className = 'title-row';
                    const titleTd = document.createElement('td');
                    titleTd.colSpan = Object.keys(listFormat).length; // 佔據所有資料欄
                    const inputGroup = document.createElement('div');
                    inputGroup.className = 'input-group';
                    const label = document.createElement('span');
                    label.className = 'input-group-text';
                    label.textContent = '標題';
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.className = 'form-control';
                    input.value = row.text || '';
                    input.addEventListener('input', (e) => {
                        listRosterData[rowIndex].text = e.target.value;
                    });
                    inputGroup.appendChild(label);
                    inputGroup.appendChild(input);
                    titleTd.appendChild(inputGroup);
                    tr.appendChild(titleTd);
                } else {
                    Object.keys(listFormat).forEach(name => {
                        const td = document.createElement('td');
                        if (listFormat[name].type === 'list' && listFormat[name].items) {
                            const select = document.createElement('select');
                            select.className = 'form-select';
                            select.innerHTML = '<option value="">選擇...</option>' + 
                                listFormat[name].items.map(item => `<option value="${item}" ${row[name] === item ? 'selected' : ''}>${item}</option>`).join('');
                            select.addEventListener('change', (e) => {
                                listRosterData[rowIndex][name] = e.target.value;
                            });
                            td.appendChild(select);
                        } else {
                            const input = document.createElement('input');
                            input.type = 'text';
                            input.className = 'form-control';
                            input.value = row[name] || '';
                            input.addEventListener('input', (e) => {
                                listRosterData[rowIndex][name] = e.target.value;
                            });
                            td.appendChild(input);
                        }
                        tr.appendChild(td);
                    });
                }

                const actionTd = document.createElement('td');
                actionTd.className = 'd-flex gap-1 align-items-center justify-content-center';
                actionTd.style.width = '144px';

                const buttonWidth = (144 - 2 * 4) / 3;

                if (rowIndex !== 0) {
                    const upBtn = document.createElement('button');
                    upBtn.className = 'btn btn-primary btn-sm';
                    upBtn.innerHTML = '<i class="bi bi-arrow-up"></i>';
                    upBtn.style.width = `${buttonWidth}px`;
                    upBtn.addEventListener('click', () => {
                        [listRosterData[rowIndex], listRosterData[rowIndex - 1]] = 
                        [listRosterData[rowIndex - 1], listRosterData[rowIndex]];
                        renderRosterTables(headFormat, tailFormat, listFormat);
                    });
                    actionTd.appendChild(upBtn);
                } else {
                    const placeholder = document.createElement('span');
                    placeholder.style.width = `${buttonWidth}px`;
                    actionTd.appendChild(placeholder);
                }

                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'btn btn-danger btn-sm';
                deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
                deleteBtn.style.width = `${buttonWidth}px`;
                deleteBtn.addEventListener('click', () => {
                    showConfirmToast('確定要刪除這一行嗎？', () => {
                        listRosterData.splice(rowIndex, 1);
                        renderRosterTables(headFormat, tailFormat, listFormat);
                    });
                });
                actionTd.appendChild(deleteBtn);

                if (rowIndex !== listRosterData.length - 1) {
                    const downBtn = document.createElement('button');
                    downBtn.className = 'btn btn-primary btn-sm';
                    downBtn.innerHTML = '<i class="bi bi-arrow-down"></i>';
                    downBtn.style.width = `${buttonWidth}px`;
                    downBtn.addEventListener('click', () => {
                        [listRosterData[rowIndex], listRosterData[rowIndex + 1]] = 
                        [listRosterData[rowIndex + 1], listRosterData[rowIndex]];
                        renderRosterTables(headFormat, tailFormat, listFormat);
                    });
                    actionTd.appendChild(downBtn);
                } else {
                    const placeholder = document.createElement('span');
                    placeholder.style.width = `${buttonWidth}px`;
                    actionTd.appendChild(placeholder);
                }

                tr.appendChild(actionTd);
                listRosterTableBody.appendChild(tr);
            });

            // 移除舊的按鈕組（如果存在）
            const existingButtonGroup = document.getElementById('list-roster-button-group');
            if (existingButtonGroup) {
                existingButtonGroup.remove();
            }

            // 動態添加「新增標題」和「新增一行」按鈕到表格下方
            const buttonGroup = document.createElement('div');
            buttonGroup.id = 'list-roster-button-group';
            buttonGroup.className = 'button-group mt-3';
            buttonGroup.innerHTML = `
                <button id="add-title" class="btn add-title-btn">新增標題</button>
                <button id="add-row" class="btn btn-primary">新增一行</button>
            `;
            const listRosterTable = document.getElementById('list-roster-table');
            listRosterTable.insertAdjacentElement('afterend', buttonGroup);

            // 為新按鈕添加事件監聽器
            const addTitleBtn = document.getElementById('add-title');
            const addRowBtn = document.getElementById('add-row');

            addTitleBtn.addEventListener('click', () => {
                listRosterData.push({ isdivider: true, text: '' });
                renderRosterTables(headFormat, tailFormat, listFormat);
            });

            addRowBtn.addEventListener('click', () => {
                const newRow = {};
                Object.keys(listFormat).forEach(name => {
                    newRow[name] = '';
                });
                listRosterData.push(newRow);
                renderRosterTables(headFormat, tailFormat, listFormat);
            });
        }
        console.log('完成渲染名冊表格');
    };

    // 移除與「匯入名冊」並列的「新增標題」和「新增一行」按鈕
    const importButtonGroup = importRosterBtn?.parentElement?.querySelector('.button-group');
    if (importButtonGroup) {
        const buttonsToRemove = importButtonGroup.querySelectorAll('button:not(#import-roster):not(#export-roster)');
        buttonsToRemove.forEach(button => button.remove());
    }

    importRosterBtn.addEventListener('click', () => {
        importRosterFile.click();
    });

    importRosterFile.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const jsonData = JSON.parse(e.target.result);
                if (!jsonData.headFields || !jsonData.tailFields || !jsonData.listFields || !Array.isArray(jsonData.listRoster)) {
                    throw new Error('JSON 格式錯誤，缺少 headFields, tailFields, listFields 或 listRoster 陣列');
                }

                const importData = () => {
                    headFields = jsonData.headFields.filter(f => f.key?.trim()).map(f => f.key);
                    tailFields = jsonData.tailFields.filter(f => f.key?.trim()).map(f => f.key);
                    listFields = jsonData.listFields.filter(f => f.key?.trim()).map(f => f.key);
                    headRosterData = jsonData.headRoster && Array.isArray(jsonData.headRoster) ? jsonData.headRoster : [{}];
                    tailRosterData = jsonData.tailRoster && Array.isArray(jsonData.tailRoster) ? jsonData.tailRoster : [{}];
                    listRosterData = jsonData.listRoster && Array.isArray(jsonData.listRoster) ? jsonData.listRoster : [];
                    rosterDescription = jsonData.rosterDescription || '';
                    rosterDescriptionInput.value = rosterDescription;
                    jsonFileFilename.textContent = jsonData.template ? `已選擇: ${jsonData.template}` : `已選擇: ${file.name}`;
                    dataSource = 'jsonFile'; // 匯入名冊視為 JSON 檔案來源
                    templateJsonData = jsonData.settings || null; // 如果匯入的 JSON 包含 settings，儲存為範本資料
                    console.log('匯入名冊 JSON:', { 
                        filename: file.name, 
                        rosterDescription: jsonData.rosterDescription, 
                        template: jsonData.template, 
                        settings: templateJsonData 
                    });
                    renderFieldList(jsonData.headFields, jsonData.tailFields, jsonData.listFields);
                    const headFormat = {};
                    const tailFormat = {};
                    const listFormat = {};
                    jsonData.headFields.forEach(field => {
                        if (field.key?.trim()) {
                            headFormat[field.key] = {
                                label: field.label || field.key,
                                type: field.type || 'text',
                                items: field.list ? field.list.split(',').map(item => item.trim()).filter(item => item) : []
                            };
                        }
                    });
                    jsonData.tailFields.forEach(field => {
                        if (field.key?.trim()) {
                            tailFormat[field.key] = {
                                label: field.label || field.key,
                                type: field.type || 'text',
                                items: field.list ? field.list.split(',').map(item => item.trim()).filter(item => item) : []
                            };
                        }
                    });
                    jsonData.listFields.forEach(field => {
                        if (field.key?.trim()) {
                            listFormat[field.key] = {
                                label: field.label || field.key,
                                type: field.type || 'text',
                                items: field.list ? field.list.split(',').map(item => item.trim()).filter(item => item) : []
                            };
                        }
                    });
                    renderRosterTables(headFormat, tailFormat, listFormat);
                    showToast(`名冊已成功匯入，名冊說明：${rosterDescription || '無'}`);
                };

                // 檢查名冊表格是否有資料
                if (headRosterTableHeader.children.length > 0 || 
                    tailRosterTableHeader.children.length > 0 || 
                    listRosterTableHeader.children.length > 0) {
                    showConfirmToast('已有名冊資料，是否覆蓋？', importData);
                } else {
                    importData();
                }
            } catch (error) {
                console.error('匯入名冊 JSON 解析錯誤:', error);
                showToast(`無法解析名冊 JSON 檔案：${error.message}`, true);
                templateJsonData = null;
                dataSource = null;
                rosterDescriptionInput.value = '';
                rosterDescription = '';
            }
        };
        reader.onerror = () => {
            showToast('無法讀取檔案', true);
            templateJsonData = null;
            dataSource = null;
            rosterDescriptionInput.value = '';
            rosterDescription = '';
            console.log('匯入名冊檔案讀取失敗，重置 templateJsonData 和 dataSource');
        };
        reader.readAsText(file);
        importRosterFile.value = '';
    });

    exportRosterBtn.addEventListener('click', () => {
        const headFieldRows = document.querySelectorAll('#head-field-table-body tr');
        const tailFieldRows = document.querySelectorAll('#tail-field-table-body tr');
        const listFieldRows = document.querySelectorAll('#list-field-table-body tr');
        const headFieldData = Array.from(headFieldRows)
            .filter(row => row.querySelector('.field-name')?.value?.trim())
            .map(row => ({
                key: row.querySelector('.field-name').value.trim(),
                label: row.querySelector('.field-label')?.value?.trim() || row.querySelector('.field-name').value.trim(),
                type: row.querySelector('.field-type')?.value || 'text',
                list: row.querySelector('.list-items')?.value?.trim() || ''
            }));
        const tailFieldData = Array.from(tailFieldRows)
            .filter(row => row.querySelector('.field-name')?.value?.trim())
            .map(row => ({
                key: row.querySelector('.field-name').value.trim(),
                label: row.querySelector('.field-label')?.value?.trim() || row.querySelector('.field-name').value.trim(),
                type: row.querySelector('.field-type')?.value || 'text',
                list: row.querySelector('.list-items')?.value?.trim() || ''
            }));
        const listFieldData = Array.from(listFieldRows)
            .filter(row => row.querySelector('.field-name')?.value?.trim())
            .map(row => ({
                key: row.querySelector('.field-name').value.trim(),
                label: row.querySelector('.field-label')?.value?.trim() || row.querySelector('.field-name').value.trim(),
                type: row.querySelector('.field-type')?.value || 'text',
                list: row.querySelector('.list-items')?.value?.trim() || ''
            }));
        const exportData = {
            headFields: headFieldData,
            tailFields: tailFieldData,
            listFields: listFieldData,
            headRoster: headRosterData,
            tailRoster: tailRosterData,
            listRoster: listRosterData,
            rosterDescription: rosterDescriptionInput.value.trim(),
            template: jsonFileFilename.textContent.replace('已選擇: ', '').trim() || '無模板'
        };
        console.log('匯出名冊 JSON:', { 
            rosterDescription: exportData.rosterDescription, 
            template: exportData.template 
        });
        const jsonString = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'roster-data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast(`名冊已匯出為 roster-data.json，名冊說明：${exportData.rosterDescription || '無'}`);
    });

    saveRosterBtn.addEventListener('click', () => {
        saveToDB();
    });

    initDB().then(() => {
        loadFromDB();
    }).catch(error => {
        console.error('IndexedDB 初始化失敗:', error);
        showToast(`無法初始化 IndexedDB：${error.message}`, true);
    });
});