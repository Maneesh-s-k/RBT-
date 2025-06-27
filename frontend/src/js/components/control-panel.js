class ControlPanel {
    constructor() {
        this.isProcessing = false;
        this.callbacks = {};
        this.elements = {};
        
        // Wait for DOM to be ready before initializing
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initialize();
            });
        } else {
            this.initialize();
        }
    }

    initialize() {
        // Get elements after DOM is ready
        this.elements = {
            nodeValue: document.getElementById('nodeValue'),
            insertBtn: document.getElementById('insertBtn'),
            deleteBtn: document.getElementById('deleteBtn'),
            searchBtn: document.getElementById('searchBtn'),
            randomBtn: document.getElementById('randomBtn'),
            clearBtn: document.getElementById('clearBtn'),
            exportBtn: document.getElementById('exportBtn')
        };
        
        // Check if required elements exist
        if (!this.elements.nodeValue || !this.elements.insertBtn) {
            console.error('Required DOM elements not found');
            return;
        }
        
        this.bindEvents();
        this.setupValidation();
    }

    bindEvents() {
        // Verify elements exist before binding
        if (!this.elements.nodeValue) {
            console.error('Cannot bind events: nodeValue element not found');
            return;
        }

        // Input validation
        this.elements.nodeValue.addEventListener('input', (e) => {
            this.validateInput(e.target);
        });

        this.elements.nodeValue.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleInsert();
            }
        });

        // Button events with null checks
        if (this.elements.insertBtn) {
            this.elements.insertBtn.addEventListener('click', () => this.handleInsert());
        }
        
        if (this.elements.deleteBtn) {
            this.elements.deleteBtn.addEventListener('click', () => this.handleDelete());
        }
        
        if (this.elements.searchBtn) {
            this.elements.searchBtn.addEventListener('click', () => this.handleSearch());
        }
        
        if (this.elements.randomBtn) {
            this.elements.randomBtn.addEventListener('click', () => this.handleRandom());
        }
        
        if (this.elements.clearBtn) {
            this.elements.clearBtn.addEventListener('click', () => this.handleClear());
        }
        
        if (this.elements.exportBtn) {
            this.elements.exportBtn.addEventListener('click', () => this.handleExport());
        }

       // Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    
    switch(e.key) {
        case 'i':
        case 'I':
            if (this.elements.nodeValue) {
                this.elements.nodeValue.focus();
            }
            break;
        case 'r':
        case 'R':
            // FIXED: Don't trigger on refresh (Ctrl+R/Cmd+R)
            if (e.ctrlKey || e.metaKey) return;
            if (!this.isProcessing) this.handleRandom();
            break;
        case 'c':
        case 'C':
            if (e.ctrlKey || e.metaKey) return;
            if (!this.isProcessing) this.handleClear();
            break;
        case 'Escape':
            if (this.elements.nodeValue) {
                this.elements.nodeValue.blur();
            }
            break;
    }
});

    }

    setupValidation() {
        if (!this.elements.nodeValue) return;
        
        this.elements.nodeValue.addEventListener('input', (e) => {
            const value = e.target.value;
            const isValid = this.isValidInput(value);
            
            if (this.elements.insertBtn) {
                this.elements.insertBtn.disabled = !isValid || this.isProcessing;
            }
            if (this.elements.deleteBtn) {
                this.elements.deleteBtn.disabled = !isValid || this.isProcessing;
            }
            if (this.elements.searchBtn) {
                this.elements.searchBtn.disabled = !isValid || this.isProcessing;
            }
            
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
        if (!this.elements.nodeValue) return;
        
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
        if (!this.elements.nodeValue) return;
        
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

    handleExport() {
        this.executeCallback('export');
    }

    getInputValue() {
        if (!this.elements.nodeValue) return null;
        
        const value = this.elements.nodeValue.value.trim();
        if (!this.isValidInput(value)) {
            this.elements.nodeValue.focus();
            // FIXED: Safe AnimationUtils usage
            if (window.AnimationUtils && window.AnimationUtils.shake) {
                AnimationUtils.shake(this.elements.nodeValue);
            }
            return null;
        }
        return parseInt(value);
    }

    clearInput() {
        if (!this.elements.nodeValue) return;
        
        this.elements.nodeValue.value = '';
        this.elements.nodeValue.classList.remove('success', 'error');
        this.clearInputError();
        this.updateButtonStates();
    }

    setProcessing(processing) {
        this.isProcessing = processing;
        this.updateButtonStates();
        
        Object.values(this.elements).forEach(element => {
            if (element && element.tagName === 'BUTTON') {
                element.classList.toggle('loading', processing);
            }
        });

        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.toggle('show', processing);
        }
    }

    updateButtonStates() {
        if (!this.elements.nodeValue) return;
        
        const hasValidInput = this.isValidInput(this.elements.nodeValue.value);
        
        if (this.elements.insertBtn) {
            this.elements.insertBtn.disabled = !hasValidInput || this.isProcessing;
        }
        if (this.elements.deleteBtn) {
            this.elements.deleteBtn.disabled = !hasValidInput || this.isProcessing;
        }
        if (this.elements.searchBtn) {
            this.elements.searchBtn.disabled = !hasValidInput || this.isProcessing;
        }
        if (this.elements.randomBtn) {
            this.elements.randomBtn.disabled = this.isProcessing;
        }
        if (this.elements.clearBtn) {
            this.elements.clearBtn.disabled = this.isProcessing;
        }
    }

    // Callback system
    onInsert(callback) { this.callbacks.insert = callback; }
    onDelete(callback) { this.callbacks.delete = callback; }
    onSearch(callback) { this.callbacks.search = callback; }
    onRandom(callback) { this.callbacks.random = callback; }
    onClear(callback) { this.callbacks.clear = callback; }
    onExport(callback) { this.callbacks.export = callback; }

    async executeCallback(action, ...args) {
        if (this.callbacks[action]) {
            return await this.callbacks[action](...args);
        }
    }

    handleError(operation, error) {
        console.error(`${operation}:`, error);
        const message = error.message || 'An unexpected error occurred';
        this.showMessage(`${operation}: ${message}`, 'error');
    }

    showMessage(text, type = 'info') {
        document.dispatchEvent(new CustomEvent('showMessage', {
            detail: { text, type }
        }));
    }

    focusInput() {
        if (this.elements.nodeValue) {
            this.elements.nodeValue.focus();
            this.elements.nodeValue.select();
        }
    }

    setInputValue(value) {
        if (this.elements.nodeValue) {
            this.elements.nodeValue.value = value;
            this.validateInput(this.elements.nodeValue);
        }
    }
}

window.ControlPanel = ControlPanel;
