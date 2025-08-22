// Courses functionality
let courses = [];
let filteredCourses = [];

document.addEventListener('DOMContentLoaded', () => {
    loadCourses();
    initCourseModal();
    initCourseSearch();
    updatePagePermissions();
});

// Update page permissions based on user role
function updatePagePermissions() {
    const currentUser = getCurrentUser();
    const addCourseBtn = document.getElementById('addCourseBtn');
    
    if (addCourseBtn) {
        if (currentUser && currentUser.role === 'Instructor') {
            // Admin can add courses
            addCourseBtn.style.display = 'inline-block';
        } else {
            // Students cannot add courses
            addCourseBtn.style.display = 'none';
        }
    }
}

// Load courses from API
async function loadCourses() {
    try {
        showLoading();
        courses = await api.get('/courses');
        filteredCourses = [...courses];
        displayCourses();
    } catch (error) {
        showMessage('Không thể tải danh sách khóa học.', 'error');
    } finally {
        hideLoading();
    }
}

// Display courses in grid
function displayCourses() {
    const coursesGrid = document.getElementById('coursesGrid');
    const noCourses = document.getElementById('noCourses');
    
    if (!coursesGrid) return;
    
    if (filteredCourses.length === 0) {
        coursesGrid.style.display = 'none';
        if (noCourses) noCourses.style.display = 'block';
        return;
    }
    
    coursesGrid.style.display = 'grid';
    if (noCourses) noCourses.style.display = 'none';
    
    coursesGrid.innerHTML = filteredCourses.map(course => `
        <div class="course-card" onclick="showCourseDetail(${course.courseId})">
            <div class="course-header">
                <h3>${course.title}</h3>
                <div class="course-id">ID: ${course.courseId}</div>
            </div>
            <div class="course-body">
                <p class="course-description">${course.description || 'Không có mô tả'}</p>
                <div class="course-actions">
                    <button class="btn btn-primary" onclick="event.stopPropagation(); showCourseDetail(${course.courseId})">
                        <i class="fas fa-eye"></i> Chi tiết
                    </button>
                    ${isAdmin() ? `
                        <button class="btn btn-danger" onclick="event.stopPropagation(); deleteCourse(${course.courseId})">
                            <i class="fas fa-trash"></i> Xóa
                        </button>
                    ` : ''}
                    ${!isAdmin() && isLoggedIn() ? `
                        <button class="btn btn-success" onclick="event.stopPropagation(); enrollInCourse(${course.courseId})">
                            <i class="fas fa-plus"></i> Đăng ký
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// Initialize course modal
function initCourseModal() {
    const addCourseBtn = document.getElementById('addCourseBtn');
    const addCourseModal = document.getElementById('addCourseModal');
    const addCourseForm = document.getElementById('addCourseForm');
    
    if (addCourseBtn) {
        addCourseBtn.addEventListener('click', () => {
            // Check if user is admin
            if (!isAdmin()) {
                showMessage('Bạn không có quyền thêm khóa học.', 'error');
                return;
            }
            openModal('addCourseModal');
        });
    }
    
    if (addCourseForm) {
        addCourseForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Check if user is admin
            if (!isAdmin()) {
                showMessage('Bạn không có quyền thêm khóa học.', 'error');
                return;
            }
            
            const formData = new FormData(addCourseForm);
            const courseData = {
                title: formData.get('title'),
                description: formData.get('description')
            };
            
            try {
                showLoading();
                const newCourse = await api.post('/admin/courses', courseData);
                
                courses.push(newCourse);
                filteredCourses = [...courses];
                displayCourses();
                
                closeModal('addCourseModal');
                addCourseForm.reset();
                showMessage('Khóa học đã được thêm thành công!', 'success');
                
            } catch (error) {
                showMessage('Không thể thêm khóa học.', 'error');
            } finally {
                hideLoading();
            }
        });
    }
}

// Initialize course search
function initCourseSearch() {
    const searchInput = document.getElementById('courseSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            filterCourses(searchTerm);
        });
    }
}

// Filter courses
function filterCourses(searchTerm) {
    filteredCourses = courses.filter(course => 
        course.title.toLowerCase().includes(searchTerm) ||
        course.description?.toLowerCase().includes(searchTerm) ||
        course.courseId.toString().includes(searchTerm)
    );
    displayCourses();
}

// Show course detail
async function showCourseDetail(courseId) {
    try {
        const course = await api.get(`/courses/${courseId}`);
        
        // Populate modal with course details
        const modal = document.getElementById('courseDetailModal');
        const title = document.getElementById('courseDetailTitle');
        const name = document.getElementById('courseDetailName');
        const description = document.getElementById('courseDetailDescription');
        
        if (title) title.textContent = `Chi tiết khóa học - ${course.title}`;
        if (name) name.textContent = course.title;
        if (description) description.textContent = course.description || 'Không có mô tả';
        
        // Get enrollment count for this course
        try {
            const enrollments = await api.get('/enrollments');
            const courseEnrollments = enrollments.filter(e => e.courseId === courseId);
            const enrollmentCount = document.getElementById('courseEnrollmentCount');
            if (enrollmentCount) {
                enrollmentCount.textContent = courseEnrollments.length;
            }
        } catch (error) {
            // Silent error for enrollment count
        }
        
        openModal('courseDetailModal');
        
    } catch (error) {
        showMessage('Không thể tải thông tin khóa học.', 'error');
    }
}

// Delete course (admin only)
async function deleteCourse(courseId) {
    if (!isAdmin()) {
        showMessage('Bạn không có quyền xóa khóa học.', 'error');
        return;
    }
    
    if (!confirm('Bạn có chắc chắn muốn xóa khóa học này?')) {
        return;
    }
    
    try {
        showLoading();
        await api.delete(`/admin/courses/${courseId}`);
        
        // Remove from local array
        courses = courses.filter(c => c.courseId !== courseId);
        filteredCourses = [...courses];
        displayCourses();
        showMessage('Khóa học đã được xóa thành công!', 'success');
    } catch (error) {
        showMessage('Không thể xóa khóa học.', 'error');
    } finally {
        hideLoading();
    }
}

// Enroll in course (student only)
async function enrollInCourse(courseId) {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'Student') {
        showMessage('Chỉ sinh viên mới có thể đăng ký khóa học.', 'error');
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
        
        const newEnrollment = await api.post('/enrollments', enrollmentData);
        showMessage('Đăng ký khóa học thành công!', 'success');
        
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

// Export functions
window.showCourseDetail = showCourseDetail;
window.deleteCourse = deleteCourse;
window.enrollInCourse = enrollInCourse;
