class RBTreeApp {
    constructor() {
        this.isInitialized = false;
        this.messageTimeout = null;
        
        // Initialize components
        this.initializeComponents();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize the application
        this.initialize();
    }

    initializeComponents() {
        // Initialize tree visualizer
        const svgElement = document.getElementById('treeSvg');
        this.visualizer = new TreeVisualizer(svgElement);
        
        // Initialize control panel
        this.controlPanel = new ControlPanel();
        
        // Initialize stats panel
        this.statsPanel = new StatsPanel();
        
        // Setup control panel callbacks
        this.setupControlPanelCallbacks();
    }

    setupControlPanelCallbacks() {
        this.controlPanel.onInsert(async (value) => {
            return await this.insertNode(value);
        });

        this.controlPanel.onDelete(async (value) => {
            return await this.deleteNode(value);
        });

        this.controlPanel.onSearch(async (value) => {
            return await this.searchNode(value);
        });

        this.controlPanel.onRandom(async () => {
            return await this.insertRandom();
        });

        this.controlPanel.onClear(async () => {
            return await this.clearTree();
        });

        this.controlPanel.onValidate(async () => {
            return await this.validateTree();
        });

        this.controlPanel.onCenter(() => {
            this.visualizer.centerView();
        });

        this.controlPanel.onExport(() => {
            this.exportData();
        });
    }

