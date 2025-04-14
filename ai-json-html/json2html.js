class JsonToHtml {
    constructor() {
        this.buttonGroups = {};
        this.defaultMargin = '10px';
    }

    setMargin(margin) {
        this.defaultMargin = typeof margin === 'number' ? `${margin}px` : margin;
        return this;
    }

    toHtml(jsonData) {
        this.buttonGroups = {};
        const elements = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
        let html = '';

        // 先收集所有按鈕並按 group 分類
        const buttonMap = {};
        elements.forEach(element => {
            if (element.type.toLowerCase() === 'button') {
                const groupId = element.group || `btn_${element.id}`;
                if (!buttonMap[groupId]) {
                    buttonMap[groupId] = [];
                }
                buttonMap[groupId].push(element);
            }
        });

        // 處理所有元素
        elements.forEach(element => {
            if (element.type.toLowerCase() === 'button') {
                const groupId = element.group || `btn_${element.id}`;
                // 只在第一個按鈕時渲染整個按鈕組
                if (buttonMap[groupId][0] === element) {
                    const wrapper = this.createButtonGroup(buttonMap[groupId]);
                    html += wrapper.outerHTML || '';
                }
            } else {
                const elementHtml = this.createElement(element);
                if (elementHtml) {
                    html += elementHtml.outerHTML || '';
                }
            }
        });

        return html;
    }

    toDiv(jsonData, containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            throw new Error(`Container with id "${containerId}" not found`);
        }

        const html = this.toHtml(jsonData);
        container.innerHTML = html;
        this.bindEvents(jsonData, container);
    }

    createElement(elementDef) {
        const { type, id, label, value, options, height, line, align } = elementDef;
        const wrapper = document.createElement('div');
        wrapper.style.marginBottom = '10px'; // 元件間距 10px
        wrapper.style.marginLeft = this.defaultMargin;
        wrapper.style.marginRight = this.defaultMargin;

        switch (type.toLowerCase()) {
            case 'text':
            case 'password':
            case 'email':
                return this.createInput(wrapper, type, id, label, value);
            case 'label':
                return this.createLabel(wrapper, id, label, align);
            case 'spacer':
                return this.createSpacer(wrapper, height, line);
            case 'select':
                return this.createSelect(wrapper, id, label, options, value);
            case 'textarea':
                return this.createTextarea(wrapper, id, label, value);
            case 'checkbox':
                return this.createCheckbox(wrapper, id, label, value);
            case 'radio':
                return this.createRadio(wrapper, id, label, options, value);
            case 'image':
                return this.createImage(wrapper, id, label, value, align);
            default:
                console.warn(`Unsupported element type: ${type}`);
                return null;
        }
    }

    createInput(wrapper, type, id, label, value) {
        const labelEl = document.createElement('label');
        labelEl.textContent = label || '';
        labelEl.htmlFor = id;
        labelEl.classList.add('form-label');
        labelEl.style.fontSize = '14px';
        labelEl.style.marginBottom = '3px';

        const input = document.createElement('input');
        input.type = type;
        input.id = id;
        input.name = id;
        input.value = value || '';
        input.classList.add('form-control');

        wrapper.appendChild(labelEl);
        wrapper.appendChild(input);
        return wrapper;
    }

    createLabel(wrapper, id, label, align) {
        const labelEl = document.createElement('label');
        labelEl.textContent = label || '';
        if (id) labelEl.id = id;
        labelEl.classList.add('form-label');
        labelEl.style.display = 'block';

        switch (align) {
            case 'center':
                labelEl.classList.add('text-center');
                break;
            case 'right':
                labelEl.classList.add('text-end');
                break;
            default: // 'left' 或未指定
                labelEl.classList.add('text-start');
                break;
        }

        wrapper.appendChild(labelEl);
        return wrapper;
    }

    createSpacer(wrapper, height, line) {
        const spacerHeight = typeof height === 'number' ? `${height}px` : (height || '10px');
        wrapper.style.height = spacerHeight;
        wrapper.style.position = 'relative';

        if (line) {
            const hr = document.createElement('hr');
            hr.style.position = 'absolute';
            hr.style.top = '50%';
            hr.style.width = '100%';
            hr.style.border = 'none';
            hr.style.borderTop = '1px solid #ccc';
            hr.style.margin = '0';
            wrapper.appendChild(hr);
        }

        return wrapper;
    }

    createSelect(wrapper, id, label, options, value) {
        const labelEl = document.createElement('label');
        labelEl.textContent = label || '';
        labelEl.htmlFor = id;
        labelEl.classList.add('form-label');
        labelEl.style.fontSize = '14px';
        labelEl.style.marginBottom = '3px';

        const select = document.createElement('select');
        select.id = id;
        select.name = id;
        select.classList.add('form-select');

        options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.label;
            if (opt.value === value) option.selected = true;
            select.appendChild(option);
        });

        wrapper.appendChild(labelEl);
        wrapper.appendChild(select);
        return wrapper;
    }

    createTextarea(wrapper, id, label, value) {
        const labelEl = document.createElement('label');
        labelEl.textContent = label || '';
        labelEl.htmlFor = id;
        labelEl.classList.add('form-label');
        labelEl.style.fontSize = '14px';
        labelEl.style.marginBottom = '3px';

        const textarea = document.createElement('textarea');
        textarea.id = id;
        textarea.name = id;
        textarea.value = value || '';
        textarea.classList.add('form-control');
        textarea.rows = 3;

        wrapper.appendChild(labelEl);
        wrapper.appendChild(textarea);
        return wrapper;
    }

    createCheckbox(wrapper, id, label, value) {
        const div = document.createElement('div');
        div.classList.add('form-check');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = id;
        checkbox.name = id;
        checkbox.checked = !!value;
        checkbox.classList.add('form-check-input');

        const labelEl = document.createElement('label');
        labelEl.textContent = label || '';
        labelEl.htmlFor = id;
        labelEl.classList.add('form-check-label');
        labelEl.style.fontSize = '14px';
        labelEl.style.marginLeft = '3px';

        div.appendChild(checkbox);
        div.appendChild(labelEl);
        wrapper.appendChild(div);
        return wrapper;
    }

    createRadio(wrapper, id, label, options, value) {
        const labelEl = document.createElement('label');
        labelEl.textContent = label || '';
        labelEl.classList.add('form-label');
        labelEl.style.fontSize = '14px';
        labelEl.style.marginBottom = '3px';
        wrapper.appendChild(labelEl);

        options.forEach(opt => {
            const div = document.createElement('div');
            div.classList.add('form-check');

            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.id = `${id}_${opt.value}`;
            radio.name = id;
            radio.value = opt.value;
            radio.checked = opt.value === value;
            radio.classList.add('form-check-input');

            const radioLabel = document.createElement('label');
            radioLabel.textContent = opt.label;
            radioLabel.htmlFor = `${id}_${opt.value}`;
            radioLabel.classList.add('form-check-label');
            radioLabel.style.fontSize = '14px';
            radioLabel.style.marginLeft = '3px';

            div.appendChild(radio);
            div.appendChild(radioLabel);
            wrapper.appendChild(div);
        });

        return wrapper;
    }

    createImage(wrapper, id, label, value, align) {
        if (label) {
            const labelEl = document.createElement('label');
            labelEl.textContent = label;
            labelEl.classList.add('form-label');
            labelEl.style.fontSize = '14px';
            labelEl.style.marginBottom = '3px';
            wrapper.appendChild(labelEl);
        }

        const img = document.createElement('img');
        img.id = id;
        img.src = value || '';
        img.classList.add('img-fluid');

        // 處理對齊
        if (align === 'center') {
            img.classList.add('d-block', 'mx-auto');
        } else if (align === 'right') {
            img.classList.add('float-end');
            wrapper.style.overflow = 'hidden'; // 限制浮動影響範圍
        } else {
            img.classList.add('float-start'); // 預設左對齊
        }

        wrapper.appendChild(img);
        return wrapper;
    }

    createButtonGroup(buttons) {
        const wrapper = document.createElement('div');
        wrapper.style.marginBottom = '10px';
        wrapper.style.marginLeft = this.defaultMargin;
        wrapper.style.marginRight = this.defaultMargin;

        const buttonGroup = document.createElement('div');
        buttonGroup.classList.add('btn-group', 'd-flex', 'gap-2');

        buttons.forEach(({ id, label, callback }) => {
            const button = document.createElement('button');
            button.id = id;
            button.textContent = label || 'Button';
            button.classList.add('btn', 'btn-primary');
            if (callback === 'cancel') button.classList.replace('btn-primary', 'btn-secondary');
            if (callback === 'extra') button.classList.replace('btn-primary', 'btn-info');
            if (callback) {
                button.dataset.action = typeof callback === 'string' ? callback : id;
            }
            buttonGroup.appendChild(button);
        });

        wrapper.appendChild(buttonGroup);
        return wrapper;
    }

    bindEvents(jsonData, container) {
        const elements = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
        
        elements.forEach(element => {
            if (element.type.toLowerCase() === 'button' && element.callback) {
                const button = container.querySelector(`#${element.id}`);
                if (button) {
                    button.addEventListener('click', (e) => {
                        const action = button.dataset.action;
                        let eventDetail = {
                            buttonId: element.id,
                            action: action
                        };
    
                        if (action === 'submit') {
                            const formData = {};
                            console.log('Starting form data collection...');
                            elements.forEach(el => {
                                if (el.id && el.type !== 'button' && el.type !== 'image' && el.type !== 'label' && el.type !== 'spacer') {
                                    console.log(`Processing ${el.id} (type: ${el.type})`);
                                    if (el.type === 'radio') {
                                        const checkedRadio = container.querySelector(`input[name="${el.id}"]:checked`);
                                        if (checkedRadio) {
                                            console.log(`Found checked radio for ${el.id}: value = ${checkedRadio.value}`);
                                            formData[el.id] = checkedRadio.value;
                                        } else {
                                            console.log(`No checked radio found for ${el.id}`);
                                            formData[el.id] = null;
                                        }
                                    } else {
                                        const input = container.querySelector(`#${el.id}`);
                                        if (input) {
                                            console.log(`Found input for ${el.id}: value = ${input.value}`);
                                            if (el.type === 'checkbox') {
                                                formData[el.id] = input.checked;
                                            } else {
                                                formData[el.id] = input.value;
                                            }
                                        } else {
                                            console.log(`No input found for ${el.id}`);
                                        }
                                    }
                                }
                            });
                            console.log('Final formData:', formData);
                            eventDetail.formData = formData;
                        }
    
                        container.dispatchEvent(new CustomEvent('jsonButtonClick', {
                            detail: eventDetail,
                            bubbles: true
                        }));
                    });
                }
            }
        });
    }
}