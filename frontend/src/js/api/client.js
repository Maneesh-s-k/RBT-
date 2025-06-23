class APIClient {
    constructor(baseURL = 'http://localhost:8080/api') {
        this.baseURL = baseURL;
        this.isConnected = false;
        this.connectionListeners = [];
    }

    // Connection status management
    addConnectionListener(callback) {
        this.connectionListeners.push(callback);
    }

    notifyConnectionStatus(status) {
        this.isConnected = status;
        this.connectionListeners.forEach(callback => callback(status));
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Update connection status on successful request
            if (!this.isConnected) {
                this.notifyConnectionStatus(true);
            }

            return data;
        } catch (error) {
            // Update connection status on error
            if (this.isConnected) {
                this.notifyConnectionStatus(false);
            }
            
            console.error('API Request failed:', error);
            throw new Error(`API Error: ${error.message}`);
        }
    }

    // GET request
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    // POST request
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // DELETE request
    async delete(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'DELETE',
            body: JSON.stringify(data)
        });
    }

    // Health check
    async checkHealth() {
        try {
            const response = await this.get('/health');
            this.notifyConnectionStatus(true);
            return response;
        } catch (error) {
            this.notifyConnectionStatus(false);
            throw error;
        }
    }

    // Connection test with retry
    async testConnection(maxRetries = 3, delay = 1000) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                await this.checkHealth();
                return true;
            } catch (error) {
                if (i === maxRetries - 1) {
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        return false;
    }
}

// Create global API client instance
window.apiClient = new APIClient();
