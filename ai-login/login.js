class LoginComponent extends HTMLElement {
    constructor(loginHandler = null) {
        super();
        this.attachShadow({ mode: 'open' });
        this.isVisible = false;
        this.loginHandler = loginHandler;
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                .login-overlay {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.5);
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }
                .login-form {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    background-color: white;
                    padding: 40px;
                    border-radius: 10px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }
                .profile-icon {
                    width: 128px;
                    height: 128px;
                    border-radius: 50%;
                    margin-bottom: 70px;
                }
                .input-container {
                    width: 250px;
                    margin-bottom: 40px;
                    position: relative;
                }
                .form-label {
                    position: absolute;
                    left: 0;
                    top: -20px;
                    font-size: 14px;
                    color: #333;
                }
                .form-input {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    font-size: 16px;
                    box-sizing: border-box;
                }
                .password-container {
                    position: relative;
                    width: 250px;
                    margin-bottom: 40px;
                }
                .password-input {
                    width: 100%;
                    padding: 10px 40px 10px 10px;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    font-size: 16px;
                    box-sizing: border-box;
                }
                .toggle-password {
                    position: absolute;
                    right: 10px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 16px;
                    padding: 0;
                    width: 20px;
                    height: 20px;
                }
                .button-container {
                    display: flex;
                    gap: 30px;
                }
                .form-button {
                    padding: 10px 20px;
                    font-size: 16px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                }
                .cancel-button {
                    background-color: #ccc;
                }
                .cancel-button:hover {
                    background-color: #b3b3b3;
                }
                .login-button {
                    background-color: #007bff;
                    color: white;
                }
                .login-button:hover {
                    background-color: #0056b3;
                }
            </style>
            <div class="login-overlay">
                <div class="login-form">
                    <img src="assets/login.png" alt="人型圖標" class="profile-icon">
                    <div class="input-container">
                        <label for="username" class="form-label">姓 名</label>
                        <input type="text" class="form-input" placeholder="請輸入姓名" id="username">
                    </div>
                    <div class="password-container">
                        <label for="password" class="form-label">密 碼</label>
                        <input type="password" class="password-input" placeholder="請輸入密碼" id="password">
                        <button type="button" class="toggle-password">👁️</button>
                    </div>
                    <div class="button-container">
                        <button class="form-button cancel-button">取 消</button>
                        <button class="form-button login-button">登 入</button>
                    </div>
                </div>
            </div>
        `;
        this.setupEventListeners();
    }

    setupEventListeners() {
        const toggleButton = this.shadowRoot.querySelector('.toggle-password');
        const passwordInput = this.shadowRoot.querySelector('#password');
        const cancelButton = this.shadowRoot.querySelector('.cancel-button');
        const loginButton = this.shadowRoot.querySelector('.login-button');

        toggleButton.addEventListener('click', () => {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                toggleButton.textContent = '👁️‍🗨️';
            } else {
                passwordInput.type = 'password';
                toggleButton.textContent = '👁️';
            }
        });

        cancelButton.addEventListener('click', () => {
            const eventData = { action: 'cancel' };
            if (this.loginHandler) {
                this.loginHandler(eventData);
            }
            this.clearInputs();
        });

        loginButton.addEventListener('click', () => {
            const username = this.shadowRoot.querySelector('#username').value;
            const password = passwordInput.value;
            if (username && password) {
                const eventData = { 
                    action: 'ok',
                    username: username,
                    password: password 
                };
                if (this.loginHandler) {
                    this.loginHandler(eventData);
                }
                this.clearInputs();
            } else {
                alert('請輸入姓名和密碼');
            }
        });
    }

    clearInputs() {
        this.shadowRoot.querySelector('#username').value = '';
        this.shadowRoot.querySelector('#password').value = '';
    }

    show() {
        this.isVisible = true;
        this.shadowRoot.querySelector('.login-overlay').style.display = 'flex';
    }

    hide() {
        this.isVisible = false;
        this.shadowRoot.querySelector('.login-overlay').style.display = 'none';
    }
}

// 定義自訂元素
customElements.define('login-component', LoginComponent);