let db;
const dbName = 'BulletinDB';
const storeName = 'settings';

// Initialize Bootstrap Toast
const messageToastEl = document.getElementById('messageToast');
const messageTitleEl = document.getElementById('messageTitle');
const messageBodyEl = document.getElementById('messageBody');
const messageToast = messageToastEl ? new bootstrap.Toast(messageToastEl) : null;

const showMessageToast = (message, isSuccess = true) => {
    if (!messageToast) return;
    messageTitleEl.textContent = isSuccess ? '成功' : '錯誤';
    messageBodyEl.textContent = message;
    messageToastEl.classList.remove('bg-success', 'bg-danger', 'text-white');
    messageToastEl.classList.add(isSuccess ? 'bg-success' : 'bg-danger', 'text-white');
    messageToast.show();
};

// Open IndexedDB
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
            console.log('IndexedDB opened successfully');
            resolve(event.target.result);
        };
        request.onerror = (event) => {
            console.error('IndexedDB open failed:', event.target.error);
            showMessageToast(`無法開啟資料庫: ${event.target.error.message}`, false);
            reject(event.target.error);
        };
    });
};

// Save data to IndexedDB
const saveToIndexedDB = async (id, data) => {
    if (!db) {
        console.log('DB not initialized, opening IndexedDB');
        db = await openDB();
    }
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put({ id, data });
        request.onsuccess = () => {
            console.log(`Saved ${id} to IndexedDB`);
            resolve();
        };
        request.onerror = (event) => {
            console.error(`Failed to save ${id} to IndexedDB:`, event.target.error);
            showMessageToast(`無法儲存 ${id} 到資料庫: ${event.target.error.message}`, false);
            reject(event.target.error);
        };
    });
};

// Get data from IndexedDB
const getFromIndexedDB = async (id) => {
    if (!db) {
        console.log('DB not initialized, opening IndexedDB');
        db = await openDB();
    }
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(id);
        request.onsuccess = (event) => {
            console.log(`Retrieved ${id} from IndexedDB`);
            resolve(event.target.result ? event.target.result.data : {});
        };
        request.onerror = (event) => {
            console.error(`Failed to retrieve ${id} from IndexedDB:`, event.target.error);
            showMessageToast(`無法從資料庫讀取 ${id}: ${event.target.error.message}`, false);
            reject(event.target.error);
        };
    });
};

// Load and populate template submenu
const populateTemplateSubmenu = async () => {
    try {
        const response = await fetch('template/lists.json');
        if (!response.ok) {
            throw new Error('Failed to fetch lists.json');
        }
        const templates = await response.json();
        console.log('Loaded templates from lists.json:', templates);
        const submenu = document.querySelector('.template-submenu');
        submenu.innerHTML = ''; // Clear existing items
        templates.forEach(template => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.classList.add('dropdown-item', 'popup-menu-item');
            a.href = '#';
            a.textContent = template.description;
            a.dataset.jsonFile = template.json;
            li.appendChild(a);
            submenu.appendChild(li);
        });
    } catch (error) {
        console.error('Error loading lists.json:', error);
        showMessageToast(`無法載入範本清單: ${error.message}`, false);
    }
};

// Handle template import
const handleTemplateImport = async (jsonFile) => {
    try {
        const response = await fetch(`template/${jsonFile}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${jsonFile}`);
        }
        const templateData = await response.json();
        console.log(`Loaded template data from ${jsonFile}:`, templateData);

        // Show confirmation toast
        const confirmToastEl = document.getElementById('confirmToast');
        const confirmMessageEl = document.getElementById('confirmMessage');
        const confirmYesBtn = document.getElementById('confirmYes');
        const confirmNoBtn = document.getElementById('confirmNo');
        const confirmToast = confirmToastEl ? new bootstrap.Toast(confirmToastEl) : null;

        if (!confirmToast) {
            console.error('Confirm toast element not found');
            showMessageToast('無法顯示確認提示', false);
            return false;
        }

        confirmMessageEl.textContent = '要不要覆蓋原有資料？';
        confirmToast.show();

        return new Promise((resolve) => {
            const onConfirm = async () => {
                try {
                    // Save template data to IndexedDB
                    if (templateData.headData) {
                        await saveToIndexedDB('headData', templateData.headData);
                    }
                    if (templateData.tailData) {
                        await saveToIndexedDB('tailData', templateData.tailData);
                    }
                    if (templateData.listData) {
                        await saveToIndexedDB('listData', templateData.listData);
                    }
                    showMessageToast(`成功匯入範本 ${jsonFile}`, true);
                    confirmToast.hide();
                    resolve(true);
                } catch (error) {
                    console.error(`Error saving template ${jsonFile} to IndexedDB:`, error);
                    showMessageToast(`匯入範本 ${jsonFile} 失敗: ${error.message}`, false);
                    confirmToast.hide();
                    resolve(false);
                } finally {
                    confirmYesBtn.removeEventListener('click', onConfirm);
                    confirmNoBtn.removeEventListener('click', onCancel);
                }
            };

            const onCancel = () => {
                confirmToast.hide();
                showMessageToast('已取消範本匯入', false);
                resolve(false);
                confirmYesBtn.removeEventListener('click', onConfirm);
                confirmNoBtn.removeEventListener('click', onCancel);
            };

            confirmYesBtn.addEventListener('click', onConfirm);
            confirmNoBtn.addEventListener('click', onCancel);
        });
    } catch (error) {
        console.error(`Error importing template ${jsonFile}:`, error);
        showMessageToast(`無法匯入範本 ${jsonFile}: ${error.message}`, false);
        return false;
    }
};

