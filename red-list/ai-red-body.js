document.addEventListener('DOMContentLoaded', () => {
    const listPage = document.querySelector('.list-page');
    const listBackBtn = document.querySelector('.list-page .back-btn');
    const listSaveBtn = document.querySelector('.list-page .save-btn');
    const messageToast = document.getElementById('messageToast');
    const toastBody = messageToast.querySelector('.toast-body');
    const toast = new bootstrap.Toast(messageToast);

    const dbName = 'BulletinDB';
    const storeName = 'settings';
    let db;

    const showToast = (message, isError = false) => {
        toastBody.textContent = message;
        messageToast.classList.remove('bg-success', 'bg-danger');
        messageToast.classList.add(isError ? 'bg-danger' : 'bg-success');
        toast.show();
    };

    const openDB = () => {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(dbName, 15);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(storeName)) {
                    db.createObjectStore(storeName, { keyPath: 'id' });
                }
            };
            request.onsuccess = (event) => {
                db = event.target.result;
                console.log('IndexedDB opened successfully, version:', db.version);
                resolve(db);
            };
            request.onerror = (event) => {
                console.error('IndexedDB open failed:', event.target.error);
                showToast(`無法開啟資料庫: ${event.target.error.message}`, true);
                reject(event.target.error);
            };
        });
    };

    const saveToIndexedDB = (id, data) => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put({ id, data });
            request.onsuccess = () => {
                console.log(`Saved ${id} to IndexedDB:`, data);
                resolve();
            };
            request.onerror = (event) => {
                console.error(`Error saving ${id} to IndexedDB:`, event.target.error);
                showToast(`儲存 ${id} 失敗: ${event.target.error.message}`, true);
                reject(event.target.error);
            };
        });
    };

    const getFromIndexedDB = (id) => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);
            request.onsuccess = (event) => {
                const result = event.target.result;
                console.log(`Retrieved ${id} from IndexedDB:`, result ? result.data : {});
                resolve(result ? result.data : {});
            };
            request.onerror = (event) => {
                console.error(`Error retrieving ${id} from IndexedDB:`, event.target.error);
                showToast(`無法讀取 ${id}: ${event.target.error.message}`, true);
                reject(event.target.error);
            };
        });
    };

    const safeSetDisplay = (element, display) => {
        if (element) {
            element.style.display = display;
        } else {
            console.error(`Element not found for display setting: ${element}`);
        }
    };

    const fillForm = async () => {
        try {
            const data = await getFromIndexedDB('listData');
            console.log('Filling form with listData:', data);
            const prefix = 'list';

            // Fill ai-red-list section
            const listWidth = document.getElementById(`${prefix}-list-width`);
            const listHeight = document.getElementById(`${prefix}-list-height`);
            const listShape = document.getElementById(`${prefix}-list-shape`);
            const listPeak = document.getElementById(`${prefix}-list-peak`);
            const listColorOption = document.getElementById(`${prefix}-list-color-option`);
            const listColor = document.getElementById(`${prefix}-list-color`);
            const listLineSpacing = document.getElementById(`${prefix}-list-line-spacing`);
            const dividerSize = document.getElementById('list-divider-font-size');
            const dividerAlign = document.getElementById('list-divider-align');
            const dividerSpacing = document.getElementById('list-divider-spacing');
            const dividerColor = document.getElementById('list-divider-color');

            if (listWidth && listHeight && listShape && listPeak && listColorOption && listColor && listLineSpacing && dividerSize && dividerAlign && dividerSpacing && dividerColor) {
                listWidth.value = data.list?.width || '100';
                listHeight.value = data.list?.height || '938';
                listShape.value = data.list?.shape || 'square';
                const peakContainer = document.getElementById('list-list-peak-container');
                if (peakContainer) {
                    peakContainer.style.display = (listShape.value === 'inner' || listShape.value === 'outer') ? 'block' : 'none';
                }
                listPeak.value = data.list?.peak || '20';
                listColorOption.value = data.list?.colorOption || 'transparent';
                listColor.value = data.list?.color || '#f44848';
                listLineSpacing.value = data.list?.lineSpacing || '10';
                safeSetDisplay(listColor, listColorOption.value === 'custom' ? 'block' : 'none');
                dividerSize.value = data.divider?.size || '24';
                dividerAlign.value = data.divider?.align || 'center';
                dividerSpacing.value = data.divider?.spacing || '10';
                dividerColor.value = data.divider?.color || '#ff0000';
            } else {
                console.warn('List form elements not found');
            }

            // Fill red-head section
            const headSpacing = document.getElementById(`${prefix}-head-spacing`);
            const headAlign = document.getElementById(`${prefix}-head-align`);
            const headHeight = document.getElementById(`${prefix}-head-height`);
            const headLineSpacing = document.getElementById(`${prefix}-head-line-spacing`);

            if (headSpacing && headAlign && headHeight && headLineSpacing) {
                headSpacing.value = data.head?.spacing || '10';
                headAlign.value = data.head?.align || 'center';
                headHeight.value = data.head?.height || '900';
                headLineSpacing.value = data.head?.lineSpacing || '10';

                const headLinesContainer = document.getElementById(`${prefix}-head-lines`);
                if (headLinesContainer) {
                    const dynamicLines = headLinesContainer.querySelector('.dynamic-lines');
                    dynamicLines.innerHTML = '';
                    const headLines = data.head?.lines?.length > 0 ? data.head.lines : [{ text: '榜單標題', size: 50, color: '#000000', spacing: 'center' }];
                    headLines.forEach(line => {
                        const lineDiv = document.createElement('div');
                        lineDiv.className = 'line-input';
                        lineDiv.innerHTML = `
                            <input type="text" class="form-control" placeholder="輸入文字" style="flex: 0 0 50%;" value="${line.text || ''}">
                            <input type="number" class="form-control" placeholder="文字大小" value="${line.size || '50'}" min="10" max="50">
                            <input type="color" class="form-control form-control-color" value="${line.color || '#000000'}">
                            <select class="form-select">
                                <option value="0" ${line.spacing === '0' ? 'selected' : ''}>頂部</option>
                                <option value="center" ${line.spacing === 'center' ? 'selected' : ''}>中間</option>
                                <option value="end" ${line.spacing === 'end' ? 'selected' : ''}>底部</option>
                            </select>
                            <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">刪除</button>
                        `;
                        dynamicLines.appendChild(lineDiv);
                    });
                }
            } else {
                console.warn('Head form elements not found');
            }

            // Fill red-tail section
            const tailSpacing = document.getElementById(`${prefix}-tail-spacing`);
            const tailAlign = document.getElementById(`${prefix}-tail-align`);
            const tailLineSpacing = document.getElementById(`${prefix}-tail-line-spacing`);

            if (tailSpacing && tailAlign && tailLineSpacing) {
                tailSpacing.value = data.tail?.spacing || '30';
                tailAlign.value = data.tail?.align || 'center';
                tailLineSpacing.value = data.tail?.lineSpacing || '10';

                const tailLinesContainer = document.getElementById(`${prefix}-tail-lines`);
                if (tailLinesContainer) {
                    const dynamicLines = tailLinesContainer.querySelector('.dynamic-lines');
                    dynamicLines.innerHTML = '';
                    const tailLines = data.tail?.lines?.length > 0 ? data.tail.lines : [];
                    tailLines.forEach(line => {
                        const lineDiv = document.createElement('div');
                        lineDiv.className = 'line-input';
                        lineDiv.innerHTML = `
                            <input type="text" class="form-control" placeholder="輸入文字" style="flex: 0 0 50%;" value="${line.text || ''}">
                            <input type="number" class="form-control" placeholder="文字大小" value="${line.size || '50'}" min="10" max="50">
                            <input type="color" class="form-control form-control-color" value="${line.color || '#000000'}">
                            <select class="form-select">
                                <option value="0" ${line.spacing === '0' ? 'selected' : ''}>頂部</option>
                                <option value="center" ${line.spacing === 'center' ? 'selected' : ''}>中間</option>
                                <option value="end" ${line.spacing === 'end' ? 'selected' : ''}>底部</option>
                            </select>
                            <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">刪除</button>
                        `;
                        dynamicLines.appendChild(lineDiv);
                    });
                }
            } else {
                console.warn('Tail form elements not found');
            }
        } catch (error) {
            console.error('Error filling form:', error);
            showToast(`載入表單資料失敗: ${error.message}`, true);
        }
    };

    const collectLines = (section) => {
        const lines = [];
        const container = document.querySelector(`#${section}-lines .dynamic-lines`);
        if (container) {
            container.querySelectorAll('.line-input').forEach(line => {
                const text = line.querySelector('input[type="text"]').value.trim();
                if (text) {
                    lines.push({
                        text,
                        size: Math.min(parseInt(line.querySelector('input[type="number"]').value) || 50, 50),
                        color: line.querySelector('input[type="color"]').value || '#000000',
                        spacing: line.querySelector('select').value || 'center'
                    });
                }
            });
        }
        return lines;
    };

    const addLine = (section) => {
        const container = document.querySelector(`#${section}-lines .dynamic-lines`);
        if (container) {
            const lineDiv = document.createElement('div');
            lineDiv.className = 'line-input';
            lineDiv.innerHTML = `
                <input type="text" class="form-control" placeholder="輸入文字" style="flex: 0 0 50%;">
                <input type="number" class="form-control" placeholder="文字大小" value="50" min="10" max="50">
                <input type="color" class="form-control form-control-color" value="#000000">
                <select class="form-select">
                    <option value="0">頂部</option>
                    <option value="center" selected>中間</option>
                    <option value="end">底部</option>
                </select>
                <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">刪除</button>
            `;
            container.appendChild(lineDiv);
        }
    };

    if (listBackBtn) {
        listBackBtn.addEventListener('click', () => {
            window.location.href = 'ai-red-bulletin.html';
        });
    }

    if (listSaveBtn) {
        listSaveBtn.addEventListener('click', async () => {
            try {
                const headHeight = parseInt(document.getElementById('list-head-height').value) || 900;
                const headSpacing = parseInt(document.getElementById('list-head-spacing').value) || 10;
                const tailSpacing = parseInt(document.getElementById('list-tail-spacing').value) || 30;
                const listHeight = parseInt(document.getElementById('list-list-height').value) || 938;
                const data = {
                    divider: {
                        size: document.getElementById('list-divider-font-size').value || '24',
                        align: document.getElementById('list-divider-align').value || 'center',
                        spacing: document.getElementById('list-divider-spacing').value || '10',
                        color: document.getElementById('list-divider-color').value || '#ff0000'
                    },
                    list: {
                        width: document.getElementById('list-list-width').value || '100',
                        height: listHeight,
                        shape: document.getElementById('list-list-shape').value || 'square',
                        peak: document.getElementById('list-list-shape').value === 'square' ? '' : (document.getElementById('list-list-peak').value || '20'),
                        colorOption: document.getElementById('list-list-color-option').value || 'transparent',
                        color: document.getElementById('list-list-color').value || '#f44848',
                        lineSpacing: document.getElementById('list-list-line-spacing').value || '10'
                    },
                    head: {
                        spacing: document.getElementById('list-head-spacing').value || '10',
                        align: document.getElementById('list-head-align').value || 'center',
                        height: document.getElementById('list-head-height').value || '900',
                        lineSpacing: document.getElementById('list-head-line-spacing').value || '10',
                        lines: collectLines('list-head')
                    },
                    tail: {
                        spacing: document.getElementById('list-tail-spacing').value || '30',
                        align: document.getElementById('list-tail-align').value || 'center',
                        lineSpacing: document.getElementById('list-tail-line-spacing').value || '10',
                        lines: collectLines('list-tail')
                    }
                };
                console.log('Saving listData:', data);
                await saveToIndexedDB('listData', data);
                showToast('儲存成功！');
            } catch (error) {
                console.error('Save failed:', error);
                showToast(`儲存失敗: ${error.message}`, true);
            }
        });
    }

    document.querySelectorAll('.add-line-btn').forEach(button => {
        button.addEventListener('click', () => {
            const section = button.getAttribute('data-section');
            addLine(section);
        });
    });

    async function init() {
        try {
            db = await openDB();
            await fillForm();
        } catch (error) {
            console.error('Initialization failed:', error);
            showToast(`初始化失敗: ${error.message}`, true);
        }
    }

    init();
});