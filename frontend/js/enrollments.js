// Enrollments functionality
let enrollments = [];
let filteredEnrollments = [];
let users = [];
let courses = [];

document.addEventListener('DOMContentLoaded', () => {
    loadEnrollments();
    loadUsersAndCourses();
    initEnrollmentModal();
    initStatusModal();
    initEnrollmentSearch();
    initStatusFilter();
    updatePagePermissions();
});

// Update page permissions based on user role
function updatePagePermissions() {
    const currentUser = getCurrentUser();
    const addEnrollmentBtn = document.getElementById('addEnrollmentBtn');
    
            if (addEnrollmentBtn) {
            if (currentUser && currentUser.role === 'Instructor') {
                // Admin can add enrollments
                addEnrollmentBtn.style.display = 'inline-block';
            } else if (currentUser && currentUser.role === 'Student') {
                // Students can enroll themselves
                addEnrollmentBtn.style.display = 'inline-block';
                addEnrollmentBtn.innerHTML = '<i class="fas fa-plus"></i> Đăng ký khóa học mới';
            } else {
                // Not logged in
                addEnrollmentBtn.style.display = 'none';
            }
        }
}

// Load enrollments from API
async function loadEnrollments() {
    try {
        showLoading();
        const currentUser = getCurrentUser();
        
        if (currentUser && currentUser.role === 'Student') {
            // Students can only see their own enrollments
            enrollments = await api.get(`/enrollments/student/${currentUser.userId}`);
        } else if (currentUser && currentUser.role === 'Instructor') {
            // Admin can see all enrollments
            enrollments = await api.get('/admin/enrollments');
        } else {
            // Not logged in - show empty
            enrollments = [];
        }
        
        filteredEnrollments = [...enrollments];
        displayEnrollments();
    } catch (error) {
        showMessage('Không thể tải danh sách đăng ký.', 'error');
        enrollments = [];
        filteredEnrollments = [];
        displayEnrollments();
    } finally {
        hideLoading();
    }
}

// Load users and courses for dropdowns
async function loadUsersAndCourses() {
    try {
        const currentUser = getCurrentUser();
        
        if (currentUser && currentUser.role === 'Instructor') {
            // Admin can see all users and courses
            const [usersData, coursesData] = await Promise.all([
                api.get('/admin/users'),
                api.get('/admin/courses')
            ]);
            
            users = usersData.filter(user => user.role === 'Student');
            courses = coursesData;
        } else if (currentUser && currentUser.role === 'Student') {
            // Students can only see courses
            courses = await api.get('/courses');
            users = [currentUser]; // Only show current user
        } else {
            // Not logged in
            courses = [];
            users = [];
        }
        
        populateDropdowns();
    } catch (error) {
        courses = [];
        users = [];
        populateDropdowns();
    }
}

// Populate dropdowns in forms
function populateDropdowns() {
    const currentUser = getCurrentUser();
    const studentSelect = document.getElementById('enrollmentStudent');
    const courseSelect = document.getElementById('enrollmentCourse');
    
    if (studentSelect) {
        if (currentUser && currentUser.role === 'Instructor') {
            // Admin can select any student
            studentSelect.innerHTML = '<option value="">Chọn sinh viên</option>' +
                users.map(user => `<option value="${user.userId}">${user.fullName} (${user.userName})</option>`).join('');
        } else {
            // Students can only enroll themselves
            studentSelect.innerHTML = `<option value="${currentUser.userId}">${currentUser.fullName} (${currentUser.userName})</option>`;
            studentSelect.disabled = true;
        }
    }
    
    if (courseSelect) {
        courseSelect.innerHTML = '<option value="">Chọn khóa học</option>' +
            courses.map(course => `<option value="${course.courseId}">${course.title}</option>`).join('');
    }
}