// Handle local import
const handleLocalImport = async () => {
    const fileInput = document.getElementById('import-file');
    if (!fileInput) {
        console.error('File input element not found');
        showMessageToast('無法找到檔案輸入元素', false);
        return false;
    }

    return new Promise((resolve) => {
        fileInput.click();
        fileInput.onchange = async () => {
            const file = fileInput.files[0];
            if (!file) {
                showMessageToast('未選擇檔案', false);
                resolve(false);
                return;
            }

            try {
                const reader = new FileReader();
                reader.onload = async (event) => {
                    try {
                        const importData = JSON.parse(event.target.result);
                        console.log('Loaded local import data:', importData);

                        // Show confirmation toast
                        const confirmToastEl = document.getElementById('confirmToast');
                        const confirmMessageEl = document.getElementById('confirmMessage');
                        const confirmYesBtn = document.getElementById('confirmYes');
                        const confirmNoBtn = document.getElementById('confirmNo');
                        const confirmToast = confirmToastEl ? new bootstrap.Toast(confirmToastEl) : null;

                        if (!confirmToast) {
                            console.error('Confirm toast element not found');
                            showMessageToast('無法顯示確認提示', false);
                            resolve(false);
                            return;
                        }

                        confirmMessageEl.textContent = '要不要覆蓋原有資料？';
                        confirmToast.show();

                        const onConfirm = async () => {
                            try {
                                // Save imported data to IndexedDB
                                if (importData.headData) {
                                    await saveToIndexedDB('headData', importData.headData);
                                }
                                if (importData.tailData) {
                                    await saveToIndexedDB('tailData', importData.tailData);
                                }
                                if (importData.listData) {
                                    await saveToIndexedDB('listData', importData.listData);
                                }
                                if (importData.panelData) {
                                    await saveToIndexedDB('panelData', importData.panelData);
                                }
                                showMessageToast(`成功匯入本機檔案 ${file.name}`, true);
                                confirmToast.hide();
                                resolve(true);
                            } catch (error) {
                                console.error(`Error saving local import to IndexedDB:`, error);
                                showMessageToast(`匯入本機檔案 ${file.name} 失敗: ${error.message}`, false);
                                confirmToast.hide();
                                resolve(false);
                            } finally {
                                confirmYesBtn.removeEventListener('click', onConfirm);
                                confirmNoBtn.removeEventListener('click', onCancel);
                                fileInput.value = ''; // Clear input
                            }
                        };

                        const onCancel = () => {
                            confirmToast.hide();
                            showMessageToast('已取消本機匯入', false);
                            resolve(false);
                            confirmYesBtn.removeEventListener('click', onConfirm);
                            confirmNoBtn.removeEventListener('click', onCancel);
                            fileInput.value = ''; // Clear input
                        };

                        confirmYesBtn.addEventListener('click', onConfirm);
                        confirmNoBtn.addEventListener('click', onCancel);
                    } catch (error) {
                        console.error('Error parsing local import file:', error);
                        showMessageToast(`無法解析檔案 ${file.name}: ${error.message}`, false);
                        resolve(false);
                        fileInput.value = ''; // Clear input
                    }
                };
                reader.onerror = () => {
                    console.error('Error reading local import file:', reader.error);
                    showMessageToast(`無法讀取檔案 ${file.name}: ${reader.error.message}`, false);
                    resolve(false);
                    fileInput.value = ''; // Clear input
                };
                reader.readAsText(file);
            } catch (error) {
                console.error('Error initiating local import:', error);
                showMessageToast(`匯入本機檔案失敗: ${error.message}`, false);
                resolve(false);
                fileInput.value = ''; // Clear input
            }
        };
    });
};

// Handle local export
const handleLocalExport = async () => {
    try {
        // Retrieve all data from IndexedDB
        const headData = await getFromIndexedDB('headData');
        const tailData = await getFromIndexedDB('tailData');
        const listData = await getFromIndexedDB('listData');
        const panelData = await getFromIndexedDB('panelData');
        const exportData = { headData, tailData, listData, panelData };
        console.log('Export data:', exportData);

        // Create JSON file
        const jsonString = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bulletin_export.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showMessageToast('成功匯出資料', true);
        return true;
    } catch (error) {
        console.error('Error exporting data:', error);
        showMessageToast(`匯出資料失敗: ${error.message}`, false);
        return false;
    }
};

// Setup dropdown menu
const setupDropdownMenu = async () => {
    await populateTemplateSubmenu();
    const dropdownMenu = document.querySelector('.dropdown-menu');
    dropdownMenu.addEventListener('click', async (event) => {
        const target = event.target;
        if (target.classList.contains('popup-menu-item')) {
            if (target.dataset.jsonFile) {
                // Handle template import
                event.preventDefault();
                const jsonFile = target.dataset.jsonFile;
                console.log(`Selected template: ${jsonFile}`);
                const success = await handleTemplateImport(jsonFile);
                if (success) {
                    location.reload();
                }
            } else if (target.dataset.action === 'import') {
                // Handle local import
                event.preventDefault();
                console.log('Initiating local import');
                const success = await handleLocalImport();
                if (success) {
                    location.reload();
                }
            } else if (target.dataset.action === 'export') {
                // Handle local export
                event.preventDefault();
                console.log('Initiating local export');
                await handleLocalExport();
            }
            // Allow default behavior for other popup-menu-item (e.g., navigation links)
        }
    });
};

// Export setup function
window.setupDropdownMenu = setupDropdownMenu;