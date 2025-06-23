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
        
        this.animationQueue = [];
        this.isAnimating = false;
        
        this.setupTooltips();
    }

    setupTooltips() {
        // Add tooltips for better UX
        const tooltips = {
            nodeCount: 'Total number of nodes in the tree',
            treeHeight: 'Maximum depth from root to leaf',
            validTree: 'Whether the tree maintains Red-Black properties',
            lastOperation: 'Most recent operation performed'
        };

        Object.entries(tooltips).forEach(([id, tooltip]) => {
            const element = this.elements[id]?.parentElement;
            if (element) {
                element.title = tooltip;
                element.style.cursor = 'help';
            }
        });
    }

    async updateStats(newStats, operation = null) {
        // Queue the update if currently animating
        if (this.isAnimating) {
            this.animationQueue.push({ newStats, operation });
            return;
        }

        this.isAnimating = true;

        try {
            // Update last operation first
            if (operation) {
                await this.updateLastOperation(operation);
            }

            // Update each stat with animation
            await Promise.all([
                this.updateNodeCount(newStats.nodeCount),
                this.updateTreeHeight(newStats.height),
                this.updateValidTree(newStats.valid)
            ]);

            this.currentStats = { ...newStats, lastOperation: operation || this.currentStats.lastOperation };

        } finally {
            this.isAnimating = false;
            
            // Process next item in queue
            if (this.animationQueue.length > 0) {
                const next = this.animationQueue.shift();
                setTimeout(() => this.updateStats(next.newStats, next.operation), 100);
            }
        }
    }

    async updateNodeCount(newCount) {
        if (this.currentStats.nodeCount === newCount) return;

        const element = this.elements.nodeCount;
        const card = element.parentElement;
        
        // Add updating animation
        card.classList.add('updating');
        
        try {
            if (newCount > this.currentStats.nodeCount) {
                // Count up animation
                await AnimationUtils.countUp(element, this.currentStats.nodeCount, newCount, 600);
            } else {
                // Count down animation
                await AnimationUtils.countUp(element, this.currentStats.nodeCount, newCount, 400);
            }
            
            // Color feedback
            if (newCount > this.currentStats.nodeCount) {
                this.flashColor(element, '#10b981'); // Green for increase
            } else if (newCount < this.currentStats.nodeCount) {
                this.flashColor(element, '#f59e0b'); // Orange for decrease
            }
            
        } finally {
            card.classList.remove('updating');
        }
    }

    async updateTreeHeight(newHeight) {
        if (this.currentStats.height === newHeight) return;

        const element = this.elements.treeHeight;
        const card = element.parentElement;
        
        card.classList.add('updating');
        
        try {
            await AnimationUtils.countUp(element, this.currentStats.height, newHeight, 500);
            
            // Color feedback based on height efficiency
            if (newHeight > this.currentStats.height) {
                this.flashColor(element, '#f59e0b'); // Orange for height increase
            } else {
                this.flashColor(element, '#10b981'); // Green for height decrease
            }
            
        } finally {
            card.classList.remove('updating');
        }
    }

    async updateValidTree(isValid) {
        if (this.currentStats.valid === isValid) return;

        const element = this.elements.validTree;
        const card = element.parentElement;
        
        card.classList.add('updating');
        
        try {
            // Update icon and color
            if (isValid) {
                element.textContent = '✓';
                element.style.color = '#10b981';
                this.flashColor(element, '#10b981');
            } else {
                element.textContent = '✗';
                element.style.color = '#ef4444';
                this.flashColor(element, '#ef4444');
                
                // Shake animation for invalid state
                await AnimationUtils.shake(card, 3, 300);
            }
            
        } finally {
            card.classList.remove('updating');
        }
    }

    async updateLastOperation(operation) {
        const element = this.elements.lastOperation;
        const card = element.parentElement;
        
        // Slide out old text
        await AnimationUtils.fadeOut(element, 150);
        
        // Update text
        element.textContent = this.formatOperation(operation);
        
        // Slide in new text
        await AnimationUtils.fadeIn(element, 150);
        
        // Flash the card
        card.classList.add('updating');
        setTimeout(() => card.classList.remove('updating'), 500);
    }

    formatOperation(operation) {
        if (!operation) return '-';
        
        const operationMap = {
            insert: '➕ Insert',
            delete: '➖ Delete',
            search: '🔍 Search',
            clear: '🗑️ Clear',
            validate: '✅ Validate',
            random: '🎲 Random'
        };
        
        return operationMap[operation.toLowerCase()] || operation;
    }

    async flashColor(element, color, duration = 500) {
        const originalColor = element.style.color;
        
        element.style.transition = `color ${duration / 2}ms ease`;
        element.style.color = color;
        
        setTimeout(() => {
            element.style.color = originalColor;
            setTimeout(() => {
                element.style.transition = '';
            }, duration / 2);
        }, duration / 2);
    }

    // Utility methods
    getStats() {
        return { ...this.currentStats };
    }

    reset() {
        this.updateStats({
            nodeCount: 0,
            height: 0,
            valid: true
        }, 'clear');
    }

    // Advanced stats display
    showDetailedStats(stats) {
        // Create a modal or expanded view with more detailed statistics
        const details = {
            'Nodes': stats.nodeCount,
            'Height': stats.height,
            'Valid RB Tree': stats.valid ? 'Yes' : 'No',
            'Theoretical Min Height': Math.floor(Math.log2(stats.nodeCount + 1)),
            'Theoretical Max Height': 2 * Math.floor(Math.log2(stats.nodeCount + 1)) + 1,
            'Height Efficiency': this.calculateHeightEfficiency(stats.nodeCount, stats.height)
        };

        console.table(details);
        return details;
    }

    calculateHeightEfficiency(nodeCount, actualHeight) {
        if (nodeCount === 0) return '100%';
        
        const minHeight = Math.floor(Math.log2(nodeCount + 1));
        const maxHeight = 2 * Math.floor(Math.log2(nodeCount + 1)) + 1;
        
        const efficiency = ((maxHeight - actualHeight) / (maxHeight - minHeight)) * 100;
        return `${Math.max(0, Math.min(100, efficiency)).toFixed(1)}%`;
    }

    // Export stats
    exportStats() {
        const timestamp = new Date().toISOString();
        const statsData = {
            timestamp,
            stats: this.currentStats,
            detailed: this.showDetailedStats(this.currentStats)
        };

        const blob = new Blob([JSON.stringify(statsData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `rbtree-stats-${timestamp.split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }

    // Performance tracking
    startPerformanceTracking() {
        this.performanceData = {
            operations: [],
            startTime: performance.now()
        };
    }

    trackOperation(operation, duration, success = true) {
        if (!this.performanceData) return;

        this.performanceData.operations.push({
            operation,
            duration,
            success,
            timestamp: performance.now() - this.performanceData.startTime
        });
    }

    getPerformanceReport() {
        if (!this.performanceData) return null;

        const operations = this.performanceData.operations;
        const totalOperations = operations.length;
        const successfulOperations = operations.filter(op => op.success).length;
        const averageDuration = operations.reduce((sum, op) => sum + op.duration, 0) / totalOperations;

        return {
            totalOperations,
            successfulOperations,
            successRate: `${((successfulOperations / totalOperations) * 100).toFixed(1)}%`,
            averageDuration: `${averageDuration.toFixed(2)}ms`,
            operations: operations
        };
    }
}

// Make available globally
window.StatsPanel = StatsPanel;
