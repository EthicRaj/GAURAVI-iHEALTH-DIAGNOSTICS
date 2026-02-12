// ============================================
// BLOODLAB ADMIN DASHBOARD - JAVASCRIPT
// ============================================

// Data Storage
let usersData = [];
let bookingsData = [];
let testsData = [];
let currentUserPage = 1;
const itemsPerPage = 10;
let apiAvailable = false;

// Initialize Admin Dashboard
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    setCurrentDate();
    loadAllData();
    setupNavigation();
});

// Setup Event Listeners
function setupEventListeners() {
    // Navigation
    const navBtns = document.querySelectorAll('.nav-btn, .sidebar-item');
    navBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const section = e.target.dataset.section;
            navigateToSection(section);
        });
    });

    // Search and Filter
    document.getElementById('searchUsers').addEventListener('input', filterUsers);
    document.getElementById('filterStatus').addEventListener('change', filterUsers);
    document.getElementById('searchBookings').addEventListener('input', filterBookings);
    document.getElementById('filterBookingStatus').addEventListener('change', filterBookings);
    document.getElementById('searchTests').addEventListener('input', filterTests);

    // Forms
    document.getElementById('userForm').addEventListener('submit', saveUser);
    document.getElementById('testForm').addEventListener('submit', saveTest);
}

