// Users functionality
let users = [];
let filteredUsers = [];

document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
    initUserSearch();
    initUserFilter();
});

// Load users from API
async function loadUsers() {
    try {
        showLoading();
        users = await api.get('/admin/users');
        filteredUsers = [...users];
        displayUsers();
    } catch (error) {
        showMessage('Không thể tải danh sách người dùng.', 'error');
    } finally {
        hideLoading();
    }
}

// Display users in table
function displayUsers() {
    const usersTableBody = document.getElementById('usersTableBody');
    const noUsers = document.getElementById('noUsers');
    
    if (!usersTableBody) return;
    
    if (filteredUsers.length === 0) {
        usersTableBody.innerHTML = '';
        if (noUsers) noUsers.style.display = 'block';
        return;
    }
    
    if (noUsers) noUsers.style.display = 'none';
    
    usersTableBody.innerHTML = filteredUsers.map(user => `
        <tr>
            <td>${user.userId}</td>
            <td>${user.userName}</td>
            <td>${user.fullName}</td>
            <td>
                <span class="user-role ${user.role.toLowerCase()}">
                    ${formatStatus(user.role)}
                </span>
            </td>
            <td>
                <div class="user-actions">
                    <button class="btn btn-primary" onclick="showUserDetail(${user.userId})">
                        <i class="fas fa-eye"></i> Chi tiết
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Initialize user search
function initUserSearch() {
    const searchInput = document.getElementById('userSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            filterUsers(searchTerm);
        });
    }
}

// Initialize user filter
function initUserFilter() {
    const filterSelect = document.getElementById('roleFilter');
    if (filterSelect) {
        filterSelect.addEventListener('change', (e) => {
            const filterValue = e.target.value;
            filterUsersByRole(filterValue);
        });
    }
}

// Filter users by search term
function filterUsers(searchTerm) {
    filteredUsers = users.filter(user => 
        user.userName.toLowerCase().includes(searchTerm) ||
        user.fullName.toLowerCase().includes(searchTerm) ||
        user.userId.toString().includes(searchTerm)
    );
    displayUsers();
}

// Filter users by role
function filterUsersByRole(role) {
    if (!role) {
        filteredUsers = [...users];
    } else {
        filteredUsers = users.filter(user => user.role === role);
    }
    displayUsers();
}

// Show user detail
async function showUserDetail(userId) {
    try {
        const user = await api.get(`/users/${userId}`);
        
        // Populate modal with user details
        const name = document.getElementById('userDetailName');
        const username = document.getElementById('userDetailUsername');
        const role = document.getElementById('userDetailRole');
        const id = document.getElementById('userDetailId');
        
        if (name) name.textContent = user.fullName;
        if (username) username.textContent = user.userName;
        if (role) role.textContent = formatStatus(user.role);
        if (id) id.textContent = user.userId;
        
        // Get enrollment count for this user
        try {
            const enrollments = await api.get('/enrollments');
            const userEnrollments = enrollments.filter(e => e.studentId === userId);
            const enrollmentCount = document.getElementById('userEnrollmentCount');
            if (enrollmentCount) {
                enrollmentCount.textContent = userEnrollments.length;
            }
        } catch (error) {
            // Silent error for enrollment count
        }
        
        openModal('userDetailModal');
        
    } catch (error) {
        showMessage('Không thể tải thông tin người dùng.', 'error');
    }
}

// Export functions
window.showUserDetail = showUserDetail;



