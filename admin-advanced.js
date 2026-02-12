async function login(identifier, password) {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);

    // logged in — verify session
    const me = await fetch('/api/me');
    const meJson = await me.json().catch(() => ({}));
    console.log('Logged in user:', meJson);
    return meJson;
  } catch (err) {
    console.error('Login failed:', err.message || err);
    throw err;
  }
}

// Example usage:
login(emailOrPhone, password).catch(e => alert('Login error: ' + e.message));async function login(identifier, password) {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);

    // logged in — verify session
    const me = await fetch('/api/me');
    const meJson = await me.json().catch(() => ({}));
    console.log('Logged in user:', meJson);
    return meJson;
  } catch (err) {
    console.error('Login failed:', err.message || err);
    throw err;
  }
}

// Example usage:
login(emailOrPhone, password).catch(e => alert('Login error: ' + e.message));async function login(identifier, password) {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);

    // logged in — verify session
    const me = await fetch('/api/me');
    const meJson = await me.json().catch(() => ({}));
    console.log('Logged in user:', meJson);
    return meJson;
  } catch (err) {
    console.error('Login failed:', err.message || err);
    throw err;
  }
}

// Example usage:
login(emailOrPhone, password).catch(e => alert('Login error: ' + e.message));async function login(identifier, password) {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);

    // logged in — verify session
    const me = await fetch('/api/me');
    const meJson = await me.json().catch(() => ({}));
    console.log('Logged in user:', meJson);
    return meJson;
  } catch (err) {
    console.error('Login failed:', err.message || err);
    throw err;
  }
}

// Example usage:
login(emailOrPhone, password).catch(e => alert('Login error: ' + e.message));async function login(identifier, password) {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);

    // logged in — verify session
    const me = await fetch('/api/me');
    const meJson = await me.json().catch(() => ({}));
    console.log('Logged in user:', meJson);
    return meJson;
  } catch (err) {
    console.error('Login failed:', err.message || err);
    throw err;
  }
}

// Example usage:
login(emailOrPhone, password).catch(e => alert('Login error: ' + e.message));async function login(identifier, password) {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);

    // logged in — verify session
    const me = await fetch('/api/me');
    const meJson = await me.json().catch(() => ({}));
    console.log('Logged in user:', meJson);
    return meJson;
  } catch (err) {
    console.error('Login failed:', err.message || err);
    throw err;
  }
}

// Example usage:
login(emailOrPhone, password).catch(e => alert('Login error: ' + e.message));async function login(identifier, password) {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);

    // logged in — verify session
    const me = await fetch('/api/me');
    const meJson = await me.json().catch(() => ({}));
    console.log('Logged in user:', meJson);
    return meJson;
  } catch (err) {
    console.error('Login failed:', err.message || err);
    throw err;
  }
}

// Example usage:
login(emailOrPhone, password).catch(e => alert('Login error: ' + e.message));async function login(identifier, password) {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);

    // logged in — verify session
    const me = await fetch('/api/me');
    const meJson = await me.json().catch(() => ({}));
    console.log('Logged in user:', meJson);
    return meJson;
  } catch (err) {
    console.error('Login failed:', err.message || err);
    throw err;
  }
}

// Example usage:
login(emailOrPhone, password).catch(e => alert('Login error: ' + e.message));async function login(identifier, password) {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);

    // logged in — verify session
    const me = await fetch('/api/me');
    const meJson = await me.json().catch(() => ({}));
    console.log('Logged in user:', meJson);
    return meJson;
  } catch (err) {
    console.error('Login failed:', err.message || err);
    throw err;
  }
}

// Example usage:
login(emailOrPhone, password).catch(e => alert('Login error: ' + e.message));async function login(identifier, password) {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);

    // logged in — verify session
    const me = await fetch('/api/me');
    const meJson = await me.json().catch(() => ({}));
    console.log('Logged in user:', meJson);
    return meJson;
  } catch (err) {
    console.error('Login failed:', err.message || err);
    throw err;
  }
}

// Example usage:
login(emailOrPhone, password).catch(e => alert('Login error: ' + e.message));async function login(identifier, password) {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);

    // logged in — verify session
    const me = await fetch('/api/me');
    const meJson = await me.json().catch(() => ({}));
    console.log('Logged in user:', meJson);
    return meJson;
  } catch (err) {
    console.error('Login failed:', err.message || err);
    throw err;
  }
}

// Example usage:
login(emailOrPhone, password).catch(e => alert('Login error: ' + e.message));// ============================================
// BLOODLAB ADMIN - ADVANCED FEATURES CONFIG
// ============================================

// This file contains advanced configurations and additional features
// for the admin dashboard

// ============================================
// 1. ADMIN ROLES & PERMISSIONS
// ============================================

