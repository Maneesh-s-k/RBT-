class ControlPanel {
    constructor() {
        this.elements = {
            nodeValue: document.getElementById('nodeValue'),
            insertBtn: document.getElementById('insertBtn'),
            deleteBtn: document.getElementById('deleteBtn'),
            searchBtn: document.getElementById('searchBtn'),
            randomBtn: document.getElementById('randomBtn'),
            clearBtn: document.getElementById('clearBtn'),
            validateBtn: document.getElementById('validateBtn'),
            centerBtn: document.getElementById('centerBtn'),
            exportBtn: document.getElementById('exportBtn')
        };
        
        this.isProcessing = false;
        this.callbacks = {};
        
        this.bindEvents();
        this.setupValidation();
    }

    bindEvents() {
        // Input validation
        this.elements.nodeValue.addEventListener('input', (e) => {
            this.validateInput(e.target);
        });

        this.elements.nodeValue.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleInsert();
            }
        });

        // Button events
        this.elements.insertBtn.addEventListener('click', () => this.handleInsert());
        this.elements.deleteBtn.addEventListener('click', () => this.handleDelete());
        this.elements.searchBtn.addEventListener('click', () => this.handleSearch());
        this.elements.randomBtn.addEventListener('click', () => this.handleRandom());
        this.elements.clearBtn.addEventListener('click', () => this.handleClear());
        this.elements.validateBtn.addEventListener('click', () => this.handleValidate());
        this.elements.centerBtn.addEventListener('click', () => this.handleCenter());
        this.elements.exportBtn.addEventListener('click', () => this.handleExport());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT') return;
            
            switch(e.key) {
                case 'i':
                case 'I':
                    this.elements.nodeValue.focus();
                    break;
                case 'r':
                case 'R':
                    if (!this.isProcessing) this.handleRandom();
                    break;
                case 'c':
                case 'C':
                    if (e.ctrlKey || e.metaKey) return; // Don't interfere with copy
                    if (!this.isProcessing) this.handleClear();
                    break;
                case 'v':
                case 'V':
                    if (!this.isProcessing) this.handleValidate();
                    break;
                case 'Escape':
                    this.elements.nodeValue.blur();
                    break;
            }
        });
    }

    setupValidation() {
        // Real-time input validation
        this.elements.nodeValue.addEventListener('input', (e) => {
            const value = e.target.value;
            const isValid = this.isValidInput(value);
            
            // Update button states
            this.elements.insertBtn.disabled = !isValid || this.isProcessing;
            this.elements.deleteBtn.disabled = !isValid || this.isProcessing;
            this.elements.searchBtn.disabled = !isValid || this.isProcessing;
            
            // Visual feedback
            e.target.classList.toggle('error', !isValid && value !== '');
            e.target.classList.toggle('success', isValid);
        });
    }

    isValidInput(value) {
        if (!value || value.trim() === '') return false;
        const num = parseInt(value);
        return !isNaN(num) && num >= 1 && num <= 999;
    }

    validateInput(input) {
        const value = input.value;
        const isValid = this.isValidInput(value);
        
        if (value && !isValid) {
            this.showInputError('Please enter a number between 1 and 999');
        } else {
            this.clearInputError();
        }
        
        return isValid;
    }

    showInputError(message) {
        // Remove existing error
        this.clearInputError();
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'input-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: #ef4444;
            font-size: 0.75rem;
            margin-top: 0.25rem;
            animation: slideIn 0.2s ease;
        `;
        
        this.elements.nodeValue.parentNode.appendChild(errorDiv);
    }

    clearInputError() {
        const existingError = this.elements.nodeValue.parentNode.querySelector('.input-error');
        if (existingError) {
            existingError.remove();
        }
    }

    async handleInsert() {
        const value = this.getInputValue();
        if (!value) return;

        try {
            this.setProcessing(true);
            await this.executeCallback('insert', value);
            this.clearInput();
        } catch (error) {
            this.handleError('Insert failed', error);
        } finally {
            this.setProcessing(false);
        }
    }

    async handleDelete() {
        const value = this.getInputValue();
        if (!value) return;

        try {
            this.setProcessing(true);
            await this.executeCallback('delete', value);
            this.clearInput();
        } catch (error) {
            this.handleError('Delete failed', error);
        } finally {
            this.setProcessing(false);
        }
    }

    async handleSearch() {
        const value = this.getInputValue();
        if (!value) return;

        try {
            this.setProcessing(true);
            await this.executeCallback('search', value);
        } catch (error) {
            this.handleError('Search failed', error);
        } finally {
            this.setProcessing(false);
        }
    }

    async handleRandom() {
        try {
            this.setProcessing(true);
            await this.executeCallback('random');
        } catch (error) {
            this.handleError('Random insert failed', error);
        } finally {
            this.setProcessing(false);
        }
    }

    async handleClear() {
        // Confirmation dialog
        if (!confirm('Are you sure you want to clear all nodes? This action cannot be undone.')) {
            return;
        }

        try {
            this.setProcessing(true);
            await this.executeCallback('clear');
            this.clearInput();
        } catch (error) {
            this.handleError('Clear failed', error);
        } finally {
            this.setProcessing(false);
        }
    }

    async handleValidate() {
        try {
            this.setProcessing(true);
            await this.executeCallback('validate');
        } catch (error) {
            this.handleError('Validation failed', error);
        } finally {
            this.setProcessing(false);
        }
    }

    handleCenter() {
        this.executeCallback('center');
    }

    handleExport() {
        this.executeCallback('export');
    }

    getInputValue() {
        const value = this.elements.nodeValue.value.trim();
        if (!this.isValidInput(value)) {
            this.elements.nodeValue.focus();
            AnimationUtils.shake(this.elements.nodeValue);
            return null;
        }
        return parseInt(value);
    }

    clearInput() {
        this.elements.nodeValue.value = '';
        this.elements.nodeValue.classList.remove('success', 'error');
        this.clearInputError();
        this.updateButtonStates();
    }

    setProcessing(processing) {
        this.isProcessing = processing;
        this.updateButtonStates();
        
        // Add/remove loading class to buttons
        Object.values(this.elements).forEach(element => {
            if (element.tagName === 'BUTTON') {
                element.classList.toggle('loading', processing);
            }
        });

        // Show/hide loading overlay
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.toggle('show', processing);
        }
    }

    updateButtonStates() {
        const hasValidInput = this.isValidInput(this.elements.nodeValue.value);
        
        this.elements.insertBtn.disabled = !hasValidInput || this.isProcessing;
        this.elements.deleteBtn.disabled = !hasValidInput || this.isProcessing;
        this.elements.searchBtn.disabled = !hasValidInput || this.isProcessing;
        this.elements.randomBtn.disabled = this.isProcessing;
        this.elements.clearBtn.disabled = this.isProcessing;
        this.elements.validateBtn.disabled = this.isProcessing;
    }

    // Callback system for communication with main app
    onInsert(callback) {
        this.callbacks.insert = callback;
    }

    onDelete(callback) {
        this.callbacks.delete = callback;
    }

    onSearch(callback) {
        this.callbacks.search = callback;
    }

    onRandom(callback) {
        this.callbacks.random = callback;
    }

    onClear(callback) {
        this.callbacks.clear = callback;
    }

    onValidate(callback) {
        this.callbacks.validate = callback;
    }

    onCenter(callback) {
        this.callbacks.center = callback;
    }

    onExport(callback) {
        this.callbacks.export = callback;
    }

    async executeCallback(action, ...args) {
        if (this.callbacks[action]) {
            return await this.callbacks[action](...args);
        }
    }

    handleError(operation, error) {
        console.error(`${operation}:`, error);
        
        // Show user-friendly error message
        const message = error.message || 'An unexpected error occurred';
        this.showMessage(`${operation}: ${message}`, 'error');
    }

    showMessage(text, type = 'info') {
        // This will be handled by the main app's message system
        document.dispatchEvent(new CustomEvent('showMessage', {
            detail: { text, type }
        }));
    }

    // Utility methods
    focusInput() {
        this.elements.nodeValue.focus();
        this.elements.nodeValue.select();
    }

    setInputValue(value) {
        this.elements.nodeValue.value = value;
        this.validateInput(this.elements.nodeValue);
    }

    // Batch operations
    async insertMultiple(values) {
        for (const value of values) {
            this.setInputValue(value);
            await this.handleInsert();
            await new Promise(resolve => setTimeout(resolve, 500)); // Delay between insertions
        }
    }

    // Demo sequences
    async runDemo() {
        const demoValues = [50, 25, 75, 10, 30, 60, 80, 5, 15, 27, 35];
        
        this.showMessage('Running demo sequence...', 'info');
        
        for (const value of demoValues) {
            this.setInputValue(value);
            await this.handleInsert();
            await new Promise(resolve => setTimeout(resolve, 800));
        }
        
        this.showMessage('Demo completed!', 'success');
    }
}

// Make available globally
window.ControlPanel = ControlPanel;
