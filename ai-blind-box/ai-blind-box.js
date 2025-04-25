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
    this.cellAssignments = [];
    this.verificationCode = '';
    this.longPressTimer = null;
    this.isLongPressing = false;

    this.defaultGiftData = {
      gift: [
        {
          name: "糖果",
          count: 3,
          image: "",
          icon: this.icons[Math.floor(Math.random() * this.icons.length)],
          opacity: 50
        },
        {
          name: "餅干",
          count: 3,
          image: "",
          icon: this.icons[Math.floor(Math.random() * this.icons.length)],
          opacity: 50
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
    this.initializeGiftData();
    document.addEventListener('DOMContentLoaded', () => {
      this.render();
      this.restoreClickedStates();
    });
    document.addEventListener('keydown', this.handleCtrlR.bind(this));
    window.addEventListener('resize', () => this.render());
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this.handleCtrlR.bind(this));
    window.removeEventListener('resize', () => this.render());
  }

  set giftData(data) {
    data.gift = data.gift.map(gift => ({
      ...gift,
      icon: gift.icon || this.icons[Math.floor(Math.random() * this.icons.length)],
      opacity: gift.opacity !== undefined ? gift.opacity : 50
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
      icon: gift.icon || this.icons[Math.floor(Math.random() * this.icons.length)],
      opacity: gift.opacity !== undefined ? gift.opacity : 50
    }));
    localStorage.setItem('giftData', JSON.stringify(this._giftData));

    const rows = parseInt(this.getAttribute('rows')) || 6;
    const cols = parseInt(this.getAttribute('cols')) || 6;
    const totalCells = rows * cols;
    const storedAssignments = JSON.parse(localStorage.getItem('cellAssignments') || '[]');

    if (storedAssignments.length !== totalCells || !storedAssignments.every(assignment => assignment && assignment.type && assignment.content)) {
      console.log('Stored cell assignments invalid or mismatch, reassigning cells...');
      this.assignCells();
    } else {
      console.log('Loaded cell assignments from localStorage:', storedAssignments);
      this.cellAssignments = storedAssignments;
    }
  }

  assignCells() {
    if (!this.giftData) {
      console.error('Gift data not initialized, cannot assign cells.');
      return;
    }
    const rows = parseInt(this.getAttribute('rows')) || 6;
    const cols = parseInt(this.getAttribute('cols')) || 6;
    const totalCells = rows * cols;
    
    this.cellAssignments = Array(totalCells).fill({ type: 'nothing', content: this.giftData.nothing });
    const giftIndices = [];
    let totalGiftCount = 0;

    this.giftData.gift.forEach(gift => {
      const count = gift.count || 1;
      totalGiftCount += count;
      for (let i = 0; i < count; i++) {
        let index;
        do {
          index = Math.floor(Math.random() * totalCells);
        } while (giftIndices.includes(index));
        giftIndices.push(index);
        this.cellAssignments[index] = { 
          type: 'gift', 
          content: gift.name, 
          image: gift.image,
          opacity: gift.opacity
        };
      }
    });

    console.log(`Assigned ${giftIndices.length} gift cells out of ${totalCells} total cells.`);
    console.log('Cell assignments:', this.cellAssignments);
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
      min-height: 150px;
      max-height: calc(100vh - 40px);
      overflow-y: auto;
      box-sizing: border-box;
    `;
    
    document.body.style.overflow = 'hidden';
    
    const message = document.createElement('p');
    message.textContent = `請輸入 ${this.verificationCode} 以重置`;
    
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = `輸入 ${this.verificationCode}`;
    input.style.cssText = `
      margin: 10px 0;
      padding: 5px;
      width: 100%;
      box-sizing: border-box;
      font-size: 16px;
      -webkit-user-select: auto;
    `;
    
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
        resetViewport();
        this.showFireworks();
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
      resetViewport();
    };
    
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submit.click();
      if (e.key === 'Escape') {
        document.body.removeChild(overlay);
        resetViewport();
      }
    });
    
    input.addEventListener('focus', () => {
      input.style.fontSize = '16px';
    });
    
    modal.appendChild(closeButton);
    modal.appendChild(message);
    modal.appendChild(input);
    modal.appendChild(submit);
    modal.appendChild(editLink);
    document.body.appendChild(overlay);
    overlay.appendChild(modal);

    function resetViewport() {
      document.body.style.overflow = '';
      window.scrollTo(0, 0);
    }
  }

  showFireworks(cell) {
    console.log('Showing fireworks animation...');
    const fireworks = document.createElement('div');
    fireworks.className = 'fireworks';
    
    // 獲取網格容器作為父元素
    const gridContainer = this.shadowRoot.querySelector('.grid-container');
    gridContainer.appendChild(fireworks);
    console.log('Fireworks element created and appended to grid-container:', fireworks);

    // 計算單元中心座標（相對於 grid-container）
    const cellRect = cell.getBoundingClientRect();
    const gridRect = gridContainer.getBoundingClientRect();
    const cellCenterX = cellRect.left - gridRect.left + cellRect.width / 2;
    const cellCenterY = cellRect.top - gridRect.top + cellRect.height / 2;

    // 設置煙火容器的位置
    fireworks.style.left = `${cellCenterX}px`;
    fireworks.style.top = `${cellCenterY}px`;

    // 添加音效
    const audio = document.createElement('audio');
    audio.src = './firework.wav';
    audio.preload = 'auto';
    document.body.appendChild(audio);
    audio.play().catch(error => {
      console.warn('Failed to play firework sound:', error);
    });

    const particleCount = 12;
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'firework-particle';
      particle.style.backgroundColor = this.colors[Math.floor(Math.random() * this.colors.length)];
      const angle = (i / particleCount) * 360;
      const radius = 150;
      const targetX = radius * Math.cos((angle * Math.PI) / 180);
      const targetY = radius * Math.sin((angle * Math.PI) / 180);
      particle.style.setProperty('--target-x', `${targetX}px`);
      particle.style.setProperty('--target-y', `${targetY}px`);
      fireworks.appendChild(particle);
      particles.push(particle);
    }
    console.log(`Created ${particles.length} firework particles:`, particles);

    setTimeout(() => {
      console.log('Fireworks animation ended, removing element.');
      if (fireworks.parentNode) {
        gridContainer.removeChild(fireworks);
      }
      if (audio.parentNode) {
        audio.pause();
        document.body.removeChild(audio);
      }
    }, 2000);
  }

  handleCellClick(event) {
    if (this.isLongPressing) return;
    const cell = event.target.closest('.grid-cell');
    if (cell && !cell.classList.contains('clicked')) {
      const index = Array.from(this.shadowRoot.querySelectorAll('.grid-cell')).indexOf(cell);
      console.log(`Cell ${index} clicked. Assignment:`, this.cellAssignments[index]);
      
      this.clickedCells.push(index);
      localStorage.setItem('clickedCells', JSON.stringify(this.clickedCells));
      cell.classList.add('clicked');
      cell.style.backgroundColor = 'transparent';
      cell.innerHTML = '';

      if (this.cellAssignments[index] && this.cellAssignments[index].type === 'gift') {
        console.log(`Cell ${index} is a gift! Triggering fireworks.`);
        if (this.cellAssignments[index].image) {
          const backgroundImage = document.createElement('div');
          backgroundImage.className = 'background-image';
          backgroundImage.style.backgroundImage = `url(${this.cellAssignments[index].image})`;
          backgroundImage.style.opacity = (this.cellAssignments[index].opacity / 100).toString();
          cell.appendChild(backgroundImage);
        }
        this.showFireworks(cell);
      } else {
        console.log(`Cell ${index} is not a gift. No fireworks triggered.`);
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
          console.log(`Restoring clicked state for cell ${index}:`, this.cellAssignments[index]);
          cells[index].classList.add('clicked');
          cells[index].style.backgroundColor = 'transparent';
          cells[index].innerHTML = '';

          if (this.cellAssignments[index] && this.cellAssignments[index].type === 'gift' && this.cellAssignments[index].image) {
            const backgroundImage = document.createElement('div');
            backgroundImage.className = 'background-image';
            backgroundImage.style.backgroundImage = `url(${this.cellAssignments[index].image})`;
            backgroundImage.style.opacity = (this.cellAssignments[index].opacity / 100).toString();
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
    if (!this.giftData || !this.cellAssignments.length) {
      console.warn('Gift data or cell assignments not ready, cannot render.');
      return;
    }
    const rows = parseInt(this.getAttribute('rows')) || 6;
    const cols = parseInt(this.getAttribute('cols')) || 6;
    const gridWidth = parseInt(this.getAttribute('grid-width')) || 6;
    const borderWidth = parseInt(this.getAttribute('border-width')) || 6;
    const totalCells = rows * cols;

    const screenWidth = window.innerWidth;
    let maxCellSize;
    if (screenWidth < 600) {
      maxCellSize = 80;
    } else if (screenWidth < 1200) {
      maxCellSize = 120;
    } else {
      maxCellSize = 150;
    }

    const cellSize = Math.min(
      (window.innerWidth - (cols - 1) * gridWidth - 2 * borderWidth * cols) / cols,
      (window.innerHeight - (rows - 1) * gridWidth - 2 * borderWidth * rows) / rows,
      maxCellSize
    );

    const textSize = parseInt(localStorage.getItem('textSize')) || 14;
    const iconSize = parseInt(localStorage.getItem('iconSize')) || 32;
    const textPosition = localStorage.getItem('textPosition') || 'center';
    const textColor = localStorage.getItem('textColor') || '#FFFFFF';

    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        width: 100%;
        height: 100vh;
        margin: 0;
        background: white;
        overflow: hidden;
      }
      html {
        overflow: hidden !important;
        position: static !important;
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
      .grid-container {
        display: grid;
        grid-template-rows: repeat(${rows}, ${cellSize}px);
        grid-template-columns: repeat(${cols}, ${cellSize}px);
        gap: ${gridWidth}px;
        width: 100%;
        height: auto;
        background: #000;
        box-sizing: border-box;
        padding: ${screenWidth < 600 ? '5px' : '10px'};
        margin: 0;
        overflow: hidden;
        box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
        position: relative;
      }
      .grid-cell {
        display: flex;
        align-items: center;
        justify-content: center;
        border: ${borderWidth}px solid #000;
        cursor: pointer;
        position: relative;
        min-width: ${cellSize}px;
        min-height: ${cellSize}px;
        aspect-ratio: 1 / 1;
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
        font-size: ${iconSize}px;
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
        font-size: ${textSize}px;
        color: ${textColor};
        font-family: Arial, sans-serif;
        white-space: pre-wrap;
        z-index: 1;
        text-align: center;
        width: 100%;
        box-sizing: border-box;
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        ${textPosition === 'bottom' ? `
          bottom: 5px;
          top: auto;
        ` : `
          top: 50%;
          transform: translate(-50%, -50%);
        `}
      }
      .clicked {
        background-color: transparent !important;
      }
      .fireworks {
        position: absolute;
        width: 300px;
        height: 300px;
        transform: translate(-50%, -50%);
        z-index: 1000;
        pointer-events: none;
      }
      .firework-particle {
        position: absolute;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        top: 50%;
        left: 50%;
        animation: fallback 2s ease-out forwards;
      }
      @keyframes fallback {
        0% {
          transform: translate(0, 0) scale(1);
          opacity: 1;
        }
        100% {
          transform: translate(var(--target-x), var(--target-y)) scale(3);
          opacity: 0;
        }
      }
      @media (max-width: 600px) {
        .grid-container {
          width: 100%;
          height: auto;
          padding: 5px;
        }
        .grid-cell {
          min-width: 50px;
          min-height: 50px;
        }
        .fireworks {
          width: 200px;
          height: 200px;
        }
        .firework-particle {
          width: 15px;
          height: 15px;
        }
      }
      @media (min-width: 601px) and (max-width: 1199px) {
        .grid-container {
          width: 90%;
          height: auto;
          margin: 20px auto;
          padding: 10px;
        }
      }
      @media (min-width: 1200px) {
        .grid-container {
          width: 100vw;
          height: 100vh;
          margin: 0;
          padding: 0;
          display: grid;
          grid-template-rows: repeat(${rows}, 1fr);
          grid-template-columns: repeat(${cols}, 1fr);
          gap: ${gridWidth}px;
        }
        .grid-cell {
          min-width: 0;
          min-height: 0;
          width: 100%;
          height: 100%;
        }
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
          }, 2000);
        });
        cell.addEventListener('mouseup', () => {
          clearTimeout(this.longPressTimer);
          this.isLongPressing = false;
        });
        cell.addEventListener('mouseleave', () => {
          clearTimeout(this.longPressTimer);
          this.isLongPressing = false;
        });

        cell.addEventListener('touchstart', () => {
          this.isLongPressing = false;
          this.longPressTimer = setTimeout(() => {
            this.isLongPressing = true;
            this.showVerificationModal();
          }, 2000);
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
        cell.addEventListener('touchend', this.handleCellClick.bind(this));
      } else {
        cell.style.backgroundColor = 'transparent';
        cell.innerHTML = '';

        if (this.cellAssignments[i] && this.cellAssignments[i].type === 'gift' && this.cellAssignments[i].image) {
          const backgroundImage = document.createElement('div');
          backgroundImage.className = 'background-image';
          backgroundImage.style.backgroundImage = `url(${this.cellAssignments[i].image})`;
          backgroundImage.style.opacity = (this.cellAssignments[i].opacity / 100).toString();
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