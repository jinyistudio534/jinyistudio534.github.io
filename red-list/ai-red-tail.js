document.addEventListener('DOMContentLoaded', () => {
    const tailPage = document.querySelector('.tail-page');
    const tailBackBtn = document.querySelector('.tail-page .back-btn');
    const tailSaveBtn = document.querySelector('.tail-page .save-btn');
    const enableTailCheckbox = document.getElementById('enable-tail');
    const tailForm = document.querySelector('.tail-form');
    const addLineButtons = document.querySelectorAll('.add-line-btn');
    const toastElement = document.getElementById('app-toast');
    const toastBody = toastElement.querySelector('.toast-body');
    const toast = new bootstrap.Toast(toastElement, { autohide: true, delay: 3000 });

    const dbName = 'BulletinDB';
    const storeName = 'settings';
    let db;

    const showToast = (message, isError = false) => {
        toastBody.textContent = message;
        toastElement.classList.remove('bg-success', 'bg-danger');
        toastElement.classList.add(isError ? 'bg-danger' : 'bg-success');
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

    const addLine = (section) => {
        const container = document.querySelector(`#${section}-lines .dynamic-lines`);
        if (!container) {
            showToast(`無法新增行：找不到 ${section} 的容器`, true);
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
                <option value="center">中間</option>
                <option value="end" selected>底部</option>
            </select>
            <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">刪除</button>
        `;
        container.appendChild(lineDiv);
        showToast('成功新增文字行');
    };

    const fillForm = async () => {
        try {
            const data = await getFromIndexedDB('tailData');
            console.log('Filling form with tailData:', data);

            if (enableTailCheckbox && tailForm) {
                enableTailCheckbox.checked = data.enableTail || false;
                safeSetDisplay(tailForm, enableTailCheckbox.checked ? 'block' : 'none');
            }

            const listWidth = document.getElementById('tail-list-width');
            const listColorOption = document.getElementById('tail-list-color-option');
            const listColor = document.getElementById('tail-list-color');
            const listLineSpacing = document.getElementById('tail-list-line-spacing');

            if (listWidth && listColorOption && listColor && listLineSpacing) {
                listWidth.value = data.list?.width || '100';
                listColorOption.value = data.list?.colorOption || 'custom';
                listColor.value = data.list?.color || '#f44848';
                listLineSpacing.value = data.list?.lineSpacing || '10';
                safeSetDisplay(listColor, listColorOption.value === 'custom' ? 'block' : 'none');
            } else {
                console.warn('List form elements not found');
            }

            const headSpacing = document.getElementById('tail-head-spacing');
            const headAlign = document.getElementById('tail-head-align');
            const headHeight = document.getElementById('tail-head-height');
            const headLineSpacing = document.getElementById('tail-head-line-spacing');

            if (headSpacing && headAlign && headHeight && headLineSpacing) {
                headSpacing.value = data.head?.spacing || '10';
                headAlign.value = data.head?.align || 'center';
                headHeight.value = data.head?.height || '900';
                headLineSpacing.value = data.head?.lineSpacing || '10';

                const headLinesContainer = document.getElementById('tail-head-lines');
                if (headLinesContainer) {
                    const dynamicLines = headLinesContainer.querySelector('.dynamic-lines');
                    dynamicLines.innerHTML = '';
                    const headLines = data.head?.lines?.length > 0 ? data.head.lines : [{ text: '榜尾標題', size: 50, color: '#000000', spacing: 'center' }];
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

            const tailSpacing = document.getElementById('tail-tail-spacing');
            const tailAlign = document.getElementById('tail-tail-align');
            const tailLineSpacing = document.getElementById('tail-tail-line-spacing');

            if (tailSpacing && tailAlign && tailLineSpacing) {
                tailSpacing.value = data.tail?.spacing || '30';
                tailAlign.value = data.tail?.align || 'center';
                tailLineSpacing.value = data.tail?.lineSpacing || '10';

                const tailLinesContainer = document.getElementById('tail-tail-lines');
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

    if (tailBackBtn) {
        tailBackBtn.addEventListener('click', () => {
            window.location.href = 'ai-red-bulletin.html';
        });
    }

    if (enableTailCheckbox && tailForm) {
        enableTailCheckbox.addEventListener('change', () => {
            safeSetDisplay(tailForm, enableTailCheckbox.checked ? 'block' : 'none');
        });
    }

    if (addLineButtons) {
        addLineButtons.forEach(button => {
            button.addEventListener('click', () => {
                const section = button.getAttribute('data-section');
                addLine(section);
            });
        });
    }

    if (tailSaveBtn) {
        tailSaveBtn.addEventListener('click', async () => {
            try {
                const headHeight = parseInt(document.getElementById('tail-head-height').value) || 900;
                const headSpacing = parseInt(document.getElementById('tail-head-spacing').value) || 10;
                const tailSpacing = parseInt(document.getElementById('tail-tail-spacing').value) || 30;
                const tailHeight = window.innerHeight - headHeight - headSpacing - tailSpacing;
                const data = {
                    enableTail: enableTailCheckbox.checked,
                    list: {
                        width: document.getElementById('tail-list-width').value || '100',
                        height: window.innerHeight,
                        colorOption: document.getElementById('tail-list-color-option').value || 'custom',
                        color: document.getElementById('tail-list-color').value || '#f44848',
                        lineSpacing: document.getElementById('tail-list-line-spacing').value || '10'
                    },
                    head: {
                        spacing: document.getElementById('tail-head-spacing').value || '10',
                        align: document.getElementById('tail-head-align').value || 'center',
                        height: document.getElementById('tail-head-height').value || '900',
                        lineSpacing: document.getElementById('tail-head-line-spacing').value || '10',
                        lines: collectLines('tail-head')
                    },
                    tail: {
                        spacing: document.getElementById('tail-tail-spacing').value || '30',
                        align: document.getElementById('tail-tail-align').value || 'center',
                        lineSpacing: document.getElementById('tail-tail-line-spacing').value || '10',
                        lines: collectLines('tail-tail')
                    }
                };
                console.log('Saving tailData:', data);
                await saveToIndexedDB('tailData', data);
                showToast('榜尾設定儲存成功！');
            } catch (error) {
                console.error('Save failed:', error);
                showToast(`榜尾設定儲存失敗: ${error.message}`, true);
            }
        });
    }

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