const ADMIN_ROLES = {
    SUPER_ADMIN: {
        name: 'Super Admin',
        permissions: ['users.read', 'users.create', 'users.edit', 'users.delete',
                     'bookings.read', 'bookings.edit', 'bookings.delete',
                     'tests.read', 'tests.create', 'tests.edit', 'tests.delete',
                     'analytics.read', 'settings.edit', 'reports.read']
    },
    LAB_MANAGER: {
        name: 'Lab Manager',
        permissions: ['users.read', 'bookings.read', 'bookings.edit',
                     'tests.read', 'analytics.read', 'reports.read']
    },
    RECEPTIONIST: {
        name: 'Receptionist',
        permissions: ['users.read', 'bookings.read', 'bookings.edit']
    },
    VIEWER: {
        name: 'Viewer',
        permissions: ['users.read', 'bookings.read', 'tests.read', 'analytics.read']
    }
};

// ============================================
// 2. VALIDATION RULES
// ============================================

const VALIDATION_RULES = {
    user: {
        name: {
            required: true,
            minLength: 3,
            maxLength: 50,
            pattern: /^[a-zA-Z\s]*$/
        },
        email: {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        },
        phone: {
            required: true,
            pattern: /^\+?[0-9]{10,}$/
        },
        age: {
            min: 1,
            max: 120
        },
        bloodType: {
            allowed: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
        }
    },
    test: {
        name: {
            required: true,
            minLength: 3,
            maxLength: 100
        },
        price: {
            required: true,
            min: 0
        },
        popularity: {
            min: 0,
            max: 100
        }
    },
    booking: {
        date: {
            required: true,
            cannotBePast: true
        },
        amount: {
            required: true,
            min: 0
        }
    }
};

// ============================================
// 3. EXPORT & IMPORT FUNCTIONALITY
// ============================================

function exportDataAsCSV() {
    const users = JSON.parse(localStorage.getItem('bloodlabUsers')) || [];
    const bookings = JSON.parse(localStorage.getItem('bloodlabBookings')) || [];
    const tests = JSON.parse(localStorage.getItem('bloodlabTests')) || [];

    // Export Users
    exportToCSV(users, 'users.csv', ['id', 'name', 'email', 'phone', 'status', 'registrationDate']);
    
    // Export Bookings
    exportToCSV(bookings, 'bookings.csv', ['id', 'userId', 'testName', 'date', 'amount', 'status']);
    
    // Export Tests
    exportToCSV(tests, 'tests.csv', ['id', 'name', 'price', 'popularity']);
}

