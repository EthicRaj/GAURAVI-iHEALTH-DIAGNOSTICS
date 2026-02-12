// ============================================
// BLOODLAB SHARED CONFIG - API Connection
// ============================================
// Use this in both admin.html and app.js

// Auto-detect backend URL for desktop and mobile
function getBackendURL() {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // If running on localhost, use port 5000
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return `${protocol}//localhost:5000/api`;
    }
    
    // If running on network IP (for mobile access)
    // Use same host but port 5000
    return `${protocol}//${hostname}:5000/api`;
}

if (typeof API_CONFIG === 'undefined') {
    var API_CONFIG = {
        // Backend API URL - Auto-detect for mobile/desktop compatibility
        BASE_URL: getBackendURL(),
        
        // Endpoints
        ENDPOINTS: {
            users: '/users',
            bookings: '/bookings',
            tests: '/tests',
            analytics: '/analytics'
        },
        
        // Request timeout (ms)
        TIMEOUT: 5000,
        
        // Enable/disable API
        USE_API: true,
        
        // Fallback to localStorage if API fails
        FALLBACK_TO_LOCAL_STORAGE: true
    };
}

// API Helper Functions
const APIClient = {
    /**
     * Make GET request
     */
    async get(endpoint) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API GET Error:', error);
            throw error;
        }
    },
    
    /**
     * Make POST request
     */
    async post(endpoint, data) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API POST Error:', error);
            throw error;
        }
    },
    
    /**
     * Make PUT request
     */
    async put(endpoint, data) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API PUT Error:', error);
            throw error;
        }
    },
    
    /**
     * Make DELETE request
     */
    async delete(endpoint) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API DELETE Error:', error);
            throw error;
        }
    },
    
    /**
     * Get all users
     */
    async getUsers() {
        return this.get(API_CONFIG.ENDPOINTS.users);
    },
    
    /**
     * Create new user
     */
    async createUser(userData) {
        return this.post(API_CONFIG.ENDPOINTS.users, userData);
    },
    
    /**
     * Update user
     */
    async updateUser(userId, userData) {
        return this.put(`${API_CONFIG.ENDPOINTS.users}/${userId}`, userData);
    },
    
    /**
     * Delete user
     */
    async deleteUser(userId) {
        return this.delete(`${API_CONFIG.ENDPOINTS.users}/${userId}`);
    },
    
    /**
     * Get all bookings
     */
    async getBookings() {
        return this.get(API_CONFIG.ENDPOINTS.bookings);
    },
    
    /**
     * Get user's bookings
     */
    async getUserBookings(userId) {
        return this.get(`${API_CONFIG.ENDPOINTS.bookings}/user/${userId}`);
    },
    
    /**
     * Create new booking
     */
    async createBooking(bookingData) {
        return this.post(API_CONFIG.ENDPOINTS.bookings, bookingData);
    },
    
    /**
     * Update booking
     */
    async updateBooking(bookingId, bookingData) {
        return this.put(`${API_CONFIG.ENDPOINTS.bookings}/${bookingId}`, bookingData);
    },
    
    /**
     * Delete booking
     */
    async deleteBooking(bookingId) {
        return this.delete(`${API_CONFIG.ENDPOINTS.bookings}/${bookingId}`);
    },
    
    /**
     * Get all tests
     */
    async getTests() {
        return this.get(API_CONFIG.ENDPOINTS.tests);
    },
    
    /**
     * Create new test
     */
    async createTest(testData) {
        return this.post(API_CONFIG.ENDPOINTS.tests, testData);
    },
    
    /**
     * Update test
     */
    async updateTest(testId, testData) {
        return this.put(`${API_CONFIG.ENDPOINTS.tests}/${testId}`, testData);
    },
    
    /**
     * Delete test
     */
    async deleteTest(testId) {
        return this.delete(`${API_CONFIG.ENDPOINTS.tests}/${testId}`);
    },
    
    /**
     * Get analytics stats
     */
    async getStats() {
        return this.get(`${API_CONFIG.ENDPOINTS.analytics}/stats`);
    },
    
    /**
     * Check if API is available
     */
    async isAvailable() {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL.replace('/api', '')}/health`, {
                method: 'GET'
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_CONFIG, APIClient };
}
