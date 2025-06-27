class StatsPanel {
    constructor() {
        this.elements = {
            nodeCount: document.getElementById('nodeCount'),
            treeHeight: document.getElementById('treeHeight'),
            validTree: document.getElementById('validTree'),
            lastOperation: document.getElementById('lastOperation')
        };
        
        this.currentStats = {
            nodeCount: 0,
            height: 0,
            valid: true,
            lastOperation: '-'
        };
        
        this.performanceData = {
            operations: [],
            totalOperations: 0,
            averageDuration: 0
        };
        
        this.initialize();
    }

    initialize() {
        this.updateDisplay();
    }

    async updateStats(statsData) {
        try {
            this.currentStats = {
                nodeCount: statsData.nodeCount || 0,
                height: statsData.height || 0,
                valid: statsData.valid !== undefined ? statsData.valid : true,
                lastOperation: this.currentStats.lastOperation // Keep last operation
            };
            
            this.updateDisplay();
        } catch (error) {
            console.error('Failed to update stats:', error);
        }
    }

    updateDisplay() {
        if (this.elements.nodeCount) {
            this.elements.nodeCount.textContent = this.currentStats.nodeCount;
            this.animateStatUpdate(this.elements.nodeCount);
        }
        
        if (this.elements.treeHeight) {
            this.elements.treeHeight.textContent = this.currentStats.height;
            this.animateStatUpdate(this.elements.treeHeight);
        }
        
        if (this.elements.validTree) {
            this.elements.validTree.textContent = this.currentStats.valid ? '✓' : '✗';
            this.elements.validTree.style.color = this.currentStats.valid ? '#10b981' : '#ef4444';
            this.animateStatUpdate(this.elements.validTree);
        }
        
        if (this.elements.lastOperation) {
            this.elements.lastOperation.textContent = this.currentStats.lastOperation;
            this.animateStatUpdate(this.elements.lastOperation);
        }
    }

    animateStatUpdate(element) {
        if (element) {
            element.style.transform = 'scale(1.1)';
            element.style.transition = 'transform 0.2s ease';
            
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 200);
        }
    }

    // FIXED: Track operations properly
    trackOperation(operation, duration, success) {
        const operationData = {
            type: operation,
            duration: Math.round(duration),
            success: success,
            timestamp: new Date().toISOString()
        };
        
        this.performanceData.operations.push(operationData);
        this.performanceData.totalOperations++;
        
        // Calculate average duration
        const totalDuration = this.performanceData.operations.reduce((sum, op) => sum + op.duration, 0);
        this.performanceData.averageDuration = Math.round(totalDuration / this.performanceData.operations.length);
        
        // Update last operation display
        this.currentStats.lastOperation = `${operation.toUpperCase()} (${operationData.duration}ms)`;
        
        // Update display
        this.updateDisplay();
        
        // Keep only last 100 operations for performance
        if (this.performanceData.operations.length > 100) {
            this.performanceData.operations = this.performanceData.operations.slice(-100);
        }
    }

    getPerformanceReport() {
        return {
            totalOperations: this.performanceData.totalOperations,
            averageDuration: this.performanceData.averageDuration,
            recentOperations: this.performanceData.operations.slice(-10),
            successRate: this.calculateSuccessRate()
        };
    }

    calculateSuccessRate() {
        if (this.performanceData.operations.length === 0) return 100;
        
        const successCount = this.performanceData.operations.filter(op => op.success).length;
        return Math.round((successCount / this.performanceData.operations.length) * 100);
    }

    startPerformanceTracking() {
        console.log('Performance tracking started');
        this.trackOperation('init', 0, true);
    }

    reset() {
        this.currentStats = {
            nodeCount: 0,
            height: 0,
            valid: true,
            lastOperation: '-'
        };
        
        this.performanceData = {
            operations: [],
            totalOperations: 0,
            averageDuration: 0
        };
        
        this.updateDisplay();
    }
}

window.StatsPanel = StatsPanel;
