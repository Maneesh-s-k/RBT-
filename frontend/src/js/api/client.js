class APIClient {
    constructor(baseURL = null) {
        this.baseURL = baseURL || this.getAPIBaseURL();
        this.isConnected = false;
        this.connectionListeners = [];
    }

    // Get API base URL from environment or auto-detect
    getAPIBaseURL() {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
        // For vanilla JavaScript in browser, check for global config
        if (window.ENV && window.ENV.API_BASE_URL) {
            return window.ENV.API_BASE_URL;
        }
        
        // Environment detection fallback
        const isProduction = window.location.hostname !== 'localhost' && 
                            window.location.hostname !== '127.0.0.1';
        
        return isProduction 
            ? 'https://rbtvisualization.onrender.com/api'  // FIXED: Use your actual URL
            : 'http://localhost:8080/api';
    }
    
    // Node.js environment (if using bundlers)
    return process.env.API_BASE_URL || 
           (process.env.NODE_ENV === 'production' 
               ? 'https://rbtvisualization.onrender.com/api'  // FIXED: Use your actual URL
               : 'http://localhost:8080/api');
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

// Create global API client instance with auto-detected URL
window.apiClient = new APIClient();

// Log the detected API URL for debugging
console.log('API Client initialized with base URL:', window.apiClient.baseURL);
