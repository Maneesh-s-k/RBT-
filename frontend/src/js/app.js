class RBTreeApp {
    constructor() {
        this.isInitialized = false;
        this.messageTimeout = null;
        
        this.initializeComponents();
        this.setupEventListeners();
        this.initialize();
    }

    initializeComponents() {
        const svgElement = document.getElementById('treeSvg');
        this.visualizer = new TreeVisualizer(svgElement);
        this.controlPanel = new ControlPanel();
        this.statsPanel = new StatsPanel();
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

        this.controlPanel.onExport(() => {
            this.exportData();
        });
    }

    setupEventListeners() {
        // FIXED: Check if apiClient exists before adding listener
        if (window.apiClient) {
            window.apiClient.addConnectionListener((isConnected) => {
                this.updateConnectionStatus(isConnected);
            });
        }

        document.addEventListener('showMessage', (event) => {
            this.showMessage(event.detail.text, event.detail.type);
        });

        const treeSvg = document.getElementById('treeSvg');
        if (treeSvg) {
            treeSvg.addEventListener('nodeClick', (event) => {
                this.handleNodeClick(event.detail.node);
            });
        }

        window.addEventListener('beforeunload', (event) => {
            if (this.statsPanel && this.statsPanel.currentStats && this.statsPanel.currentStats.nodeCount > 0) {
                event.preventDefault();
                event.returnValue = 'You have unsaved tree data. Are you sure you want to leave?';
            }
        });

        document.addEventListener('keydown', (event) => {
            this.handleKeyboardShortcuts(event);
        });
    }

    async initialize() {
        try {
            this.showMessage('Initializing application...', 'info');
            
            await this.testConnection();
            
            // FIXED: No random insertions on startup
            
            await this.refreshTreeData();
            
            this.isInitialized = true;
            this.showMessage('Application ready!', 'success');
            
            if (this.statsPanel && this.statsPanel.startPerformanceTracking) {
                this.statsPanel.startPerformanceTracking();
            }
            
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
                this.updateConnectionStatus(true);
                return;
            } catch (error) {
                retries++;
                if (retries < maxRetries) {
                    this.showMessage(`Connection attempt ${retries} failed, retrying...`, 'warning');
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } else {
                    this.updateConnectionStatus(false);
                    throw error;
                }
            }
        }
    }

    async insertNode(value) {
        const startTime = performance.now();
        
        try {
            this.showMessage(`Inserting node ${value}...`, 'info');
            
            const response = await window.treeAPI.insertNode(value);
            
            if (response.success) {
                // Handle duplicate node case
                if (response.data && response.data.existed) {
                    this.showMessage(`Node ${value} already exists in the tree!`, 'warning');
                } else {
                    this.showMessage(`Node ${value} inserted successfully!`, 'success');
                }
                
                // Refresh visualization
                await this.refreshTreeData();
                
                const duration = performance.now() - startTime;
                if (this.statsPanel && this.statsPanel.trackOperation) {
                    this.statsPanel.trackOperation('insert', duration, true);
                }
                
                return response;
            } else {
                throw new Error(response.message);
            }
            
        } catch (error) {
            const duration = performance.now() - startTime;
            if (this.statsPanel && this.statsPanel.trackOperation) {
                this.statsPanel.trackOperation('insert', duration, false);
            }
            
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
                if (this.statsPanel && this.statsPanel.trackOperation) {
                    this.statsPanel.trackOperation('delete', duration, true);
                }
                
                return response;
            } else {
                throw new Error(response.message);
            }
            
        } catch (error) {
            const duration = performance.now() - startTime;
            if (this.statsPanel && this.statsPanel.trackOperation) {
                this.statsPanel.trackOperation('delete', duration, false);
            }
            
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
                    await this.visualizer.animateSearch(value);
                    this.showMessage(`Node ${value} found!`, 'success');
                } else {
                    this.showMessage(`Node ${value} not found.`, 'warning');
                }
                
                const duration = performance.now() - startTime;
                if (this.statsPanel && this.statsPanel.trackOperation) {
                    this.statsPanel.trackOperation('search', duration, true);
                }
                
                return response;
            } else {
                throw new Error(response.message);
            }
            
        } catch (error) {
            const duration = performance.now() - startTime;
            if (this.statsPanel && this.statsPanel.trackOperation) {
                this.statsPanel.trackOperation('search', duration, false);
            }
            
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
                const value = response.data.value;
                
                // FIXED: Don't retry on duplicates - just show message
                if (response.data && response.data.existed) {
                    this.showMessage(`Random node ${value} already exists!`, 'warning');
                } else {
                    this.showMessage(`Random node ${value} inserted!`, 'success');
                }
                
                await this.refreshTreeData();
                
                const duration = performance.now() - startTime;
                if (this.statsPanel && this.statsPanel.trackOperation) {
                    this.statsPanel.trackOperation('random', duration, true);
                }
                
                return response;
            } else {
                throw new Error(response.message);
            }
            
        } catch (error) {
            const duration = performance.now() - startTime;
            if (this.statsPanel && this.statsPanel.trackOperation) {
                this.statsPanel.trackOperation('random', duration, false);
            }
            
            this.showMessage(`Random insert failed: ${error.message}`, 'error');
            throw error;
        }
    }

    async clearTree() {
        const startTime = performance.now();
        
        try {
            if (!confirm('Are you sure you want to clear all nodes? This action cannot be undone.')) {
                return;
            }
            
            this.showMessage('Clearing tree...', 'info');
            
            const response = await window.treeAPI.clearTree();
            
            if (response.success) {
                await this.refreshTreeData();
                this.showMessage('Tree cleared successfully!', 'success');
                
                const duration = performance.now() - startTime;
                if (this.statsPanel && this.statsPanel.trackOperation) {
                    this.statsPanel.trackOperation('clear', duration, true);
                }
                
                return response;
            } else {
                throw new Error(response.message);
            }
            
        } catch (error) {
            const duration = performance.now() - startTime;
            if (this.statsPanel && this.statsPanel.trackOperation) {
                this.statsPanel.trackOperation('clear', duration, false);
            }
            
            this.showMessage(`Clear failed: ${error.message}`, 'error');
            throw error;
        }
    }

    async refreshTreeData() {
        try {
            const [treeResponse, statsResponse] = await Promise.all([
                window.treeAPI.getTree(),
                window.treeAPI.getStats()
            ]);
            
            console.log('Tree response:', treeResponse);
            console.log('Stats response:', statsResponse);
            
            if (treeResponse.success && statsResponse.success) {
                await this.visualizer.draw(treeResponse.data);
                
                if (this.statsPanel && this.statsPanel.updateStats) {
                    await this.statsPanel.updateStats(statsResponse.data);
                }
                
                return { tree: treeResponse.data, stats: statsResponse.data };
            } else {
                throw new Error('Failed to fetch tree data');
            }
            
        } catch (error) {
            console.error('Failed to refresh tree data:', error);
            throw error;
        }
    }

    updateConnectionStatus(isConnected) {
        const statusElement = document.getElementById('connectionStatus');
        if (!statusElement) return;
        
        const indicator = statusElement.querySelector('.status-indicator');
        const text = statusElement.querySelector('.status-text');
        
        if (indicator && text) {
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
    }

    showMessage(text, type = 'info', duration = 5000) {
        const container = document.getElementById('messageContainer');
        if (!container) return;
        
        if (this.messageTimeout) {
            clearTimeout(this.messageTimeout);
        }
        
        const message = document.createElement('div');
        message.className = `message ${type} slide-in`;
        message.textContent = text;
        
        container.innerHTML = '';
        container.appendChild(message);
        
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
        this.showMessage(`Node ${node.data} (${node.color})`, 'info', 3000);
        console.log('Node clicked:', node);
    }

    handleKeyboardShortcuts(event) {
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

    async exportData() {
        try {
            const treeData = await window.treeAPI.getTree();
            const statsData = await window.treeAPI.getStats();
            
            const exportData = {
                timestamp: new Date().toISOString(),
                tree: treeData.data,
                stats: statsData.data
            };
            
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

    showHelpDialog() {
        const helpContent = `
        <h3>Keyboard Shortcuts</h3>
        <ul>
            <li><strong>I</strong> - Focus input field</li>
            <li><strong>R</strong> - Insert random node</li>
            <li><strong>C</strong> - Clear tree</li>
            <li><strong>H or ?</strong> - Show this help</li>
            <li><strong>Ctrl+P</strong> - Show performance report</li>
            <li><strong>Enter</strong> - Insert node (when input focused)</li>
            <li><strong>Escape</strong> - Unfocus input</li>
        </ul>
        `;
        
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
        if (this.statsPanel && this.statsPanel.getPerformanceReport) {
            const report = this.statsPanel.getPerformanceReport();
            if (report) {
                console.log('Performance Report:', report);
                this.showMessage(`Performance: ${report.totalOperations} ops, ${report.averageDuration}ms avg`, 'info');
            }
        }
    }

    async runDemo() {
        const demoValues = [50, 25, 75, 10, 30, 60, 80, 5, 15, 27, 35, 65, 85];
        
        this.showMessage('Starting demo...', 'info');
        
        for (const value of demoValues) {
            if (this.controlPanel && this.controlPanel.setInputValue) {
                this.controlPanel.setInputValue(value);
            }
            await this.insertNode(value);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        this.showMessage('Demo completed!', 'success');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.rbTreeApp = new RBTreeApp();
});

window.runDemo = () => {
    if (window.rbTreeApp) {
        window.rbTreeApp.runDemo();
    }
};