    setupEventListeners() {
        // Connection status updates
        window.apiClient.addConnectionListener((isConnected) => {
            this.updateConnectionStatus(isConnected);
        });

        // Custom events
        document.addEventListener('showMessage', (event) => {
            this.showMessage(event.detail.text, event.detail.type);
        });

        // Tree visualizer events
        const treeSvg = document.getElementById('treeSvg');
        treeSvg.addEventListener('nodeClick', (event) => {
            this.handleNodeClick(event.detail.node);
        });

        // Window events
        window.addEventListener('beforeunload', (event) => {
            if (this.statsPanel.currentStats.nodeCount > 0) {
                event.preventDefault();
                event.returnValue = 'You have unsaved tree data. Are you sure you want to leave?';
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            this.handleKeyboardShortcuts(event);
        });
    }

    async initialize() {
        try {
            this.showMessage('Initializing application...', 'info');
            
            // Test API connection
            await this.testConnection();
            
            // Load initial tree state
            await this.refreshTreeData();
            
            this.isInitialized = true;
            this.showMessage('Application ready!', 'success');
            
            // Start performance tracking
            this.statsPanel.startPerformanceTracking();
            
        } catch (error) {
            console.error('Initialization failed:', error);
            this.showMessage('Failed to connect to server. Please check if the backend is running.', 'error');
            this.updateConnectionStatus(false);
        }
    }

    async testConnection() {
        const maxRetries = 3;
        let retries = 0;
        
        while (retries < maxRetries) {
            try {
                await window.apiClient.checkHealth();
                return;
            } catch (error) {
                retries++;
                if (retries < maxRetries) {
                    this.showMessage(`Connection attempt ${retries} failed, retrying...`, 'warning');
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } else {
                    throw error;
                }
            }
        }
    }

    // Tree operations
    async insertNode(value) {
        const startTime = performance.now();
        
        try {
            this.showMessage(`Inserting node ${value}...`, 'info');
            
            const response = await window.treeAPI.insertNode(value);
            
            if (response.success) {
                await this.refreshTreeData();
                this.showMessage(`Node ${value} inserted successfully!`, 'success');
                
                // Track performance
                const duration = performance.now() - startTime;
                this.statsPanel.trackOperation('insert', duration, true);
                
                return response;
            } else {
                throw new Error(response.message);
            }
            
        } catch (error) {
            const duration = performance.now() - startTime;
            this.statsPanel.trackOperation('insert', duration, false);
            
            this.showMessage(`Failed to insert node ${value}: ${error.message}`, 'error');
            throw error;
        }
    }

    async deleteNode(value) {
        const startTime = performance.now();
        
        try {
            this.showMessage(`Deleting node ${value}...`, 'info');
            
            const response = await window.treeAPI.deleteNode(value);
            
            if (response.success) {
                await this.refreshTreeData();
                this.showMessage(`Node ${value} deleted successfully!`, 'success');
                
                const duration = performance.now() - startTime;
                this.statsPanel.trackOperation('delete', duration, true);
                
                return response;
            } else {
                throw new Error(response.message);
            }
            
        } catch (error) {
            const duration = performance.now() - startTime;
            this.statsPanel.trackOperation('delete', duration, false);
            
            this.showMessage(`Failed to delete node ${value}: ${error.message}`, 'error');
            throw error;
        }
    }

    async searchNode(value) {
        const startTime = performance.now();
        
        try {
            this.showMessage(`Searching for node ${value}...`, 'info');
            
            const response = await window.treeAPI.searchNode(value);
            
            if (response.success) {
                const found = response.data.found;
                
                if (found) {
                    // Animate the search
                    await this.visualizer.animateSearch(value);
                    this.showMessage(`Node ${value} found!`, 'success');
                } else {
                    this.showMessage(`Node ${value} not found.`, 'warning');
                }
                
                const duration = performance.now() - startTime;
                this.statsPanel.trackOperation('search', duration, true);
                
                return response;
            } else {
                throw new Error(response.message);
            }
            
        } catch (error) {
            const duration = performance.now() - startTime;
            this.statsPanel.trackOperation('search', duration, false);
            
            this.showMessage(`Search failed: ${error.message}`, 'error');
            throw error;
        }
    }

    async insertRandom() {
        const startTime = performance.now();
        
        try {
            this.showMessage('Inserting random node...', 'info');
            
            const response = await window.treeAPI.insertRandom();
            
            if (response.success) {
                await this.refreshTreeData();
                const value = response.data.value;
                this.showMessage(`Random node ${value} inserted!`, 'success');
                
                const duration = performance.now() - startTime;
                this.statsPanel.trackOperation('random', duration, true);
                
                return response;
            } else {
                throw new Error(response.message);
            }
            
        } catch (error) {
            const duration = performance.now() - startTime;
            this.statsPanel.trackOperation('random', duration, false);
            
            this.showMessage(`Random insert failed: ${error.message}`, 'error');
            throw error;
        }
    }

    async clearTree() {
        const startTime = performance.now();
        
        try {
            this.showMessage('Clearing tree...', 'info');
            
            const response = await window.treeAPI.clearTree();
            
            if (response.success) {
                await this.refreshTreeData();
                this.showMessage('Tree cleared successfully!', 'success');
                
                const duration = performance.now() - startTime;
                this.statsPanel.trackOperation('clear', duration, true);
                
                return response;
            } else {
                throw new Error(response.message);
            }
            
        } catch (error) {
            const duration = performance.now() - startTime;
            this.statsPanel.trackOperation('clear', duration, false);
            
            this.showMessage(`Clear failed: ${error.message}`, 'error');
            throw error;
        }
    }

    async validateTree() {
        const startTime = performance.now();
        
        try {
            this.showMessage('Validating tree properties...', 'info');
            
            const response = await window.treeAPI.validateTree();
            
            if (response.success) {
                const isValid = response.data.valid;
                
                // Animate validation result
                await this.visualizer.animateValidation(isValid);
                
                if (isValid) {
                    this.showMessage('Tree is valid! All Red-Black properties are satisfied.', 'success');
                } else {
                    this.showMessage('Tree validation failed! Red-Black properties are violated.', 'error');
                }
                
                const duration = performance.now() - startTime;
                this.statsPanel.trackOperation('validate', duration, true);
                
                return response;
            } else {
                throw new Error(response.message);
            }
            
        } catch (error) {
            const duration = performance.now() - startTime;
            this.statsPanel.trackOperation('validate', duration, false);
            
            this.showMessage(`Validation failed: ${error.message}`, 'error');
            throw error;
        }
    }

    // Data management
    async refreshTreeData() {
        try {
            // Get tree data and stats in parallel
            const [treeResponse, statsResponse] = await Promise.all([
                window.treeAPI.getTree(),
                window.treeAPI.getStats()
            ]);
            
            if (treeResponse.success && statsResponse.success) {
                // Update visualizer
                await this.visualizer.draw(treeResponse.data);
                
                // Update stats panel
                await this.statsPanel.updateStats(statsResponse.data);
                
                return { tree: treeResponse.data, stats: statsResponse.data };
            } else {
                throw new Error('Failed to fetch tree data');
            }
            
        } catch (error) {
            console.error('Failed to refresh tree data:', error);
            throw error;
        }
    }

    // UI management
    updateConnectionStatus(isConnected) {
        const statusElement = document.getElementById('connectionStatus');
        const indicator = statusElement.querySelector('.status-indicator');
        const text = statusElement.querySelector('.status-text');
        
        if (isConnected) {
            indicator.classList.remove('error');
            indicator.classList.add('connected');
            text.textContent = 'Connected';
        } else {
            indicator.classList.remove('connected');
            indicator.classList.add('error');
            text.textContent = 'Disconnected';
        }
    }

    showMessage(text, type = 'info', duration = 5000) {
        const container = document.getElementById('messageContainer');
        
        // Clear existing message
        if (this.messageTimeout) {
            clearTimeout(this.messageTimeout);
        }
        
        // Create new message
        const message = document.createElement('div');
        message.className = `message ${type} slide-in`;
        message.textContent = text;
        
        // Clear container and add new message
        container.innerHTML = '';
        container.appendChild(message);
        
        // Auto-hide message
        if (duration > 0) {
            this.messageTimeout = setTimeout(() => {
                message.classList.add('slide-out');
                setTimeout(() => {
                    if (container.contains(message)) {
                        container.removeChild(message);
                    }
                }, 300);
            }, duration);
        }
    }

    handleNodeClick(node) {
        // Show node details
        this.showMessage(`Node ${node.data} (${node.color})`, 'info', 3000);
        
        // You could also show a detailed popup here
        console.log('Node clicked:', node);
    }

    handleKeyboardShortcuts(event) {
        // Global shortcuts (only when not typing in input)
        if (event.target.tagName === 'INPUT') return;
        
        switch(event.key) {
            case '?':
                this.showHelpDialog();
                break;
            case 'h':
            case 'H':
                this.showHelpDialog();
                break;
            case 'p':
            case 'P':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    this.showPerformanceReport();
                }
                break;
        }
    }

