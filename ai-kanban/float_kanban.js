function float_kanban(containerId, position = 'left', panelSize = 150, margin = 3) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with ID '${containerId}' not found.`);
        return;
    }

    const button = document.createElement('div');
    button.className = 'float-kanban-button';

    const panel = document.createElement('div');
    panel.className = 'float-kanban-panel';

    // Move container's original content to panel and apply margin
    while (container.firstChild) {
        const content = container.firstChild;
        if (content.classList && content.classList.contains('float-kanban-panel-content')) {
            content.style.margin = `${margin}px`;
        }
        panel.appendChild(content);
    }

    let isOpen = false;

    function setPositionStyles() {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        button.style.borderRadius = '8px';
        button.classList.remove('horizontal', 'vertical');

        switch (position) {
            case 'left':
                button.classList.add('vertical');
                button.style.width = '32px';
                button.style.height = '64px';
                button.style.left = isOpen ? `${panelSize}px` : '0';
                button.style.top = `${(windowHeight - 64) / 2}px`;
                button.style.borderTopLeftRadius = '0';
                button.style.borderBottomLeftRadius = '0';
                panel.style.width = `${panelSize}px`;
                panel.style.height = `${windowHeight}px`;
                panel.style.left = isOpen ? '0' : `-${panelSize}px`;
                panel.style.top = '0';
                break;
            case 'right':
                button.classList.add('vertical');
                button.style.width = '32px';
                button.style.height = '64px';
                button.style.right = isOpen ? `${panelSize}px` : '0';
                button.style.top = `${(windowHeight - 64) / 2}px`;
                button.style.borderTopRightRadius = '0';
                button.style.borderBottomRightRadius = '0';
                panel.style.width = `${panelSize}px`;
                panel.style.height = `${windowHeight}px`;
                panel.style.right = isOpen ? '0' : `-${panelSize}px`;
                panel.style.top = '0';
                break;
            case 'top':
                button.classList.add('horizontal');
                button.style.width = '64px';
                button.style.height = '32px';
                button.style.left = `${(windowWidth - 64) / 2}px`;
                button.style.top = isOpen ? `${panelSize}px` : '0';
                button.style.borderTopLeftRadius = '0';
                button.style.borderTopRightRadius = '0';
                panel.style.width = `${windowWidth}px`;
                panel.style.height = `${panelSize}px`;
                panel.style.left = '0';
                panel.style.top = isOpen ? '0' : `-${panelSize}px`;
                break;
            case 'bottom':
                button.classList.add('horizontal');
                button.style.width = '64px';
                button.style.height = '32px';
                button.style.left = `${(windowWidth - 64) / 2}px`;
                button.style.bottom = isOpen ? `${panelSize}px` : '0';
                button.style.borderBottomLeftRadius = '0';
                button.style.borderBottomRightRadius = '0';
                panel.style.width = `${windowWidth}px`;
                panel.style.height = `${panelSize}px`;
                panel.style.left = '0';
                panel.style.bottom = isOpen ? '0' : `-${panelSize}px`;
                break;
        }
    }

    function showKanban() {
        switch (position) {
            case 'left':
                panel.style.left = '0';
                button.style.left = `${panelSize}px`;
                break;
            case 'right':
                panel.style.right = '0';
                button.style.right = `${panelSize}px`;
                break;
            case 'top':
                panel.style.top = '0';
                button.style.top = `${panelSize}px`;
                break;
            case 'bottom':
                panel.style.bottom = '0';
                button.style.bottom = `${panelSize}px`;
                break;
        }
        isOpen = true;
        console.log('showKanban: isOpen set to', isOpen);
    }

    function hideKanban() {
        switch (position) {
            case 'left':
                panel.style.left = `-${panelSize}px`;
                button.style.left = '0';
                break;
            case 'right':
                panel.style.right = `-${panelSize}px`;
                button.style.right = '0';
                break;
            case 'top':
                panel.style.top = `-${panelSize}px`;
                button.style.top = '0';
                break;
            case 'bottom':
                panel.style.bottom = `-${panelSize}px`;
                button.style.bottom = '0';
                break;
        }
        isOpen = false;
        console.log('hideKanban: isOpen set to', isOpen);
    }

    button.addEventListener('click', () => {
        console.log('Before click: isOpen =', isOpen);
        const event = new CustomEvent('floatKanbanToggle', {
            detail: { isOpen: isOpen }, // Report state BEFORE any change
            bubbles: true
        });
        container.dispatchEvent(event);
        // Removed isOpen = !isOpen; let the event listener handle state changes
    });

    setPositionStyles();
    window.addEventListener('resize', setPositionStyles);

    container.appendChild(panel);
    container.appendChild(button);

    return {
        show: showKanban,
        hide: hideKanban,
        isOpen: () => isOpen
    };
}