function exportToCSV(data, filename, columns) {
    const csv = [
        columns.join(','),
        ...data.map(row => columns.map(col => `"${row[col] || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
}

function exportDataAsJSON() {
    const allData = {
        users: JSON.parse(localStorage.getItem('bloodlabUsers')) || [],
        bookings: JSON.parse(localStorage.getItem('bloodlabBookings')) || [],
        tests: JSON.parse(localStorage.getItem('bloodlabTests')) || [],
        exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bloodlab-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
}

// ============================================
// 4. ADVANCED FILTERING & SEARCH
// ============================================

function advancedSearch(users, filters) {
    return users.filter(user => {
        const matchName = !filters.name || user.name.toLowerCase().includes(filters.name.toLowerCase());
        const matchStatus = !filters.status || user.status === filters.status;
        const matchBloodType = !filters.bloodType || user.bloodType === filters.bloodType;
        const matchAgeRange = !filters.minAge || !filters.maxAge || 
                            (user.age >= filters.minAge && user.age <= filters.maxAge);
        
        return matchName && matchStatus && matchBloodType && matchAgeRange;
    });
}

// ============================================
// 5. REPORTING & ANALYTICS
// ============================================

function generateUserReport() {
    const users = JSON.parse(localStorage.getItem('bloodlabUsers')) || [];
    
    const report = {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.status === 'active').length,
        inactiveUsers: users.filter(u => u.status === 'inactive').length,
        suspendedUsers: users.filter(u => u.status === 'suspended').length,
        genderDistribution: {
            male: users.filter(u => u.gender === 'Male').length,
            female: users.filter(u => u.gender === 'Female').length,
            other: users.filter(u => u.gender === 'Other').length
        },
        bloodTypeDistribution: users.reduce((acc, u) => {
            if (u.bloodType) acc[u.bloodType] = (acc[u.bloodType] || 0) + 1;
            return acc;
        }, {}),
        ageStatistics: {
            youngest: Math.min(...users.map(u => u.age || 0)),
            oldest: Math.max(...users.map(u => u.age || 0)),
            average: Math.round(users.reduce((sum, u) => sum + (u.age || 0), 0) / users.length)
        }
    };

    return report;
}

function generateRevenueReport() {
    const bookings = JSON.parse(localStorage.getItem('bloodlabBookings')) || [];
    
    const monthlyRevenue = {};
    const testRevenue = {};
    
    bookings.forEach(booking => {
        const month = booking.date.substring(0, 7);
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + booking.amount;
        testRevenue[booking.testName] = (testRevenue[booking.testName] || 0) + booking.amount;
    });

    return {
        totalRevenue: bookings.reduce((sum, b) => sum + b.amount, 0),
        monthlyBreakdown: monthlyRevenue,
        topTests: Object.entries(testRevenue)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([test, revenue]) => ({ test, revenue }))
    };
}

// ============================================
// 6. BACKUP & RESTORE
// ============================================

function createBackup() {
    const backup = {
        timestamp: new Date().toISOString(),
        users: JSON.parse(localStorage.getItem('bloodlabUsers')) || [],
        bookings: JSON.parse(localStorage.getItem('bloodlabBookings')) || [],
        tests: JSON.parse(localStorage.getItem('bloodlabTests')) || []
    };

    const backupKey = `bloodlab-backup-${new Date().getTime()}`;
    localStorage.setItem(backupKey, JSON.stringify(backup));
    
    console.log('✅ Backup created:', backupKey);
    return backupKey;
}

function restoreBackup(backupKey) {
    const backup = JSON.parse(localStorage.getItem(backupKey));
    if (!backup) {
        console.error('❌ Backup not found');
        return false;
    }

    localStorage.setItem('bloodlabUsers', JSON.stringify(backup.users));
    localStorage.setItem('bloodlabBookings', JSON.stringify(backup.bookings));
    localStorage.setItem('bloodlabTests', JSON.stringify(backup.tests));
    
    console.log('✅ Backup restored from:', backupKey);
    return true;
}

function listBackups() {
    const backups = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('bloodlab-backup-')) {
            const backup = JSON.parse(localStorage.getItem(key));
            backups.push({
                key,
                timestamp: backup.timestamp,
                users: backup.users.length,
                bookings: backup.bookings.length,
                tests: backup.tests.length
            });
        }
    }
    return backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

// ============================================
// 7. EMAIL NOTIFICATION SYSTEM
// ============================================

const EmailTemplates = {
    bookingConfirmation: (booking, user) => ({
        to: user.email,
        subject: `Booking Confirmed - ${booking.testName}`,
        html: `
            <h2>Booking Confirmed!</h2>
            <p>Hi ${user.name},</p>
            <p>Your booking for <strong>${booking.testName}</strong> has been confirmed.</p>
            <ul>
                <li>Date: ${booking.date}</li>
                <li>Time: ${booking.time}</li>
                <li>Amount: ₹${booking.amount}</li>
            </ul>
            <p>Please arrive 10 minutes early.</p>
        `
    }),
    
    bookingCancellation: (booking, user) => ({
        to: user.email,
        subject: `Booking Cancelled - ${booking.testName}`,
        html: `
            <h2>Booking Cancelled</h2>
            <p>Your booking for ${booking.testName} has been cancelled.</p>
            <p>If you need to reschedule, please contact us.</p>
        `
    }),

    userRegistration: (user) => ({
        to: user.email,
        subject: 'Welcome to BloodLab!',
        html: `
            <h2>Welcome, ${user.name}!</h2>
            <p>Thank you for registering with BloodLab.</p>
            <p>Your account has been created successfully.</p>
            <p>You can now book tests from our dashboard.</p>
        `
    })
};

// ============================================
// 8. DATA VALIDATION FUNCTIONS
// ============================================

function validateUser(user) {
    const errors = [];

    if (!user.name || user.name.length < 3) {
        errors.push('Name must be at least 3 characters');
    }

    if (!user.email || !isValidEmail(user.email)) {
        errors.push('Valid email is required');
    }

    if (!user.phone || !isValidPhone(user.phone)) {
        errors.push('Valid phone number is required');
    }

    if (user.age && (user.age < 1 || user.age > 120)) {
        errors.push('Age must be between 1 and 120');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
    return /^\+?[0-9]{10,}$/.test(phone.replace(/\s/g, ''));
}

// ============================================
// 9. DASHBOARD NOTIFICATIONS
// ============================================

function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#dcfce7' : type === 'error' ? '#fee2e2' : '#dbeafe'};
        color: ${type === 'success' ? '#166534' : type === 'error' ? '#991b1b' : '#0c4a6e'};
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), duration);
}

// ============================================
// 10. CACHING & PERFORMANCE
// ============================================

const Cache = {
    data: {},
    
    set(key, value, ttl = 300000) {
        this.data[key] = {
            value,
            expires: Date.now() + ttl
        };
    },
    
    get(key) {
        if (!this.data[key]) return null;
        
        if (Date.now() > this.data[key].expires) {
            delete this.data[key];
            return null;
        }
        
        return this.data[key].value;
    },
    
    clear() {
        this.data = {};
    }
};

// ============================================
// Export all for use
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ADMIN_ROLES,
        VALIDATION_RULES,
        EmailTemplates,
        exportDataAsCSV,
        exportDataAsJSON,
        advancedSearch,
        generateUserReport,
        generateRevenueReport,
        createBackup,
        restoreBackup,
        listBackups,
        validateUser,
        isValidEmail,
        isValidPhone,
        showNotification,
        Cache
    };
}
