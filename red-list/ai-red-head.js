document.addEventListener('DOMContentLoaded', () => {
    const headPage = document.querySelector('.head-page');
    const headBackBtn = document.querySelector('.head-page .back-btn');
    const headSaveBtn = document.querySelector('.head-page .save-btn');
    const saveToast = document.getElementById('save-toast');

    const dbName = 'BulletinDB';
    const storeName = 'settings';
    let db;

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
                showToast(`無法開啟資料庫: ${event.target.error.message}`, false);
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
                showToast(`儲存 ${id} 失敗: ${event.target.error.message}`, false);
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
                showToast(`無法讀取 ${id}: ${event.target.error.message}`, false);
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

    const showToast = (message, isSuccess = true) => {
        if (saveToast) {
            saveToast.querySelector('.toast-body').textContent = message;
            saveToast.style.backgroundColor = isSuccess ? '#28a745' : '#dc3545';
            saveToast.classList.add('show');
            setTimeout(() => {
                saveToast.classList.remove('show');
            }, 2000);
        } else {
            console.error('Save toast element not found');
        }
    };

    const fillForm = async () => {
        try {
            const data = await getFromIndexedDB('headData');
            console.log('Filling form with headData:', data);
            const prefix = 'head';

            // Fill list section
            const listWidth = document.getElementById(`${prefix}-list-width`);
            const listColorOption = document.getElementById(`${prefix}-list-color-option`);
            const listColor = document.getElementById(`${prefix}-list-color`);
            const listLineSpacing = document.getElementById(`${prefix}-list-line-spacing`);

            if (listWidth && listColorOption && listColor && listLineSpacing) {
                listWidth.value = data.list?.width || '100';
                listColorOption.value = data.list?.colorOption || 'transparent';
                listColor.value = data.list?.color || '#f44848';
                listLineSpacing.value = data.list?.lineSpacing || '10';
                safeSetDisplay(listColor, listColorOption.value === 'custom' ? 'block' : 'none');
            } else {
                console.warn('List form elements not found');
            }

            // Fill head section
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
                    const headLines = data.head?.lines?.length > 0 ? data.head.lines : [{ text: '田中央阿伯公生日🏆', size: 50, color: '#000000', spacing: 'center' }];
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

            // Fill tail section
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
            showToast(`載入表單資料失敗: ${error.message}`, false);
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

    if (headBackBtn) {
        headBackBtn.addEventListener('click', () => {
            window.location.href = 'ai-red-bulletin.html';
        });
    }

    if (headSaveBtn) {
        headSaveBtn.addEventListener('click', async () => {
            try {
                const headHeight = parseInt(document.getElementById('head-head-height').value) || 900;
                const headSpacing = parseInt(document.getElementById('head-head-spacing').value) || 10;
                const tailSpacing = parseInt(document.getElementById('head-tail-spacing').value) || 30;
                const data = {
                    list: {
                        width: document.getElementById('head-list-width').value || '100',
                        height: window.innerHeight,
                        colorOption: document.getElementById('head-list-color-option').value || 'transparent',
                        color: document.getElementById('head-list-color').value || '#f44848',
                        lineSpacing: document.getElementById('head-list-line-spacing').value || '10'
                    },
                    head: {
                        spacing: document.getElementById('head-head-spacing').value || '10',
                        align: document.getElementById('head-head-align').value || 'center',
                        height: document.getElementById('head-head-height').value || '900',
                        lineSpacing: document.getElementById('head-head-line-spacing').value || '10',
                        lines: collectLines('head-head')
                    },
                    tail: {
                        spacing: document.getElementById('head-tail-spacing').value || '30',
                        align: document.getElementById('head-tail-align').value || 'center',
                        lineSpacing: document.getElementById('head-tail-line-spacing').value || '10',
                        lines: collectLines('head-tail')
                    }
                };
                console.log('Saving headData:', data);
                await saveToIndexedDB('headData', data);
                showToast('榜首設定已儲存！');
            } catch (error) {
                console.error('Save failed:', error);
                showToast(`儲存失敗: ${error.message}`, false);
            }
        });
    }

    const bindAddLineButtons = () => {
        const buttons = document.querySelectorAll('.add-line-btn');
        console.log(`Found ${buttons.length} add-line-btn elements`);
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const section = btn.getAttribute('data-section');
                console.log(`Add line button clicked for section: ${section}`);
                const dynamicLines = document.querySelector(`#${section}-lines .dynamic-lines`);
                if (!dynamicLines) {
                    console.error(`Dynamic lines container not found for section: ${section}`);
                    return;
                }
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
                dynamicLines.appendChild(lineDiv);
                console.log(`New line added to section: ${section}`);
            });
        });
    };

    async function init() {
        try {
            db = await openDB();
            await fillForm();
            bindAddLineButtons();
        } catch (error) {
            console.error('Initialization failed:', error);
            showToast(`初始化失敗: ${error.message}`, false);
        }
    }

    init();
});