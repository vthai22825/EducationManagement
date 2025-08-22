// Student Dashboard functionality
document.addEventListener('DOMContentLoaded', () => {
    checkStudentAccess();
    loadStudentDashboard();
    updateStudentInfo();
});

// Check if user is student
function checkStudentAccess() {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'Student') {
        showMessage('Bạn không có quyền truy cập trang này.', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }
}

// Load student dashboard data
async function loadStudentDashboard() {
    try {
        showLoading();
        
        const currentUser = getCurrentUser();
        
        // Load student-specific data
        const [enrollments, courses] = await Promise.all([
            api.get(`/enrollments/student/${currentUser.userId}`),
            api.get('/courses')
        ]);
        
        // Update stats
        updateStudentStats(enrollments, courses);
        
        // Load recent enrollments
        loadRecentEnrollments(enrollments, courses);
        
        // Load recommended courses
        loadRecommendedCourses(enrollments, courses);
        
    } catch (error) {
        showMessage('Không thể tải dữ liệu dashboard.', 'error');
    } finally {
        hideLoading();
    }
}

// Update student statistics
function updateStudentStats(enrollments, courses) {
    const enrolledCourses = document.getElementById('enrolledCourses');
    const approvedEnrollments = document.getElementById('approvedEnrollments');
    const pendingEnrollments = document.getElementById('pendingEnrollments');
    const availableCourses = document.getElementById('availableCourses');
    
    if (enrolledCourses) enrolledCourses.textContent = enrollments.length;
    
    // Count approved enrollments
    const approvedCount = enrollments.filter(e => e.status === 'Approved').length;
    if (approvedEnrollments) approvedEnrollments.textContent = approvedCount;
    
    // Count pending enrollments
    const pendingCount = enrollments.filter(e => e.status === 'Pending').length;
    if (pendingEnrollments) pendingEnrollments.textContent = pendingCount;
    
    // Count available courses (courses not enrolled)
    const enrolledCourseIds = enrollments.map(e => e.courseId);
    const availableCount = courses.filter(c => !enrolledCourseIds.includes(c.courseId)).length;
    if (availableCourses) availableCourses.textContent = availableCount;
    
    // Animate numbers
    animateNumbers();
}

// Load recent enrollments
function loadRecentEnrollments(enrollments, courses) {
    const enrollmentsList = document.getElementById('recentEnrollmentsList');
    if (!enrollmentsList) return;
    
    if (enrollments.length === 0) {
        enrollmentsList.innerHTML = '<div class="no-enrollments">Bạn chưa đăng ký khóa học nào</div>';
        return;
    }
    
    // Sort by most recent (assuming enrollmentId is auto-increment)
    const recentEnrollments = enrollments
        .sort((a, b) => b.enrollmentId - a.enrollmentId)
        .slice(0, 5);
    
    enrollmentsList.innerHTML = recentEnrollments.map(enrollment => {
        const course = courses.find(c => c.courseId === enrollment.courseId);
        return `
            <div class="enrollment-item">
                <div class="enrollment-icon">
                    <i class="fas fa-book"></i>
                </div>
                <div class="enrollment-content">
                    <div class="enrollment-title">${course ? course.title : 'Khóa học không xác định'}</div>
                    <span class="enrollment-status ${enrollment.status.toLowerCase()}">
                        ${formatStatus(enrollment.status)}
                    </span>
                </div>
            </div>
        `;
    }).join('');
}

// Load recommended courses
function loadRecommendedCourses(enrollments, courses) {
    const coursesGrid = document.getElementById('recommendedCoursesGrid');
    if (!coursesGrid) return;
    
    // Get courses not enrolled
    const enrolledCourseIds = enrollments.map(e => e.courseId);
    const availableCourses = courses.filter(c => !enrolledCourseIds.includes(c.courseId));
    
    if (availableCourses.length === 0) {
        coursesGrid.innerHTML = '<div class="no-courses">Bạn đã đăng ký tất cả khóa học có sẵn</div>';
        return;
    }
    
    // Show first 3 available courses
    const recommendedCourses = availableCourses.slice(0, 3);
    
    coursesGrid.innerHTML = recommendedCourses.map(course => `
        <div class="course-card">
            <h3>${course.title}</h3>
            <p>${course.description || 'Không có mô tả'}</p>
            <button class="btn btn-primary" onclick="enrollInCourse(${course.courseId})">
                <i class="fas fa-plus"></i> Đăng ký ngay
            </button>
        </div>
    `).join('');
}