    // Export functionality
    async exportData() {
        try {
            const exportData = await window.treeAPI.exportTree();
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `rbtree-export-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            URL.revokeObjectURL(url);
            
            this.showMessage('Tree data exported successfully!', 'success');
            
        } catch (error) {
            this.showMessage(`Export failed: ${error.message}`, 'error');
        }
    }

    // Help and documentation
    showHelpDialog() {
        const helpContent = `
        <h3>Keyboard Shortcuts</h3>
        <ul>
            <li><strong>I</strong> - Focus input field</li>
            <li><strong>R</strong> - Insert random node</li>
            <li><strong>C</strong> - Clear tree</li>
            <li><strong>V</strong> - Validate tree</li>
            <li><strong>H or ?</strong> - Show this help</li>
            <li><strong>Ctrl+P</strong> - Show performance report</li>
            <li><strong>Enter</strong> - Insert node (when input focused)</li>
            <li><strong>Escape</strong> - Unfocus input</li>
        </ul>
        
        <h3>Tree Operations</h3>
        <ul>
            <li><strong>Insert</strong> - Add a new node to the tree</li>
            <li><strong>Delete</strong> - Remove a node from the tree</li>
            <li><strong>Search</strong> - Find and highlight a node</li>
            <li><strong>Clear</strong> - Remove all nodes</li>
            <li><strong>Validate</strong> - Check Red-Black properties</li>
        </ul>
        `;
        
        // Create modal (simplified version)
        const modal = document.createElement('div');
        modal.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center;">
                <div style="background: white; padding: 2rem; border-radius: 8px; max-width: 500px; max-height: 80vh; overflow-y: auto;">
                    ${helpContent}
                    <button onclick="this.closest('div').parentElement.remove()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    showPerformanceReport() {
        const report = this.statsPanel.getPerformanceReport();
        if (report) {
            console.log('Performance Report:', report);
            this.showMessage(`Performance: ${report.totalOperations} ops, ${report.averageDuration} avg`, 'info');
        }
    }

    // Demo functionality
    async runDemo() {
        const demoValues = [50, 25, 75, 10, 30, 60, 80, 5, 15, 27, 35, 65, 85];
        
        this.showMessage('Starting demo...', 'info');
        
        for (const value of demoValues) {
            this.controlPanel.setInputValue(value);
            await this.insertNode(value);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        this.showMessage('Demo completed!', 'success');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.rbTreeApp = new RBTreeApp();
});

// Add global demo function for easy access
window.runDemo = () => {
    if (window.rbTreeApp) {
        window.rbTreeApp.runDemo();
    }
};