// Notification System
function showNotification(message, type = 'info') {
    // Create notification container if it doesn't exist
    let notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
        `;
        document.body.appendChild(notificationContainer);
    }

    // Create notification element
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3';
    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
    
    notification.style.cssText = `
        background-color: ${bgColor};
        color: white;
        padding: 15px 20px;
        margin-bottom: 10px;
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease-in-out;
        font-size: 14px;
    `;
    notification.innerHTML = `<strong>${icon}</strong> ${message}`;
    
    notificationContainer.appendChild(notification);

    // Auto-remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in-out';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Navigation
function navigateToSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.admin-section');
    sections.forEach(section => section.classList.remove('active'));

    // Show selected section
    const selectedSection = document.getElementById(sectionName);
    if (selectedSection) {
        selectedSection.classList.add('active');
    }

    // Update navigation buttons
    const navBtns = document.querySelectorAll('.nav-btn, .sidebar-item');
    navBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.section === sectionName) {
            btn.classList.add('active');
        }
    });

    // Load section-specific data
    if (sectionName === 'users') {
        loadUsers();
    } else if (sectionName === 'bookings') {
        loadBookings();
    } else if (sectionName === 'tests') {
        loadTests();
    } else if (sectionName === 'dashboard') {
        updateDashboard();
    }
}

function setupNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn, .sidebar-item');
    navBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const section = e.target.dataset.section;
            
            // Update all nav buttons
            document.querySelectorAll('.nav-btn, .sidebar-item').forEach(b => {
                b.classList.remove('active');
            });
            
            // Activate clicked button
            e.target.classList.add('active');
            
            navigateToSection(section);
        });
    });
}

// Load All Data from API or LocalStorage
async function loadAllData() {
    try {
        // Check if API is available
        apiAvailable = await APIClient.isAvailable();
        
        if (apiAvailable) {
            console.log('✅ Backend API available - Loading from server...');
            usersData = await APIClient.getUsers();
            bookingsData = await APIClient.getBookings();
            testsData = await APIClient.getTests();
            console.log('✅ Data loaded from backend');
        } else {
            console.log('⚠️ Backend not available - Using localStorage');
            loadDataFromLocalStorage();
        }
    } catch (error) {
        console.log('⚠️ Error loading from API, falling back to localStorage', error);
        loadDataFromLocalStorage();
    }
    
    updateDashboard();
}

// Load from LocalStorage
function loadDataFromLocalStorage() {
    usersData = JSON.parse(localStorage.getItem('bloodlabUsers')) || getDefaultUsers();
    bookingsData = JSON.parse(localStorage.getItem('bloodlabBookings')) || getDefaultBookings();
    testsData = JSON.parse(localStorage.getItem('bloodlabTests')) || getDefaultTests();
    
    saveDataToLocalStorage();
    updateDashboard();
}

// Save to LocalStorage
function saveDataToLocalStorage() {
    localStorage.setItem('bloodlabUsers', JSON.stringify(usersData));
    localStorage.setItem('bloodlabBookings', JSON.stringify(bookingsData));
    localStorage.setItem('bloodlabTests', JSON.stringify(testsData));
}

// Default Data
function getDefaultUsers() {
    return [
        {
            id: 'USR001',
            name: 'Raj Kumar',
            email: 'raj@example.com',
            phone: '+91 98765 43210',
            age: 35,
            gender: 'Male',
            bloodType: 'O+',
            status: 'active',
            address: '123 Main St, Delhi',
            registrationDate: '2024-01-15'
        },
        {
            id: 'USR002',
            name: 'Priya Singh',
            email: 'priya@example.com',
            phone: '+91 98765 43211',
            age: 28,
            gender: 'Female',
            bloodType: 'A+',
            status: 'active',
            address: '456 Oak Ave, Mumbai',
            registrationDate: '2024-01-20'
        },
        {
            id: 'USR003',
            name: 'Amit Patel',
            email: 'amit@example.com',
            phone: '+91 98765 43212',
            age: 42,
            gender: 'Male',
            bloodType: 'B+',
            status: 'active',
            address: '789 Pine Rd, Bangalore',
            registrationDate: '2024-02-01'
        }
    ];
}

function getDefaultBookings() {
    return [
        {
            id: 'BK001',
            userId: 'USR001',
            userName: 'Raj Kumar',
            testId: 'fullbody',
            testName: 'Full Body Checkups',
            date: '2024-02-20',
            time: '09:00 AM',
            amount: 1999,
            status: 'confirmed'
        },
        {
            id: 'BK002',
            userId: 'USR002',
            userName: 'Priya Singh',
            testId: 'covid',
            testName: 'Covid 19 Test',
            date: '2024-02-21',
            time: '10:30 AM',
            amount: 1200,
            status: 'pending'
        }
    ];
}

function getDefaultTests() {
    return [
        { id: 'cbc', name: 'CBC Test', price: 350, description: 'Complete Blood Count', popularity: 100 },
        { id: 'fullbody', name: 'Full Body Checkups', price: 1999, description: 'Complete health screening package', popularity: 100 },
        { id: 'thyroid', name: 'Thyroid Test', price: 500, description: 'T3, T4, TSH panel', popularity: 95 },
        { id: 'covid', name: 'Covid 19 Test', price: 1200, description: 'RT-PCR COVID detection test', popularity: 90 }
    ];
}

// Dashboard
function updateDashboard() {
    const totalUsers = usersData.length;
    const totalBookings = bookingsData.length;
    const totalRevenue = bookingsData.reduce((sum, b) => sum + b.amount, 0);
    
    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('totalBookings').textContent = totalBookings;
    document.getElementById('totalRevenue').textContent = '₹' + totalRevenue.toLocaleString();
    
    // Load charts placeholder
    updateCharts();
}

function updateCharts() {
    // Simple chart placeholders
    const activityChart = document.getElementById('activityChart');
    const revenueChart = document.getElementById('revenueChart');
    
    // In production, use libraries like Chart.js, ApexCharts, etc.
    activityChart.innerHTML = `
        <div style="padding: 20px; text-align: center; color: #6b7280;">
            📊 Activity Chart<br>
            <small>Bookings: ${bookingsData.length} | Users: ${usersData.length}</small>
        </div>
    `;
    
    revenueChart.innerHTML = `
        <div style="padding: 20px; text-align: center; color: #6b7280;">
            💰 Revenue Chart<br>
            <small>Total: ₹${bookingsData.reduce((sum, b) => sum + b.amount, 0).toLocaleString()}</small>
        </div>
    `;
}

// Users Management
function loadUsers() {
    displayUserTable(usersData);
}

function displayUserTable(data) {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';

    const start = (currentUserPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedData = data.slice(start, end);

    paginatedData.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td><span class="status-badge status-${user.status}">${user.status.charAt(0).toUpperCase() + user.status.slice(1)}</span></td>
            <td>${user.registrationDate}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn btn-view" onclick="viewUser('${user.id}')">View</button>
                    <button class="action-btn btn-edit" onclick="editUser('${user.id}')">Edit</button>
                    <button class="action-btn btn-delete" onclick="deleteUser('${user.id}')">Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });

    updatePagination(data.length);
}

function filterUsers() {
    const searchTerm = document.getElementById('searchUsers').value.toLowerCase();
    const statusFilter = document.getElementById('filterStatus').value;

    const filtered = usersData.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm) ||
                            user.email.toLowerCase().includes(searchTerm) ||
                            user.phone.includes(searchTerm);
        const matchesStatus = !statusFilter || user.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    currentUserPage = 1;
    displayUserTable(filtered);
}

function openAddUserModal() {
    document.getElementById('userModalTitle').textContent = 'Add New User';
    document.getElementById('userId').value = '';
    document.getElementById('userForm').reset();
    document.getElementById('userModal').classList.add('show');
}

function closeUserModal() {
    document.getElementById('userModal').classList.remove('show');
    document.getElementById('userForm').reset();
}

function editUser(userId) {
    const user = usersData.find(u => u.id === userId);
    if (!user) return;

    document.getElementById('userModalTitle').textContent = 'Edit User';
    document.getElementById('userId').value = user.id;
    document.getElementById('userName').value = user.name;
    document.getElementById('userEmail').value = user.email;
    document.getElementById('userPhone').value = user.phone;
    document.getElementById('userAge').value = user.age || '';
    document.getElementById('userGender').value = user.gender || '';
    document.getElementById('userStatus').value = user.status;
    document.getElementById('userBloodType').value = user.bloodType || '';
    document.getElementById('userAddress').value = user.address || '';

    document.getElementById('userModal').classList.add('show');
}

function viewUser(userId) {
    const user = usersData.find(u => u.id === userId);
    if (!user) return;

    const userBookings = bookingsData.filter(b => b.userId === userId);

    let bookingsHTML = '<h4>User Bookings:</h4>';
    if (userBookings.length > 0) {
        bookingsHTML += '<ul>';
        userBookings.forEach(b => {
            bookingsHTML += `<li>${b.testName} - ${b.date} at ${b.time} (${b.status})</li>`;
        });
        bookingsHTML += '</ul>';
    } else {
        bookingsHTML += '<p>No bookings yet</p>';
    }

    const detailContent = `
        <div class="detail-section">
            <h3>Personal Information</h3>
            <div class="detail-item"><strong>ID:</strong> <span>${user.id}</span></div>
            <div class="detail-item"><strong>Name:</strong> <span>${user.name}</span></div>
            <div class="detail-item"><strong>Email:</strong> <span>${user.email}</span></div>
            <div class="detail-item"><strong>Phone:</strong> <span>${user.phone}</span></div>
            <div class="detail-item"><strong>Age:</strong> <span>${user.age || 'N/A'}</span></div>
            <div class="detail-item"><strong>Gender:</strong> <span>${user.gender || 'N/A'}</span></div>
            <div class="detail-item"><strong>Blood Type:</strong> <span>${user.bloodType || 'N/A'}</span></div>
        </div>
        <div class="detail-section">
            <h3>Address & Status</h3>
            <div class="detail-item"><strong>Address:</strong> <span>${user.address || 'N/A'}</span></div>
            <div class="detail-item"><strong>Status:</strong> <span class="status-badge status-${user.status}">${user.status}</span></div>
            <div class="detail-item"><strong>Registration Date:</strong> <span>${user.registrationDate}</span></div>
        </div>
        <div class="detail-section">
            ${bookingsHTML}
        </div>
    `;

    document.getElementById('userDetailContent').innerHTML = detailContent;
    document.getElementById('userDetailModal').classList.add('show');
}

function closeUserDetailModal() {
    document.getElementById('userDetailModal').classList.remove('show');
}

function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        if (apiAvailable) {
            APIClient.deleteUser(userId)
                .then(() => {
                    console.log('✅ User deleted from backend');
                    usersData = usersData.filter(u => u.id !== userId);
                    saveDataToLocalStorage();
                    loadUsers();
                    showNotification('User deleted successfully!', 'success');
                })
                .catch(error => {
                    console.error('Error deleting user:', error);
                    showNotification('Failed to delete user', 'error');
                });
        } else {
            usersData = usersData.filter(u => u.id !== userId);
            saveDataToLocalStorage();
            loadUsers();
            showNotification('User deleted successfully!', 'success');
        }
    }
}

function saveUser(e) {
    e.preventDefault();

    const userId = document.getElementById('userId').value;
    const userData = {
        id: userId || 'USR' + String(usersData.length + 1).padStart(3, '0'),
        name: document.getElementById('userName').value,
        email: document.getElementById('userEmail').value,
        phone: document.getElementById('userPhone').value,
        age: parseInt(document.getElementById('userAge').value) || null,
        gender: document.getElementById('userGender').value,
        bloodType: document.getElementById('userBloodType').value,
        status: document.getElementById('userStatus').value,
        address: document.getElementById('userAddress').value,
        registrationDate: userId ? 
            usersData.find(u => u.id === userId).registrationDate : 
            new Date().toISOString().split('T')[0]
    };

    if (apiAvailable) {
        // Save to backend API
        if (userId) {
            APIClient.updateUser(userId, userData)
                .then(() => {
                    console.log('✅ User updated on backend');
                    usersData = usersData.map(u => u.id === userId ? userData : u);
                    saveDataToLocalStorage();
                    closeUserModal();
                    loadUsers();
                    showNotification('User updated successfully!', 'success');
                })
                .catch(error => {
                    console.error('Error updating user:', error);
                    showNotification('Failed to update user', 'error');
                });
        } else {
            APIClient.createUser(userData)
                .then(() => {
                    console.log('✅ User created on backend');
                    usersData.push(userData);
                    saveDataToLocalStorage();
                    closeUserModal();
                    loadUsers();
                    showNotification('User created successfully!', 'success');
                })
                .catch(error => {
                    console.error('Error creating user:', error);
                    showNotification('Failed to create user', 'error');
                });
        }
    } else {
        // Save to localStorage only
        if (userId) {
            const index = usersData.findIndex(u => u.id === userId);
            if (index !== -1) {
                usersData[index] = userData;
            }
        } else {
            usersData.push(userData);
        }

        saveDataToLocalStorage();
        closeUserModal();
        loadUsers();
        showNotification('User saved successfully!', 'success');
    }
}

// Bookings Management
function loadBookings() {
    displayBookingTable(bookingsData);
}

function displayBookingTable(data) {
    const tbody = document.getElementById('bookingsTableBody');
    tbody.innerHTML = '';

    data.forEach(booking => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${booking.id}</td>
            <td>${booking.userName}</td>
            <td>${booking.testName}</td>
            <td>${booking.date}</td>
            <td>${booking.time}</td>
            <td>₹${booking.amount}</td>
            <td><span class="status-badge status-${booking.status}">${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn btn-edit" onclick="editBookingStatus('${booking.id}')">Update</button>
                    <button class="action-btn btn-delete" onclick="deleteBooking('${booking.id}')">Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function filterBookings() {
    const searchTerm = document.getElementById('searchBookings').value.toLowerCase();
    const statusFilter = document.getElementById('filterBookingStatus').value;

    const filtered = bookingsData.filter(booking => {
        const matchesSearch = booking.id.toLowerCase().includes(searchTerm) ||
                            booking.userName.toLowerCase().includes(searchTerm);
        const matchesStatus = !statusFilter || booking.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    displayBookingTable(filtered);
}

function editBookingStatus(bookingId) {
    const booking = bookingsData.find(b => b.id === bookingId);
    if (!booking) return;

    const newStatus = prompt('Update booking status:', booking.status);
    if (newStatus) {
        booking.status = newStatus;
        saveDataToLocalStorage();
        loadBookings();
    }
}

function deleteBooking(bookingId) {
    if (confirm('Delete this booking?')) {
        if (apiAvailable) {
            APIClient.deleteBooking(bookingId)
                .then(() => {
                    console.log('✅ Booking deleted from backend');
                    bookingsData = bookingsData.filter(b => b.id !== bookingId);
                    saveDataToLocalStorage();
                    loadBookings();
                    showNotification('Booking deleted successfully!', 'success');
                })
                .catch(error => {
                    console.error('Error deleting booking:', error);
                    showNotification('Failed to delete booking', 'error');
                });
        } else {
            bookingsData = bookingsData.filter(b => b.id !== bookingId);
            saveDataToLocalStorage();
            loadBookings();
            showNotification('Booking deleted successfully!', 'success');
        }
    }
}

// Tests Management
function loadTests() {
    displayTestTable(testsData);
}

function displayTestTable(data) {
    const tbody = document.getElementById('testsTableBody');
    tbody.innerHTML = '';

    data.forEach(test => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${test.id}</td>
            <td>${test.name}</td>
            <td>₹${test.price}</td>
            <td>${test.description}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <div style="flex: 1; background: #f3f4f6; border-radius: 4px; height: 6px;">
                        <div style="background: #7b2cbf; height: 100%; width: ${test.popularity}%; border-radius: 4px;"></div>
                    </div>
                    <span style="font-weight: 600; color: #7b2cbf;">${test.popularity}%</span>
                </div>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn btn-edit" onclick="editTest('${test.id}')">Edit</button>
                    <button class="action-btn btn-delete" onclick="deleteTest('${test.id}')">Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function filterTests() {
    const searchTerm = document.getElementById('searchTests').value.toLowerCase();

    const filtered = testsData.filter(test => {
        return test.name.toLowerCase().includes(searchTerm) ||
               test.description.toLowerCase().includes(searchTerm);
    });

    displayTestTable(filtered);
}

function openAddTestModal() {
    document.getElementById('testId').value = '';
    document.getElementById('testForm').reset();
    document.getElementById('testModal').classList.add('show');
}

function closeTestModal() {
    document.getElementById('testModal').classList.remove('show');
    document.getElementById('testForm').reset();
}

function editTest(testId) {
    const test = testsData.find(t => t.id === testId);
    if (!test) return;

    document.getElementById('testId').value = test.id;
    document.getElementById('testName').value = test.name;
    document.getElementById('testPrice').value = test.price;
    document.getElementById('testPopularity').value = test.popularity;
    document.getElementById('testDescription').value = test.description;

    document.getElementById('testModal').classList.add('show');
}

function deleteTest(testId) {
    if (confirm('Delete this test?')) {
        if (apiAvailable) {
            APIClient.deleteTest(testId)
                .then(() => {
                    console.log('✅ Test deleted from backend');
                    testsData = testsData.filter(t => t.id !== testId);
                    saveDataToLocalStorage();
                    loadTests();
                    showNotification('Test deleted successfully!', 'success');
                })
                .catch(error => {
                    console.error('Error deleting test:', error);
                    showNotification('Failed to delete test', 'error');
                });
        } else {
            testsData = testsData.filter(t => t.id !== testId);
            saveDataToLocalStorage();
            loadTests();
            showNotification('Test deleted successfully!', 'success');
        }
    }
}

function saveTest(e) {
    e.preventDefault();

    const testId = document.getElementById('testId').value;
    const testData = {
        id: testId || 'test_' + Date.now(),
        name: document.getElementById('testName').value,
        price: parseInt(document.getElementById('testPrice').value),
        popularity: parseInt(document.getElementById('testPopularity').value) || 50,
        description: document.getElementById('testDescription').value
    };

    if (apiAvailable) {
        if (testId) {
            APIClient.updateTest(testId, testData)
                .then(() => {
                    console.log('✅ Test updated on backend');
                    testsData = testsData.map(t => t.id === testId ? testData : t);
                    saveDataToLocalStorage();
                    closeTestModal();
                    loadTests();
                    showNotification('Test updated successfully!', 'success');
                })
                .catch(error => {
                    console.error('Error updating test:', error);
                    showNotification('Failed to update test', 'error');
                });
        } else {
            APIClient.createTest(testData)
                .then(() => {
                    console.log('✅ Test created on backend');
                    testsData.push(testData);
                    saveDataToLocalStorage();
                    closeTestModal();
                    loadTests();
                    showNotification('Test created successfully!', 'success');
                })
                .catch(error => {
                    console.error('Error creating test:', error);
                    showNotification('Failed to create test', 'error');
                });
        }
    } else {
        if (testId) {
            const index = testsData.findIndex(t => t.id === testId);
            if (index !== -1) {
                testsData[index] = testData;
            }
        } else {
            testsData.push(testData);
        }

        saveDataToLocalStorage();
        closeTestModal();
        loadTests();
        showNotification('Test saved successfully!', 'success');
    }
}

// Pagination
function updatePagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    document.getElementById('pageInfo').textContent = `Page ${currentUserPage} of ${totalPages}`;
    
    document.getElementById('prevBtn').disabled = currentUserPage === 1;
    document.getElementById('nextBtn').disabled = currentUserPage >= totalPages;
}

function nextPage() {
    currentUserPage++;
    loadUsers();
}

function previousPage() {
    if (currentUserPage > 1) {
        currentUserPage--;
        loadUsers();
    }
}

// Settings
function saveSettings() {
    const settings = {
        labName: document.getElementById('labName').value,
        contactEmail: document.getElementById('contactEmail').value,
        contactPhone: document.getElementById('contactPhone').value,
        address: document.getElementById('address').value
    };

    localStorage.setItem('bloodlabSettings', JSON.stringify(settings));
    alert('Settings saved successfully!');
}

// Utilities
function setCurrentDate() {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('dateToday').textContent = today.toLocaleDateString('en-IN', options);
}

function logoutAdmin() {
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = 'login.html';
    }
}

// Modal close on background click
window.addEventListener('click', (e) => {
    const userModal = document.getElementById('userModal');
    const testModal = document.getElementById('testModal');
    const userDetailModal = document.getElementById('userDetailModal');

    if (e.target === userModal) {
        closeUserModal();
    }
    if (e.target === testModal) {
        closeTestModal();
    }
    if (e.target === userDetailModal) {
        closeUserDetailModal();
    }
});