// Update student info
function updateStudentInfo() {
    const currentUser = getCurrentUser();
    const studentName = document.getElementById('studentName');
    
    if (currentUser && studentName) {
        studentName.textContent = currentUser.fullName;
    }
}

// Show profile modal
function showProfile() {
    const currentUser = getCurrentUser();
    
    // Update modal content
    const profileName = document.getElementById('profileName');
    const profileUsername = document.getElementById('profileUsername');
    const profileEnrolledCourses = document.getElementById('profileEnrolledCourses');
    const profileApprovedEnrollments = document.getElementById('profileApprovedEnrollments');
    const profilePendingEnrollments = document.getElementById('profilePendingEnrollments');
    
    if (profileName) profileName.textContent = currentUser.fullName;
    if (profileUsername) profileUsername.textContent = currentUser.userName;
    
    // Load enrollment stats for profile
    loadProfileStats();
    
    openModal('profileModal');
}

// Load profile statistics
async function loadProfileStats() {
    try {
        const currentUser = getCurrentUser();
        const enrollments = await api.get(`/enrollments/student/${currentUser.userId}`);
        
        const profileEnrolledCourses = document.getElementById('profileEnrolledCourses');
        const profileApprovedEnrollments = document.getElementById('profileApprovedEnrollments');
        const profilePendingEnrollments = document.getElementById('profilePendingEnrollments');
        
        if (profileEnrolledCourses) profileEnrolledCourses.textContent = enrollments.length;
        
        const approvedCount = enrollments.filter(e => e.status === 'Approved').length;
        if (profileApprovedEnrollments) profileApprovedEnrollments.textContent = approvedCount;
        
        const pendingCount = enrollments.filter(e => e.status === 'Pending').length;
        if (profilePendingEnrollments) profilePendingEnrollments.textContent = pendingCount;
        
            } catch (error) {
            // Silent error for profile stats
        }
}

// Show progress modal
function showProgress() {
    const currentUser = getCurrentUser();
    
    // Update modal content
    const totalEnrolledCourses = document.getElementById('totalEnrolledCourses');
    const completedCourses = document.getElementById('completedCourses');
    const inProgressCourses = document.getElementById('inProgressCourses');
    
    // Load progress data
    loadProgressData();
    
    openModal('progressModal');
}

// Load progress data
async function loadProgressData() {
    try {
        const currentUser = getCurrentUser();
        const enrollments = await api.get(`/enrollments/student/${currentUser.userId}`);
        
        const totalEnrolledCourses = document.getElementById('totalEnrolledCourses');
        const completedCourses = document.getElementById('completedCourses');
        const inProgressCourses = document.getElementById('inProgressCourses');
        
        if (totalEnrolledCourses) totalEnrolledCourses.textContent = enrollments.length;
        
        // For demo purposes, consider approved enrollments as completed
        const completedCount = enrollments.filter(e => e.status === 'Approved').length;
        if (completedCourses) completedCourses.textContent = completedCount;
        
        // Pending enrollments as in progress
        const inProgressCount = enrollments.filter(e => e.status === 'Pending').length;
        if (inProgressCourses) inProgressCourses.textContent = inProgressCount;
        
            } catch (error) {
            // Silent error for progress data
        }
}

// Enroll in course from dashboard
async function enrollInCourse(courseId) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showMessage('Vui lòng đăng nhập để đăng ký khóa học.', 'error');
        return;
    }
    
    if (!confirm('Bạn có chắc chắn muốn đăng ký khóa học này?')) {
        return;
    }
    
    try {
        showLoading();
        const enrollmentData = {
            studentId: currentUser.userId,
            courseId: courseId
        };
        
        await api.post('/enrollments', enrollmentData);
        showMessage('Đăng ký khóa học thành công!', 'success');
        
        // Reload dashboard to update stats
        setTimeout(() => {
            loadStudentDashboard();
        }, 1000);
        
    } catch (error) {
        if (error.message.includes('409')) {
            showMessage('Bạn đã đăng ký khóa học này rồi.', 'error');
        } else {
            showMessage('Không thể đăng ký khóa học. Vui lòng thử lại.', 'error');
        }
    } finally {
        hideLoading();
    }
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
window.showProfile = showProfile;
window.showProgress = showProgress;
window.enrollInCourse = enrollInCourse;
