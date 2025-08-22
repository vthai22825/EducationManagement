// Auth functionality
document.addEventListener('DOMContentLoaded', () => {
    initAuthTabs();
    initLoginForm();
    initRegisterForm();
    updateNavigation();
});

// Initialize auth tabs
function initAuthTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const authForms = document.querySelectorAll('.auth-form');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Show target form
            authForms.forEach(form => {
                form.classList.remove('active');
                if (form.id === `${targetTab}-form`) {
                    form.classList.add('active');
                }
            });
        });
    });
}

// Initialize login form
function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(loginForm);
            const loginData = {
                userName: formData.get('username'),
                userPassword: formData.get('password')
            };
            
            try {
                showLoading();
                const response = await api.post('/users/login', loginData);
                
                // Store user data and token in localStorage
                localStorage.setItem('currentUser', JSON.stringify(response.user));
                localStorage.setItem('token', response.token);
                
                showMessage('Đăng nhập thành công!', 'success');
                
                // Redirect based on role
                setTimeout(() => {
                    if (response.user.role === 'Instructor') {
                        window.location.href = 'admin-dashboard.html';
                    } else {
                        window.location.href = 'student-dashboard.html';
                    }
                }, 1500);
                
            } catch (error) {
                showMessage('Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.', 'error');
            } finally {
                hideLoading();
            }
        });
    }
}

// Initialize register form
function initRegisterForm() {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(registerForm);
            const registerData = {
                userName: formData.get('username'),
                fullName: formData.get('fullName'),
                userPassword: formData.get('password'),
                role: formData.get('role')
            };
            
            try {
                showLoading();
                const response = await api.post('/users/register', registerData);
                
                showMessage('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
                
                // Switch to login tab
                const loginTab = document.querySelector('[data-tab="login"]');
                if (loginTab) {
                    loginTab.click();
                }
                
                // Clear form
                registerForm.reset();
                
            } catch (error) {
                showMessage('Đăng ký thất bại. Tên đăng nhập có thể đã tồn tại.', 'error');
            } finally {
                hideLoading();
            }
        });
    }
}

// Check if user is logged in
function isLoggedIn() {
    const currentUser = localStorage.getItem('currentUser');
    return currentUser !== null;
}

// Get current user
function getCurrentUser() {
    const currentUser = localStorage.getItem('currentUser');
    return currentUser ? JSON.parse(currentUser) : null;
}

// Check if user is admin
function isAdmin() {
    const currentUser = getCurrentUser();
    return currentUser && currentUser.role === 'Instructor';
}

// Check if user is student
function isStudent() {
    const currentUser = getCurrentUser();
    return currentUser && currentUser.role === 'Student';
}

// Logout
function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

// Update navigation based on auth status and role
function updateNavigation() {
    const currentUser = getCurrentUser();
    const loginBtn = document.querySelector('.login-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (currentUser && loginBtn) {
        // Update login button to show user info
        loginBtn.textContent = `Xin chào, ${currentUser.fullName}`;
        loginBtn.onclick = logout;
        loginBtn.classList.add('user-menu');
        loginBtn.href = '#';
        
        // Add role indicator
        const roleIndicator = document.createElement('span');
        roleIndicator.className = 'role-indicator';
        roleIndicator.textContent = currentUser.role === 'Instructor' ? 'Admin' : 'Student';
        loginBtn.appendChild(roleIndicator);
        
        // Show/hide admin-only elements
        const adminOnlyElements = document.querySelectorAll('.admin-only');
        adminOnlyElements.forEach(element => {
            if (currentUser.role === 'Instructor') {
                element.style.display = 'block';
            } else {
                element.style.display = 'none';
            }
        });
        
        // Show/hide menu items based on role
        if (navMenu) {
            const menuItems = navMenu.querySelectorAll('.nav-item');
            menuItems.forEach(item => {
                const link = item.querySelector('.nav-link');
                if (link) {
                    const href = link.getAttribute('href');
                    
                    // Hide certain pages based on role
                    if (currentUser.role === 'Student') {
                        // Students can only see courses and enrollments
                        if (href === 'users.html') {
                            item.style.display = 'none';
                        }
                    } else if (currentUser.role === 'Instructor') {
                        // Instructors can see all pages
                        item.style.display = 'block';
                    }
                }
            });
        }
    } else if (loginBtn) {
        // Reset to login button
        loginBtn.textContent = 'Đăng nhập';
        loginBtn.onclick = null;
        loginBtn.href = 'login.html';
        loginBtn.classList.remove('user-menu');
        
        // Remove role indicator if exists
        const roleIndicator = loginBtn.querySelector('.role-indicator');
        if (roleIndicator) {
            roleIndicator.remove();
        }
        
        // Hide all admin-only elements when not logged in
        const adminOnlyElements = document.querySelectorAll('.admin-only');
        adminOnlyElements.forEach(element => {
            element.style.display = 'none';
        });
        
        // Hide enrollment page when not logged in
        if (navMenu) {
            const menuItems = navMenu.querySelectorAll('.nav-item');
            menuItems.forEach(item => {
                const link = item.querySelector('.nav-link');
                if (link) {
                    const href = link.getAttribute('href');
                    if (href === 'enrollments.html') {
                        item.style.display = 'none';
                    }
                }
            });
        }
    }
}

// Check authentication on page load
function checkAuth() {
    const currentUser = getCurrentUser();
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Pages that require authentication
    const protectedPages = ['users.html', 'enrollments.html'];
    
    if (protectedPages.includes(currentPage) && !currentUser) {
        // Redirect to login if not authenticated
        window.location.href = 'login.html';
        return;
    }
    
    // Check role-based access
    if (currentUser) {
        if (currentPage === 'users.html' && currentUser.role === 'Student') {
            // Students cannot access users page
            window.location.href = 'index.html';
            return;
        }
    }
}

// Initialize auth status on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    updateNavigation();
});

// Export functions
window.isLoggedIn = isLoggedIn;
window.getCurrentUser = getCurrentUser;
window.isAdmin = isAdmin;
window.isStudent = isStudent;
window.logout = logout;
