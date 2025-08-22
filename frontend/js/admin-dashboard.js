// Admin Dashboard functionality
document.addEventListener('DOMContentLoaded', () => {
    checkAdminAccess();
    loadAdminDashboard();
    updateAdminInfo();
    checkSystemStatus();
});

// Check if user is admin
function checkAdminAccess() {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'Instructor') {
        showMessage('Bạn không có quyền truy cập trang này.', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }
}

// Load admin dashboard data
async function loadAdminDashboard() {
    try {
        showLoading();
        
        // Load dashboard stats from admin API
        const stats = await api.get('/admin/dashboard/stats');
        
        // Load all data in parallel for activities and reports
        const [users, courses, enrollments] = await Promise.all([
            api.get('/admin/users'),
            api.get('/admin/courses'),
            api.get('/admin/enrollments')
        ]);
        
        // Update stats using admin API data
        updateStats(stats);
        
        // Load recent activities
        loadRecentActivities(enrollments, users, courses);
        
        // Load reports data using admin APIs
        loadReportsData();
        
    } catch (error) {
        showMessage('Không thể tải dữ liệu dashboard.', 'error');
    } finally {
        hideLoading();
    }
}

// Update dashboard statistics
function updateStats(stats) {
    const totalUsers = document.getElementById('totalUsers');
    const totalCourses = document.getElementById('totalCourses');
    const totalEnrollments = document.getElementById('totalEnrollments');
    const pendingEnrollments = document.getElementById('pendingEnrollments');
    
    if (totalUsers) totalUsers.textContent = stats.totalUsers;
    if (totalCourses) totalCourses.textContent = stats.totalCourses;
    if (totalEnrollments) totalEnrollments.textContent = stats.totalEnrollments;
    if (pendingEnrollments) pendingEnrollments.textContent = stats.pendingEnrollments;
    
    // Animate numbers
    animateNumbers();
}

// Load recent activities
function loadRecentActivities(enrollments, users, courses) {
    const activitiesList = document.getElementById('activitiesList');
    if (!activitiesList) return;
    
            // Create activities based on enrollments
    const activities = [];
    
    // Add enrollment activities
    enrollments.slice(0, 5).forEach(enrollment => {
        const student = users.find(u => u.userId === enrollment.studentId);
        const course = courses.find(c => c.courseId === enrollment.courseId);
        
        if (student && course) {
            activities.push({
                type: 'enrollment',
                title: `${student.fullName} đã đăng ký khóa học "${course.title}"`,
                time: 'Gần đây',
                icon: 'fas fa-user-plus'
            });
        }
    });
    
    // Add course activities
    courses.slice(0, 3).forEach(course => {
        activities.push({
            type: 'course',
            title: `Khóa học "${course.title}" đã được tạo`,
            time: 'Gần đây',
            icon: 'fas fa-book'
        });
    });
    
    if (activities.length === 0) {
        activitiesList.innerHTML = '<div class="no-activities">Chưa có hoạt động nào</div>';
        return;
    }
    
    activitiesList.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-time">${activity.time}</div>
            </div>
        </div>
    `).join('');
}

// Load reports data
async function loadReportsData() {
    try {
        const [userReport, enrollmentReport] = await Promise.all([
            api.get('/admin/reports/users'),
            api.get('/admin/reports/enrollments')
        ]);
        
        // Store data for reports modal
        window.reportsData = {
            students: userReport.students,
            instructors: userReport.instructors,
            approved: enrollmentReport.approvedEnrollments,
            rejected: enrollmentReport.rejectedEnrollments
        };
    } catch (error) {
        window.reportsData = {
            students: 0,
            instructors: 0,
            approved: 0,
            rejected: 0
        };
    }
}

// Update admin info
function updateAdminInfo() {
    const currentUser = getCurrentUser();
    const adminName = document.getElementById('adminName');
    
    if (currentUser && adminName) {
        adminName.textContent = currentUser.fullName;
    }
}

// Check system status
async function checkSystemStatus() {
    try {
        // Check API connection
        await api.get('/courses');
        
        // Update status indicators
        const apiStatus = document.getElementById('apiStatus');
        const dbStatus = document.getElementById('dbStatus');
        const activeUsers = document.getElementById('activeUsers');
        
        if (apiStatus) {
            apiStatus.textContent = 'Online';
            apiStatus.className = 'status-badge online';
        }
        
        if (dbStatus) {
            dbStatus.textContent = 'Online';
            dbStatus.className = 'status-badge online';
        }
        
        if (activeUsers) {
            // Set active users count (placeholder)
            activeUsers.textContent = '5';
        }
        
    } catch (error) {
        const apiStatus = document.getElementById('apiStatus');
        if (apiStatus) {
            apiStatus.textContent = 'Offline';
            apiStatus.className = 'status-badge offline';
        }
    }
}

// Show reports modal
function showReports() {
    const reportsData = window.reportsData || {
        students: 0,
        instructors: 0,
        approved: 0,
        rejected: 0
    };
    
    // Update modal content
    const studentCount = document.getElementById('studentCount');
    const instructorCount = document.getElementById('instructorCount');
    const approvedCount = document.getElementById('approvedCount');
    const rejectedCount = document.getElementById('rejectedCount');
    
    if (studentCount) studentCount.textContent = reportsData.students;
    if (instructorCount) instructorCount.textContent = reportsData.instructors;
    if (approvedCount) approvedCount.textContent = reportsData.approved;
    if (rejectedCount) rejectedCount.textContent = reportsData.rejected;
    
    openModal('reportsModal');
}

// Animate number counters
function animateNumbers() {
    const statNumbers = document.querySelectorAll('.stat-content h3');
    
    statNumbers.forEach(element => {
        const target = parseInt(element.textContent);
        const duration = 2000; // 2 seconds
        const step = target / (duration / 16); // 60fps
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 16);
    });
}

// Export functions
window.showReports = showReports;