// Display enrollments in table
function displayEnrollments() {
    const enrollmentsTableBody = document.getElementById('enrollmentsTableBody');
    const noEnrollments = document.getElementById('noEnrollments');
    
    if (!enrollmentsTableBody) return;
    
    if (filteredEnrollments.length === 0) {
        enrollmentsTableBody.innerHTML = '';
        if (noEnrollments) noEnrollments.style.display = 'block';
        return;
    }
    
    if (noEnrollments) noEnrollments.style.display = 'none';
    
    const currentUser = getCurrentUser();
    
    enrollmentsTableBody.innerHTML = filteredEnrollments.map(enrollment => {
        const student = users.find(u => u.userId === enrollment.studentId);
        const course = courses.find(c => c.courseId === enrollment.courseId);
        
        return `
            <tr>
                <td>${enrollment.enrollmentId}</td>
                <td>${student ? student.fullName : 'N/A'}</td>
                <td>${course ? course.title : 'N/A'}</td>
                <td>
                    <span class="enrollment-status ${enrollment.status.toLowerCase()}">
                        ${formatStatus(enrollment.status)}
                    </span>
                </td>
                <td>
                    <div class="enrollment-actions">
                        ${currentUser && currentUser.role === 'Instructor' ? `
                            <button class="btn btn-primary" onclick="updateEnrollmentStatus(${enrollment.enrollmentId}, '${enrollment.status}')">
                                <i class="fas fa-edit"></i> Cập nhật
                            </button>
                        ` : ''}
                        ${currentUser && currentUser.role === 'Student' && enrollment.status === 'Pending' ? `
                            <button class="btn btn-danger" onclick="cancelEnrollment(${enrollment.enrollmentId})">
                                <i class="fas fa-times"></i> Hủy
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Initialize enrollment modal
function initEnrollmentModal() {
    const addEnrollmentBtn = document.getElementById('addEnrollmentBtn');
    const addEnrollmentForm = document.getElementById('addEnrollmentForm');
    
    if (addEnrollmentBtn) {
        addEnrollmentBtn.addEventListener('click', () => {
            const currentUser = getCurrentUser();
            if (!currentUser) {
                showMessage('Vui lòng đăng nhập để đăng ký khóa học.', 'error');
                return;
            }
            openModal('addEnrollmentModal');
        });
    }
    
            if (addEnrollmentForm) {
            addEnrollmentForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const currentUser = getCurrentUser();
                if (!currentUser) {
                    showMessage('Vui lòng đăng nhập để đăng ký khóa học.', 'error');
                    return;
                }
                
                const formData = new FormData(addEnrollmentForm);
                const enrollmentData = {
                    studentId: parseInt(formData.get('studentId')),
                    courseId: parseInt(formData.get('courseId'))
                };
                
                // Validate data
                if (!enrollmentData.studentId || !enrollmentData.courseId) {
                    showMessage('Vui lòng chọn sinh viên và khóa học.', 'error');
                    return;
                }
                
                try {
                    showLoading();
                    const newEnrollment = await api.post('/enrollments', enrollmentData);
                    
                    enrollments.push(newEnrollment);
                    filteredEnrollments = [...enrollments];
                    displayEnrollments();
                    
                    closeModal('addEnrollmentModal');
                    addEnrollmentForm.reset();
                    showMessage('Đăng ký khóa học thành công!', 'success');
                    
                } catch (error) {
                    if (error.message.includes('409')) {
                        showMessage('Sinh viên đã đăng ký khóa học này.', 'error');
                    } else {
                        showMessage('Không thể đăng ký khóa học. Vui lòng thử lại.', 'error');
                    }
                } finally {
                    hideLoading();
                }
            });
        }
}

// Initialize status update modal
function initStatusModal() {
    const updateStatusForm = document.getElementById('updateStatusForm');
    
    if (updateStatusForm) {
        updateStatusForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Check if user is admin
            if (!isAdmin()) {
                showMessage('Bạn không có quyền cập nhật trạng thái.', 'error');
                return;
            }
            
            const formData = new FormData(updateStatusForm);
            const status = formData.get('status');
            const enrollmentId = updateStatusForm.dataset.enrollmentId;
            
            try {
                showLoading();
                await api.put(`/admin/enrollments/${enrollmentId}/approve`, {});
                
                // Update local data
                const enrollmentIndex = enrollments.findIndex(e => e.enrollmentId === parseInt(enrollmentId));
                if (enrollmentIndex !== -1) {
                    enrollments[enrollmentIndex].status = status;
                    filteredEnrollments = [...enrollments];
                    displayEnrollments();
                }
                
                closeModal('updateStatusModal');
                showMessage('Cập nhật trạng thái thành công!', 'success');
                
            } catch (error) {
                showMessage('Không thể cập nhật trạng thái.', 'error');
            } finally {
                hideLoading();
            }
        });
    }
}

// Initialize enrollment search
function initEnrollmentSearch() {
    const searchInput = document.getElementById('enrollmentSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            filterEnrollments(searchTerm);
        });
    }
}

// Initialize status filter
function initStatusFilter() {
    const filterSelect = document.getElementById('statusFilter');
    if (filterSelect) {
        filterSelect.addEventListener('change', (e) => {
            const filterValue = e.target.value;
            filterEnrollmentsByStatus(filterValue);
        });
    }
}

// Filter enrollments by search term
function filterEnrollments(searchTerm) {
    filteredEnrollments = enrollments.filter(enrollment => {
        const student = users.find(u => u.userId === enrollment.studentId);
        const course = courses.find(c => c.courseId === enrollment.courseId);
        
        return (
            student?.fullName.toLowerCase().includes(searchTerm) ||
            student?.userName.toLowerCase().includes(searchTerm) ||
            course?.title.toLowerCase().includes(searchTerm) ||
            enrollment.enrollmentId.toString().includes(searchTerm)
        );
    });
    displayEnrollments();
}

// Filter enrollments by status
function filterEnrollmentsByStatus(status) {
    if (!status) {
        filteredEnrollments = [...enrollments];
    } else {
        filteredEnrollments = enrollments.filter(enrollment => enrollment.status === status);
    }
    displayEnrollments();
}

// Update enrollment status (admin only)
function updateEnrollmentStatus(enrollmentId, currentStatus) {
    if (!isAdmin()) {
        showMessage('Bạn không có quyền cập nhật trạng thái.', 'error');
        return;
    }
    
    const updateStatusForm = document.getElementById('updateStatusForm');
    const statusSelect = document.getElementById('enrollmentStatus');
    
    if (updateStatusForm && statusSelect) {
        updateStatusForm.dataset.enrollmentId = enrollmentId;
        statusSelect.value = currentStatus;
        openModal('updateStatusModal');
    }
}

// Cancel enrollment (student only)
async function cancelEnrollment(enrollmentId) {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'Student') {
        showMessage('Bạn không có quyền hủy đăng ký.', 'error');
        return;
    }
    
    if (!confirm('Bạn có chắc chắn muốn hủy đăng ký này?')) {
        return;
    }
    
    try {
        showLoading();
        // Remove from local array
        enrollments = enrollments.filter(e => e.enrollmentId !== enrollmentId);
        filteredEnrollments = [...enrollments];
        displayEnrollments();
        showMessage('Đã hủy đăng ký thành công!', 'success');
    } catch (error) {
        showMessage('Không thể hủy đăng ký.', 'error');
    } finally {
        hideLoading();
    }
}

// Export functions
window.updateEnrollmentStatus = updateEnrollmentStatus;
window.cancelEnrollment = cancelEnrollment;
