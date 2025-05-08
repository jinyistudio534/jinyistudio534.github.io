document.addEventListener('DOMContentLoaded', () => {
    const dbName = 'BulletinDB';
    const storeName = 'settings';
    let db;
    let isRendering = false; // 防止重複渲染
    let resizeTimeout;

    // Open IndexedDB
    const openDB = () => {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(dbName, 15); // 更新版本號
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(storeName)) {
                    db.createObjectStore(storeName, { keyPath: 'id' });
                }
            };
            request.onsuccess = (event) => {
                db = event.target.result;
                console.log('IndexedDB opened successfully');
                resolve(db);
            };
            request.onerror = (event) => {
                console.error('IndexedDB error:', event.target.error);
                reject(event.target.error);
            };
        });
    };

    // Get data from IndexedDB
    const getFromIndexedDB = (id) => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);
            request.onsuccess = (event) => {
                const result = event.target.result;
                console.log(`Retrieved ${id} from IndexedDB:`, result);
                resolve(result ? result.data : {});
            };
            request.onerror = (event) => {
                console.error(`Error retrieving ${id} from IndexedDB:`, event.target.error);
                reject(event.target.error);
            };
        });
    };

    // Display error message
    const displayErrorMessage = (panelContainer, message = '空白紅榜') => {
        panelContainer.innerHTML = ''; // Clear container
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        panelContainer.appendChild(errorDiv);
    };

    // Replace placeholders in text with JSON data
    const replacePlaceholders = (text, data) => {
        let result = text;
        for (const key in data) {
            result = result.replace(`{${key}}`, data[key] || '');
        }
        return result;
    };

    // Fetch and parse JSON file
    const fetchJsonData = async (source) => {
        console.log(`Fetching JSON from: ${source}`);
        try {
            const response = await fetch(source, { cache: 'no-cache' });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const jsonData = await response.json();
            if (!jsonData.listRoster || !Array.isArray(jsonData.listRoster) || jsonData.listRoster.length === 0) {
                throw new Error('JSON listRoster is missing, not an array, or empty');
            }
            console.log('Successfully fetched JSON data:', jsonData.listRoster);
            return jsonData.listRoster;
        } catch (error) {
            console.error('Error fetching or parsing JSON:', error);
            // Fallback: Use default data
            try {
                const fallbackResponse = await fetch('./roster-data.json', { cache: 'no-cache' });
                if (!fallbackResponse.ok) {
                    throw new Error(`HTTP error! status: ${fallbackResponse.status}`);
                }
                const fallbackData = await fallbackResponse.json();
                if (!fallbackData.listRoster || !Array.isArray(fallbackData.listRoster)) {
                    throw new Error('Invalid fallback JSON structure');
                }
                console.log('Successfully fetched fallback JSON data:', fallbackData.listRoster);
                return fallbackData.listRoster;
            } catch (fallbackError) {
                console.error('Fallback JSON fetch failed:', fallbackError);
                return null;
            }
        }
    };

    // Create or reuse scroll indicator triangles
    const createScrollIndicators = () => {
        document.querySelectorAll('.scroll-indicator-top, .scroll-indicator-bottom').forEach(el => el.remove());
        const topIndicator = document.createElement('div');
        topIndicator.className = 'scroll-indicator-top hidden';
        const bottomIndicator = document.createElement('div');
        bottomIndicator.className = 'scroll-indicator-bottom hidden';
        document.body.appendChild(topIndicator);
        document.body.appendChild(bottomIndicator);
        return { topIndicator, bottomIndicator };
    };

    // Update scroll indicators visibility
    const updateScrollIndicators = (panelContainer, topIndicator, bottomIndicator) => {
        const { scrollTop, scrollHeight, clientHeight } = panelContainer;
        topIndicator.classList.toggle('hidden', scrollTop <= 0);
        bottomIndicator.classList.toggle('hidden', scrollTop + clientHeight >= scrollHeight);
    };

    // Render red-list components or divider
    const renderRedLists = async () => {
        if (isRendering) {
            console.log('Rendering in progress, skipping...');
            return;
        }
        isRendering = true;

        try {
            // Ensure db is initialized
            if (!db) {
                console.log('IndexedDB not yet initialized, initializing...');
                db = await openDB();
            }

            const panelContainer = document.getElementById('panel-container');
            if (!panelContainer) {
                console.error('Panel container not found');
                displayErrorMessage(panelContainer, '找不到面板容器');
                return;
            }
            panelContainer.innerHTML = ''; // Clear container

            const { topIndicator, bottomIndicator } = createScrollIndicators();

            const data = await getFromIndexedDB('listData');
            console.log('Fetched data from IndexedDB:', data);

            const pdata = await getFromIndexedDB('panelData');
            console.log('Fetched data from IndexedDB:', pdata);

            // Check for JSON source
            const source = pdata.filename || './roster-data.json';
            if (!source) {
                console.warn('No JSON source specified in listData.panel.source');
                displayErrorMessage(panelContainer, '未指定資料來源');
                return;
            }

            // Fetch JSON data
            const rosterData = await fetchJsonData(source);
            if (!rosterData) {
                displayErrorMessage(panelContainer, '無法載入名冊資料');
                return;
            }

            // Generate list items from roster data
            const listItems = rosterData.map(item => {
                if (item.isdivider) {
                    return {
                        isdivider: true,
                        text: item.text || ''
                    };
                } else {
                    return {
                        head: {
                            lines: (data.head?.lines || []).map(line => ({
                                ...line,
                                text: replacePlaceholders(line.text, item)
                            }))
                        },
                        tail: {
                            lines: (data.tail?.lines || []).map(line => ({
                                ...line,
                                text: replacePlaceholders(line.text, item)
                            }))
                        }
                    };
                }
            });

            if (!listItems.length) {
                console.warn('No list items to render');
                displayErrorMessage(panelContainer, '無名冊資料可渲染');
                return;
            }

            // Get container width and red-list width
            const containerWidth = panelContainer.clientWidth - 32; // Subtract padding (16px * 2)
            const redListWidth = parseInt(data.list?.width) || 150;
            const gap = 16;
            const listsPerRow = Math.max(1, Math.floor(containerWidth / (redListWidth + gap)));
            console.log(`Container width: ${containerWidth}, Red list width: ${redListWidth}, Lists per row: ${listsPerRow}`);

            // Set grid template
            const totalRowWidth = listsPerRow * redListWidth + (listsPerRow - 1) * gap;
            const gridTemplateColumns = `repeat(${listsPerRow}, ${redListWidth}px)`;

            let currentRow = null;
            let rowItems = [];

            // Process items
            for (let i = 0; i < listItems.length; i++) {
                const item = listItems[i];
                rowItems.push(item);

                if (rowItems.length === listsPerRow || i === listItems.length - 1) {
                    currentRow = document.createElement('div');
                    currentRow.className = 'list-row';
                    currentRow.style.gridTemplateColumns = gridTemplateColumns;
                    currentRow.style.maxWidth = `${totalRowWidth}px`;
                    panelContainer.appendChild(currentRow);

                    // Add placeholders on the left
                    const placeholdersCount = listsPerRow - rowItems.length;
                    for (let j = 0; j < placeholdersCount; j++) {
                        const placeholder = document.createElement('div');
                        placeholder.className = 'placeholder';
                        currentRow.appendChild(placeholder);
                    }

                    // Render items from right to left
                    for (let j = rowItems.length - 1; j >= 0; j--) {
                        const rowItem = rowItems[j];
                        const redList = document.createElement('red-list');

                        if (rowItem.isdivider) {
                            redList.setAttribute('shape', 'square');
                            redList.setAttribute('color', 'transparent');
                            redList.setAttribute('width', data.list?.width || '150');
                            const redListHeight = data.list?.height || '400';
                            redList.setAttribute('height', redListHeight);

                            const redHead = document.createElement('red-head');
                            redHead.setAttribute('spacing', data.head?.spacing || '10');
                            redHead.setAttribute('height', redListHeight);

                            const headWriting = document.createElement('ai-chinese-writing');
                            headWriting.setAttribute('line-spacing', data.head?.lineSpacing || '10');

                            const writing = document.createElement('chinese-writing');
                            writing.setAttribute('color', data.divider?.color || '#000000');
                            writing.setAttribute('size', Math.min(data.divider?.size || 24, 50));
                            writing.setAttribute('spacing', data.divider?.align || 'top');
                            writing.textContent = rowItem.text || '';
                            headWriting.appendChild(writing);

                            redHead.appendChild(headWriting);
                            redList.appendChild(redHead);
                        } else {
                            redList.setAttribute('shape', data.list?.shape || 'inner');
                            redList.setAttribute('color', data.list?.colorOption === 'transparent' ? 'transparent' : data.list?.color || '#f56a51');
                            redList.setAttribute('width', data.list?.width || '150');
                            redList.setAttribute('height', data.list?.height || '400');
                            if (data.list?.shape !== 'square') {
                                redList.setAttribute('peak', data.list?.peak || '10');
                            }

                            const redHead = document.createElement('red-head');
                            redHead.setAttribute('spacing', data.head?.spacing || '10');
                            redHead.setAttribute('align', data.head?.align || 'center');
                            redHead.setAttribute('height', data.head?.height || '200');

                            const headWriting = document.createElement('ai-chinese-writing');
                            headWriting.setAttribute('line-spacing', data.head?.lineSpacing || '10');
                            const headLines = rowItem.head?.lines || [];
                            headLines.forEach(line => {
                                const writing = document.createElement('chinese-writing');
                                writing.setAttribute('color', line.color || '#000000');
                                writing.setAttribute('size', Math.min(line.size || 30, 50));
                                writing.setAttribute('spacing', line.spacing || 'center');
                                writing.textContent = line.text || '';
                                headWriting.appendChild(writing);
                            });

                            const redTail = document.createElement('red-tail');
                            redTail.setAttribute('spacing', data.tail?.spacing || '10');
                            redTail.setAttribute('align', data.tail?.align || 'center');

                            const tailWriting = document.createElement('ai-chinese-writing');
                            tailWriting.setAttribute('line-spacing', data.tail?.lineSpacing || '10');
                            const tailLines = rowItem.tail?.lines || [];
                            tailLines.forEach(line => {
                                const writing = document.createElement('chinese-writing');
                                writing.setAttribute('color', line.color || '#000000');
                                writing.setAttribute('size', Math.min(line.size || 30, 50));
                                writing.setAttribute('spacing', line.spacing || 'end');
                                writing.textContent = line.text || '';
                                tailWriting.appendChild(writing);
                            });

                            redHead.appendChild(headWriting);
                            redTail.appendChild(tailWriting);
                            redList.appendChild(redHead);
                            redList.appendChild(redTail);
                        }

                        currentRow.appendChild(redList);
                    }

                    rowItems = []; // Clear rowItems
                }
            }

            // Update scroll indicators on scroll
            panelContainer.removeEventListener('scroll', updateScrollIndicators);
            panelContainer.addEventListener('scroll', () => {
                updateScrollIndicators(panelContainer, topIndicator, bottomIndicator);
            });

            // Initial update of scroll indicators
            updateScrollIndicators(panelContainer, topIndicator, bottomIndicator);
        } catch (error) {
            console.error('Error rendering red lists:', error);
            const panelContainer = document.getElementById('panel-container');
            if (panelContainer) {
                displayErrorMessage(panelContainer, `渲染紅榜失敗: ${error.message}`);
            }
        } finally {
            isRendering = false;
        }
    };

    // Debounced render on resize
    const debounceRender = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (!isRendering) {
                renderRedLists();
            }
        }, 200);
    };

    // Expose renderListPanel for parent page
    window.renderListPanels = renderRedLists;

    // Initialize with retry mechanism
    const init = async () => {
        try {
            db = await openDB();

            // Retry finding panel-container until it exists
            const waitForPanelContainer = (retryCount = 0, maxRetries = 100) => {
                const panelContainer = document.getElementById('panel-container');
                if (panelContainer) {
                    if (panelContainer.querySelector('.list-row')) {
                        console.log('Panel container already rendered, skipping...');
                        return;
                    }
                    renderRedLists();
                } else if (retryCount < maxRetries) {
                    console.log('Panel container not yet available, retrying...');
                    setTimeout(() => waitForPanelContainer(retryCount + 1, maxRetries), 100);
                } else {
                    console.error('Max retries reached, panel container not found');
                    const panelContainer = document.getElementById('panel-container');
                    if (panelContainer) {
                        displayErrorMessage(panelContainer, '無法找到面板容器');
                    }
                }
            };

            waitForPanelContainer();
        } catch (error) {
            console.error('Initialization failed:', error);
            const panelContainer = document.getElementById('panel-container');
            if (panelContainer) {
                displayErrorMessage(panelContainer, `初始化失敗: ${error.message}`);
            }
        }
    };

    // Run initialization only if not already initialized
    if (!window.redPanelInitialized) {
        window.redPanelInitialized = true;
        init();
        window.addEventListener('resize', debounceRender);
    }
});