class AIBlindBox extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
      '#D4A5A5', '#9B59B6', '#3498DB', '#E74C3C', '#2ECC71'
    ];
    this.icons = ['star', 'favorite', 'card_giftcard', 'cake', 'emoji_events', 'lightbulb', 'music_note', 'palette', 'rocket', 'sports_soccer'];
    this.clickedCells = JSON.parse(localStorage.getItem('clickedCells') || '[]');
    this.cellAssignments = JSON.parse(localStorage.getItem('cellAssignments') || '[]');
    this.verificationCode = '';
    this.longPressTimer = null;
    this.isLongPressing = false;

    // 預設 gift.json 資料，圖標隨機選擇，圖片設為空字串
    this.defaultGiftData = {
      gift: [
        {
          name: "糖果",
          count: 3,
          image: "",
          icon: this.icons[Math.floor(Math.random() * this.icons.length)]
        },
        {
          name: "餅干",
          count: 3,
          image: "",
          icon: this.icons[Math.floor(Math.random() * this.icons.length)]
        }
      ],
      nothing: "銘謝惠顧"
    };
  }

  static get observedAttributes() {
    return ['rows', 'cols', 'grid-width', 'border-width'];
  }

  attributeChangedCallback() {
    this.render();
  }

  connectedCallback() {
    const storedRows = parseInt(localStorage.getItem('gridRows')) || 6;
    const storedCols = parseInt(localStorage.getItem('gridCols')) || 6;
    this.setAttribute('rows', storedRows);
    this.setAttribute('cols', storedCols);
    this.render();
    document.addEventListener('keydown', this.handleCtrlR.bind(this));
    this.restoreClickedStates();
    this.initializeGiftData();
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this.handleCtrlR.bind(this));
  }

  set giftData(data) {
    data.gift = data.gift.map(gift => ({
      ...gift,
      icon: gift.icon || this.icons[Math.floor(Math.random() * this.icons.length)]
    }));
    this._giftData = data;
    localStorage.setItem('giftData', JSON.stringify(data));
    this.assignCells();
    this.render();
  }

  get giftData() {
    return this._giftData;
  }

  initializeGiftData() {
    const storedGiftData = localStorage.getItem('giftData');
    this._giftData = storedGiftData ? JSON.parse(storedGiftData) : this.defaultGiftData;
    this._giftData.gift = this._giftData.gift.map(gift => ({
      ...gift,
      icon: gift.icon || this.icons[Math.floor(Math.random() * this.icons.length)]
    }));
    localStorage.setItem('giftData', JSON.stringify(this._giftData));

    const rows = parseInt(this.getAttribute('rows')) || 6;
    const cols = parseInt(this.getAttribute('cols')) || 6;
    const totalCells = rows * cols;
    const storedAssignments = JSON.parse(localStorage.getItem('cellAssignments') || '[]');
    if (storedAssignments.length === totalCells && storedAssignments.every(assignment => assignment.type && assignment.content)) {
      this.cellAssignments = storedAssignments;
    } else {
      this.assignCells();
    }
    this.render();
  }

  assignCells() {
    if (!this.giftData) return;
    const rows = parseInt(this.getAttribute('rows')) || 6;
    const cols = parseInt(this.getAttribute('cols')) || 6;
    const totalCells = rows * cols;
    
    this.cellAssignments = Array(totalCells).fill({ type: 'nothing', content: this.giftData.nothing });
    const giftIndices = [];
    this.giftData.gift.forEach(gift => {
      const count = gift.count || 1;
      for (let i = 0; i < count; i++) {
        let index;
        do {
          index = Math.floor(Math.random() * totalCells);
        } while (giftIndices.includes(index));
        giftIndices.push(index);
        this.cellAssignments[index] = { type: 'gift', content: gift.name, image: gift.image };
      }
    });
    localStorage.setItem('cellAssignments', JSON.stringify(this.cellAssignments));
  }

  handleCtrlR(event) {
    if (event.ctrlKey && event.key === 'r') {
      event.preventDefault();
      this.showVerificationModal();
    }
  }

  showVerificationModal() {
    this.verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
    
    // 創建背景遮罩
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999;
    `;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 20px;
      border-radius: 5px;
      z-index: 1000;
      text-align: center;
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      width: 300px;
      max-height: calc(100vh - 40px);
      overflow-y: auto;
      box-sizing: border-box;
    `;
    
    // 禁用頁面滾動
    document.body.style.overflow = 'hidden';
    
    const message = document.createElement('p');
    message.textContent = `請輸入 ${this.verificationCode} 以重置`;
    
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = `輸入 ${this.verificationCode}`;
    input.style.cssText = 'margin: 10px 0; padding: 5px; width: 100%; box-sizing: border-box;';
    
    const submit = document.createElement('button');
    submit.textContent = '提交';
    submit.style.cssText = 'padding: 5px 10px; margin-right: 10px;';
    submit.onclick = () => {
      if (input.value === this.verificationCode) {
        localStorage.removeItem('clickedCells');
        localStorage.removeItem('cellAssignments');
        this.clickedCells = [];
        this.cellAssignments = [];
        const storedRows = parseInt(localStorage.getItem('gridRows')) || 6;
        const storedCols = parseInt(localStorage.getItem('gridCols')) || 6;
        this.setAttribute('rows', storedRows);
        this.setAttribute('cols', storedCols);
        this.assignCells();
        this.render();
        document.body.removeChild(overlay);
        document.body.style.overflow = '';
      } else {
        message.textContent = '輸入錯誤，請再試一次';
      }
    };
    
    const editLink = document.createElement('a');
    editLink.href = 'edit.html';
    editLink.textContent = '編輯獎品資料';
    editLink.style.cssText = 'color: #4CAF50; text-decoration: underline; display: block; margin-top: 10px;';
    
    const closeButton = document.createElement('button');
    closeButton.textContent = '✕';
    closeButton.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      background: #ff4d4d;
      color: white;
      border: none;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 16px;
    `;
    closeButton.onclick = () => {
      document.body.removeChild(overlay);
      document.body.style.overflow = '';
    };
    
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submit.click();
      if (e.key === 'Escape') {
        document.body.removeChild(overlay);
        document.body.style.overflow = '';
      }
    });
    
    modal.appendChild(closeButton);
    modal.appendChild(message);
    modal.appendChild(input);
    modal.appendChild(submit);
    modal.appendChild(editLink);
    document.body.appendChild(overlay);
    overlay.appendChild(modal);
  }

  handleCellClick(event) {
    if (this.isLongPressing) return;
    const cell = event.target.closest('.grid-cell');
    if (cell && !cell.classList.contains('clicked')) {
      const index = Array.from(this.shadowRoot.querySelectorAll('.grid-cell')).indexOf(cell);
      this.clickedCells.push(index);
      localStorage.setItem('clickedCells', JSON.stringify(this.clickedCells));
      cell.classList.add('clicked');
      cell.style.backgroundColor = 'transparent';
      cell.innerHTML = '';

      if (this.cellAssignments[index].type === 'gift' && this.cellAssignments[index].image) {
        const backgroundImage = document.createElement('div');
        backgroundImage.className = 'background-image';
        backgroundImage.style.backgroundImage = `url(${this.cellAssignments[index].image})`;
        backgroundImage.style.opacity = '0.5';
        cell.appendChild(backgroundImage);
      }

      const thankYouSpan = document.createElement('span');
      thankYouSpan.className = 'thank-you';
      thankYouSpan.innerHTML = this.cellAssignments[index].content.replace(/\n/g, '<br>');
      cell.appendChild(thankYouSpan);
    }
  }

  restoreClickedStates() {
    if (this.clickedCells.length > 0) {
      const cells = this.shadowRoot.querySelectorAll('.grid-cell');
      this.clickedCells.forEach(index => {
        if (cells[index]) {
          cells[index].classList.add('clicked');
          cells[index].style.backgroundColor = 'transparent';
          cells[index].innerHTML = '';

          if (this.cellAssignments[index].type === 'gift' && this.cellAssignments[index].image) {
            const backgroundImage = document.createElement('div');
            backgroundImage.className = 'background-image';
            backgroundImage.style.backgroundImage = `url(${this.cellAssignments[index].image})`;
            backgroundImage.style.opacity = '0.5';
            cells[index].appendChild(backgroundImage);
          }

          const thankYouSpan = document.createElement('span');
          thankYouSpan.className = 'thank-you';
          thankYouSpan.innerHTML = this.cellAssignments[index].content.replace(/\n/g, '<br>');
          cells[index].appendChild(thankYouSpan);
        }
      });
    }
  }

  render() {
    if (!this.giftData || !this.cellAssignments.length) return;
    const rows = parseInt(this.getAttribute('rows')) || 6;
    const cols = parseInt(this.getAttribute('cols')) || 6;
    const gridWidth = parseInt(this.getAttribute('grid-width')) || 6;
    const borderWidth = parseInt(this.getAttribute('border-width')) || 6;
    const totalCells = rows * cols;

    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        width: 100vw;
        height: 100vh;
        margin: 0;
        background: white;
      }
      .grid-container {
        display: grid;
        grid-template-rows: repeat(${rows}, 1fr);
        grid-template-columns: repeat(${cols}, 1fr);
        gap: ${gridWidth}px;
        width: 100%;
        height: 100%;
        background: #000;
        box-sizing: border-box;
      }
      .grid-cell {
        display: flex;
        align-items: center;
        justify-content: center;
        border: ${borderWidth}px solid #000;
        cursor: pointer;
        position: relative;
        touch-action: none;
      }
      .grid-cell:hover:not(.clicked) {
        filter: brightness(1.1);
        transform: scale(1.05);
        transition: all 0.2s ease;
      }
      .background-image {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-size: cover;
        background-position: center;
        z-index: 0;
      }
      .material-icons {
        font-family: 'Material Icons';
        font-size: 64px;
        color: #fff;
        font-weight: normal;
        font-style: normal;
        line-height: 1;
        text-transform: none;
        letter-spacing: normal;
        word-wrap: normal;
        white-space: nowrap;
        direction: ltr;
        -webkit-font-smoothing: antialiased;
        text-rendering: optimizeLegibility;
        -moz-osx-font-smoothing: grayscale;
        font-feature-settings: 'liga';
        z-index: 1;
      }
      .thank-you {
        font-size: 24px;
        color: #fff;
        font-family: Arial, sans-serif;
        white-space: pre-wrap;
        z-index: 1;
        text-align: center;
      }
      .clicked {
        background-color: transparent !important;
      }
    `;

    const gridContainer = document.createElement('div');
    gridContainer.className = 'grid-container';

    for (let i = 0; i < totalCells; i++) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      const colorIndex = i % this.colors.length;
      cell.style.backgroundColor = this.colors[colorIndex];

      if (!this.clickedCells.includes(i)) {
        const iconSpan = document.createElement('i');
        iconSpan.className = 'material-icons';
        iconSpan.textContent = this.icons[Math.floor(Math.random() * this.icons.length)];
        cell.appendChild(iconSpan);
      }

      if (i === 0) {
        cell.addEventListener('mousedown', (e) => {
          e.preventDefault();
          this.isLongPressing = false;
          this.longPressTimer = setTimeout(() => {
            this.isLongPressing = true;
            this.showVerificationModal();
          }, 3000);
        });
        cell.addEventListener('mouseup', () => {
          clearTimeout(this.longPressTimer);
          this.isLongPressing = false;
        });
        cell.addEventListener('mouseleave', () => {
          clearTimeout(this.longPressTimer);
          this.isLongPressing = false;
        });

        cell.addEventListener('touchstart', (e) => {
          e.preventDefault();
          this.isLongPressing = false;
          this.longPressTimer = setTimeout(() => {
            this.isLongPressing = true;
            this.showVerificationModal();
          }, 3000);
        });
        cell.addEventListener('touchend', () => {
          clearTimeout(this.longPressTimer);
          this.isLongPressing = false;
        });
        cell.addEventListener('touchcancel', () => {
          clearTimeout(this.longPressTimer);
          this.isLongPressing = false;
        });
      }

      if (!this.clickedCells.includes(i)) {
        cell.addEventListener('click', this.handleCellClick.bind(this));
      } else {
        cell.style.backgroundColor = 'transparent';
        cell.innerHTML = '';

        if (this.cellAssignments[i].type === 'gift' && this.cellAssignments[i].image) {
          const backgroundImage = document.createElement('div');
          backgroundImage.className = 'background-image';
          backgroundImage.style.backgroundImage = `url(${this.cellAssignments[i].image})`;
          backgroundImage.style.opacity = '0.5';
          cell.appendChild(backgroundImage);
        }

        const thankYouSpan = document.createElement('span');
        thankYouSpan.className = 'thank-you';
        thankYouSpan.innerHTML = this.cellAssignments[i].content.replace(/\n/g, '<br>');
        cell.appendChild(thankYouSpan);
      }
      gridContainer.appendChild(cell);
    }

    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(gridContainer);
  }
}

customElements.define('ai-blind-box', AIBlindBox);