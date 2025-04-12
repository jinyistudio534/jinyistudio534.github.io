class AiSideMenu extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.width = this.getAttribute('width') || '100';
    this.image = this.getAttribute('image') || '';
    this.clickHandler = this.getAttribute('click') || null;
    this.margin = parseInt(this.getAttribute('margin')) || 3;
    this.size = parseInt(this.getAttribute('size')) || 24;

    this.isOpen = true;
    this.iconWidth = 24;

    // 綁定方法到實例，確保外部可以調用
    this.setMenuItemDisabled = this.setMenuItemDisabled.bind(this);
    this.setMenuItemSelected = this.setMenuItemSelected.bind(this);
    this.getMenuItem = this.getMenuItem.bind(this);

    this.render();
  }

  connectedCallback() {
    this.updateContentWidth();
  }

  render() {
    const closedWidth = this.iconWidth + this.margin * 2 + 10; // 40px
    const iconCenterOffsetClosed = (closedWidth - this.iconWidth) / 2; // 精確居中：(40 - 24) / 2 = 8px

    const style = `
      <style>
        @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
        :host {
          display: block;
          height: 100vh;
          background-color: #fff;
          position: relative;
          transition: width 0.3s ease;
          width: ${this.isOpen ? this.width : closedWidth}px;
          min-width: ${this.isOpen ? this.width : closedWidth}px;
        }
        .menu-container {
          height: 100%;
          display: flex;
          flex-direction: column;
          width: 100%;
          position: relative;
        }
        .menu-head {
          display: flex;
          flex-direction: column;
          z-index: 1;
        }
        .menu-tail {
          display: flex;
          flex-direction: column;
          z-index: 1;
          margin-top: auto;
        }
        .logo-container {
          text-align: center;
          padding: 3px 3px 0;
          position: relative;
          width: 100%;
          box-sizing: border-box;
          min-height: ${this.image ? 'auto' : '32px'};
          z-index: 1000;
        }
        .logo {
          max-width: 100%;
          height: auto;
          display: ${this.isOpen ? 'block' : 'none'};
          margin: 0 auto;
        }
        .toggle-btn {
          position: absolute;
          background-color: transparent;
          color: black;
          border: none;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background-color 0.3s;
          z-index: 1001;
          border-radius: 4px;
        }
        .toggle-btn.open {
          top: 3px;
          right: 3px;
        }
        .toggle-btn.closed {
          top: 5px;
          left: calc(50% - 16px);
        }
        .toggle-btn:hover {
          background-color: #ff69b4;
        }
        .toggle-btn i.material-icons {
          font-size: 24px;
          line-height: 1;
          font-family: 'Material Icons';
          font-style: normal;
          display: inline-block;
        }
        .menu-item {
          display: flex;
          align-items: center;
          margin: ${this.margin}px 0;
          width: 100%;
          box-sizing: border-box;
          white-space: nowrap;
          padding: 4px 0;
          border-radius: 4px;
          z-index: 1;
        }
        .menu-item.with-icon:not(.has-text):not(.has-image):hover {
          background-color: #ffb6c1;
          margin-left: 2px;
          margin-right: 2px;
          width: calc(100% - 4px);
        }
        .menu-item.with-icon.has-text:hover {
          background-color: #ffb6c1;
          margin-left: 2px;
          margin-right: 2px;
          width: calc(100% - 4px);
        }
        .menu-item.selected {
          background-color: #343a40; /* 黑光底色 */
          color: #ffffff; /* 白色文字 */
          margin-left: 2px;
          margin-right: 2px;
          width: calc(100% - 4px);
        }
        .menu-item.selected i.material-icons,
        .menu-item.selected .menu-text {
          color: #ffffff; /* 確保圖標和文字都是白色 */
        }
        .menu-item img {
          max-width: 100%;
          height: auto;
        }
        .menu-item.disabled {
          opacity: 0.5;
          pointer-events: none;
        }
        .menu-item.bold {
          font-weight: bold;
        }
        .menu-item i.material-icons {
          margin-right: ${this.isOpen ? '8px' : '0'};
          margin-left: ${this.isOpen ? '10px' : iconCenterOffsetClosed + 'px'};
          line-height: 1;
          font-family: 'Material Icons';
          font-style: normal;
          display: inline-block;
          width: ${this.iconWidth}px;
          text-align: center;
        }
        .menu-item .menu-text {
          display: ${this.isOpen ? 'inline' : 'none'};
        }
        .menu-item.with-icon {
          cursor: pointer;
          justify-content: flex-start;
        }
        .menu-item.align-left {
          justify-content: flex-start;
        }
        .menu-item.align-center {
          justify-content: center;
        }
        .menu-item.align-right {
          justify-content: flex-end;
        }
      </style>
    `;

    const html = `
      <div class="menu-container">
        <div class="logo-container">
          ${this.image ? `<img src="${this.image}" class="logo" />` : `<div style="height: 32px;"></div>`}
          <button class="toggle-btn ${this.isOpen ? 'open' : 'closed'}">
            ${this.isOpen ? '<i class="material-icons">chevron_left</i>' : '<i class="material-icons">chevron_right</i>'}
          </button>
        </div>
        <div class="menu-head"></div>
        <div class="menu-tail"></div>
      </div>
    `;

    this.shadowRoot.innerHTML = style + html;

    const menuHead = this.shadowRoot.querySelector('.menu-head');
    const menuTail = this.shadowRoot.querySelector('.menu-tail');
    const headItems = this.querySelector('menu-head')?.children || [];
    const tailItems = this.querySelector('menu-tail')?.children || [];

    this.renderMenuItems(headItems, menuHead);
    this.renderMenuItems(tailItems, menuTail);

    const toggleBtn = this.shadowRoot.querySelector('.toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggleMenu());
    }
  }

  renderMenuItems(items, container) {
    Array.from(items).forEach(item => {
      const menuItem = document.createElement('div');
      menuItem.classList.add('menu-item');

      const id = item.getAttribute('id') || '';
      const image = item.getAttribute('image') || '';
      const icon = item.getAttribute('icon') || '';
      const text = item.getAttribute('text') || item.innerHTML.trim() || '';
      const align = item.getAttribute('align') || 'left';
      const size = item.getAttribute('size') || (item.hasAttribute('text') && !image ? '16' : this.size);
      const bold = item.hasAttribute('bold');
      const disabled = item.hasAttribute('disabled');
      const selected = item.hasAttribute('selected');

      menuItem.classList.add(`align-${align}`);
      if (bold) menuItem.classList.add('bold');
      if (disabled) menuItem.classList.add('disabled');
      if (selected) menuItem.classList.add('selected');
      if (icon) menuItem.classList.add('with-icon');
      if (image) menuItem.classList.add('has-image');
      if (item.hasAttribute('text')) menuItem.classList.add('has-text');
      menuItem.style.fontSize = `${size}px`;

      // 儲存 ID 作為屬性，以便後續查找
      menuItem.dataset.id = id;

      if (image) {
        menuItem.innerHTML = `<img src="${image}" />`;
      } else {
        menuItem.innerHTML = `
          ${icon ? `<i class="material-icons">${icon}</i>` : ''}
          ${text ? `<span class="menu-text">${text}</span>` : ''}
        `;
      }

      if (id && icon && !disabled) {
        menuItem.addEventListener('click', () => {
          if (this.clickHandler) {
            const event = new CustomEvent('menu-click', { detail: { id } });
            this.dispatchEvent(event);
          }
        });
      }

      container.appendChild(menuItem);
    });
  }

  toggleMenu() {
    this.isOpen = !this.isOpen;
    const toggleBtn = this.shadowRoot.querySelector('.toggle-btn');
    const logoImage = this.shadowRoot.querySelector('.logo');
    const menuHead = this.shadowRoot.querySelector('.menu-head');
    const closedWidth = this.iconWidth + this.margin * 2 + 10;
    const iconCenterOffsetClosed = (closedWidth - this.iconWidth) / 2;

    if (this.isOpen) {
      this.style.width = `${this.width}px`;
      this.style.minWidth = `${this.width}px`;
      toggleBtn.innerHTML = `<i class="material-icons">chevron_left</i>`;
      toggleBtn.classList.remove('closed');
      toggleBtn.classList.add('open');
      if (logoImage) logoImage.style.display = 'block';
      menuHead.style.marginTop = '0';
      this.shadowRoot.querySelectorAll('.menu-item').forEach(item => {
        item.style.display = 'flex';
        const text = item.querySelector('.menu-text');
        if (text) text.style.display = 'inline';
        const icon = item.querySelector('i.material-icons');
        if (icon) icon.style.marginLeft = `10px`;
      });
    } else {
      this.style.width = `${closedWidth}px`;
      this.style.minWidth = `${closedWidth}px`;
      toggleBtn.innerHTML = `<i class="material-icons">chevron_right</i>`;
      toggleBtn.classList.remove('open');
      toggleBtn.classList.add('closed');
      if (logoImage) logoImage.style.display = 'none';
      menuHead.style.marginTop = '37px';
      this.shadowRoot.querySelectorAll('.menu-item').forEach(item => {
        const hasIcon = item.classList.contains('with-icon');
        const hasText = item.classList.contains('has-text');
        const hasImage = item.classList.contains('has-image');
        if (hasIcon && !hasText && !hasImage) {
          item.style.display = 'flex';
          const text = item.querySelector('.menu-text');
          if (text) text.style.display = 'none';
          const icon = item.querySelector('i.material-icons');
          if (icon) icon.style.marginLeft = `${iconCenterOffsetClosed}px`;
        } else {
          item.style.display = 'none';
        }
      });
    }

    this.updateContentWidth();
  }

  updateContentWidth() {
    const content = document.querySelector('#content');
    if (content) {
      content.style.marginLeft = '0'; // 移除 margin-left，依賴 d-flex 佈局
    }
  }

  // 方法：動態控制選單項的 disabled 狀態
  setMenuItemDisabled(itemId, disabled) {
    const menuItem = this.shadowRoot.querySelector(`.menu-item[data-id="${itemId}"]`);
    if (menuItem) {
      if (disabled) {
        menuItem.classList.add('disabled');
        // 移除點擊事件監聽器
        const clone = menuItem.cloneNode(true);
        menuItem.parentNode.replaceChild(clone, menuItem);
      } else {
        menuItem.classList.remove('disabled');
        // 重新添加點擊事件監聽器
        menuItem.addEventListener('click', () => {
          if (this.clickHandler) {
            const event = new CustomEvent('menu-click', { detail: { id: itemId } });
            this.dispatchEvent(event);
          }
        });
      }
    }
  }

  // 方法：動態控制選單項的 selected 狀態
  setMenuItemSelected(itemId, selected) {
    const menuItem = this.shadowRoot.querySelector(`.menu-item[data-id="${itemId}"]`);
    if (menuItem) {
      if (selected) {
        menuItem.classList.add('selected');
      } else {
        menuItem.classList.remove('selected');
      }
    }
  }

  // 新增方法：檢查選單項的狀態，返回 ["disabled", "selected"] 或 []
  getMenuItem(itemId) {
    const menuItem = this.shadowRoot.querySelector(`.menu-item[data-id="${itemId}"]`);
    const status = [];

    if (menuItem) {
      if (menuItem.classList.contains('disabled')) {
        status.push('disabled');
      }
      if (menuItem.classList.contains('selected')) {
        status.push('selected');
      }
    }

    return status; // 如果都沒設，返回空陣列 []
  }
}

// 自訂元素定義
customElements.define('ai-side-menu', AiSideMenu);