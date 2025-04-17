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
  }

  static get observedAttributes() {
    return ['rows', 'cols', 'grid-width', 'border-width'];
  }

  attributeChangedCallback() {
    this.render();
  }

  connectedCallback() {
    this.render();
    document.addEventListener('keydown', this.handleCtrlR.bind(this));
    this.restoreClickedStates();
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this.handleCtrlR.bind(this));
  }

  set giftData(data) {
    this._giftData = data;
    this.assignCells();
    this.render();
  }

  get giftData() {
    return this._giftData;
  }

  assignCells() {
    if (!this.giftData || this.cellAssignments.length === 0) {
      const rows = parseInt(this.getAttribute('rows')) || 4;
      const cols = parseInt(this.getAttribute('cols')) || 4;
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
  }

  handleCtrlR(event) {
    if (event.ctrlKey && event.key === 'r') {
      event.preventDefault();
      this.showVerificationModal();
    }
  }

  showVerificationModal() {
    // 生成隨機 4 位數字
    this.verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 20px;
      border-radius: 5px;
      z-index: 1000;
      text-align: center;
    `;
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = `輸入 ${this.verificationCode}`;
    input.style.cssText = 'margin-bottom: 10px; padding: 5px;';
    const message = document.createElement('p');
    message.textContent = `請輸入 ${this.verificationCode} 以重置`;
    const submit = document.createElement('button');
    submit.textContent = '提交';
    submit.style.cssText = 'padding: 5px 10px;';
    submit.onclick = () => {
      if (input.value === this.verificationCode) {
        localStorage.removeItem('clickedCells');
        this.clickedCells = [];
        this.assignCells(); // 重新分配 gift 和 nothing
        this.render();
        document.body.removeChild(modal);
      } else {
        message.textContent = '輸入錯誤，請再試一次';
      }
    };
    // 添加 Enter 和 Esc 鍵支援
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submit.click();
      if (e.key === 'Escape') document.body.removeChild(modal);
    });
    modal.appendChild(message);
    modal.appendChild(input);
    modal.appendChild(submit);
    document.body.appendChild(modal);
  }

  handleCellClick(event) {
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
      thankYouSpan.textContent = this.cellAssignments[index].content;
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
          thankYouSpan.textContent = this.cellAssignments[index].content;
          cells[index].appendChild(thankYouSpan);
        }
      });
    }
  }

  render() {
    if (!this.giftData || !this.cellAssignments.length) return;
    const rows = parseInt(this.getAttribute('rows')) || 4;
    const cols = parseInt(this.getAttribute('cols')) || 4;
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

      if (this.clickedCells.includes(i)) {
        cell.classList.add('clicked');
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
        thankYouSpan.textContent = this.cellAssignments[i].content;
        cell.appendChild(thankYouSpan);
      } else {
        cell.addEventListener('click', this.handleCellClick.bind(this));
      }
      gridContainer.appendChild(cell);
    }

    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(gridContainer);
  }
}

customElements.define('ai-blind-box', AIBlindBox);