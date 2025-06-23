class TreeAPI {
    constructor(client) {
        this.client = client;
    }

    // Get current tree state
    async getTree() {
        return this.client.get('/tree');
    }

    // Insert a node
    async insertNode(value) {
        return this.client.post('/tree/insert', { value });
    }

    // Delete a node
    async deleteNode(value) {
        return this.client.delete('/tree/delete', { value });
    }

    // Search for a node
    async searchNode(value) {
        return this.client.get(`/tree/search/${value}`);
    }

    // Clear all nodes
    async clearTree() {
        return this.client.post('/tree/clear');
    }

    // Get tree statistics
    async getStats() {
        return this.client.get('/tree/stats');
    }

    // Validate tree properties
    async validateTree() {
        return this.client.get('/tree/validate');
    }

    // Insert random node
    async insertRandom() {
        return this.client.post('/tree/random');
    }

    // Batch operations (for future use)
    async batchInsert(values) {
        const results = [];
        for (const value of values) {
            try {
                const result = await this.insertNode(value);
                results.push({ value, success: true, result });
            } catch (error) {
                results.push({ value, success: false, error: error.message });
            }
        }
        return results;
    }

    // Export tree data
    async exportTree() {
        const treeData = await this.getTree();
        return {
            timestamp: new Date().toISOString(),
            tree: treeData.data.tree,
            stats: await this.getStats()
        };
    }
}

// Create global tree API instance
window.treeAPI = new TreeAPI(window.apiClient);
