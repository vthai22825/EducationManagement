using EduManagementAPI.DTOs;
using EduManagementAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Instructor")]
    public class AdminController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly ICourseService _courseService;
        private readonly IEnrollmentService _enrollmentService;

        public AdminController(
            IUserService userService,
            ICourseService courseService,
            IEnrollmentService enrollmentService)
        {
            _userService = userService;
            _courseService = courseService;
            _enrollmentService = enrollmentService;
        }

        // Dashboard Statistics
        [HttpGet("dashboard/stats")]
        public async Task<ActionResult<AdminDashboardStats>> GetDashboardStats()
        {
            try
            {
                var users = await _userService.GetAll();
                var courses = await _courseService.GetAll();
                var enrollments = await _enrollmentService.GetAll();

                var stats = new AdminDashboardStats
                {
                    TotalUsers = users.Count,
                    TotalCourses = courses.Count,
                    TotalEnrollments = enrollments.Count,
                    PendingEnrollments = enrollments.Count(e => e.Status == "Pending"),
                    Students = users.Count(u => u.Role == "Student"),
                    Instructors = users.Count(u => u.Role == "Instructor"),
                    ApprovedEnrollments = enrollments.Count(e => e.Status == "Approved"),
                    RejectedEnrollments = enrollments.Count(e => e.Status == "Rejected")
                };

                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving dashboard stats", error = ex.Message });
            }
        }

        // User Management
        [HttpGet("users")]
        public async Task<ActionResult<List<UserDto>>> GetAllUsers()
        {
            try
            {
                var users = await _userService.GetAll();
                return Ok(users);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving users", error = ex.Message });
            }
        }

        [HttpGet("users/{id}")]
        public async Task<ActionResult<UserDto>> GetUserById(int id)
        {
            try
            {
                var user = await _userService.GetById(id);
                if (user == null) return NotFound(new { message = "User not found" });
                return Ok(user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving user", error = ex.Message });
            }
        }

        [HttpPost("users")]
        public async Task<ActionResult<UserDto>> CreateUser(UserRegisterDto dto)
        {
            try
            {
                var user = await _userService.Register(dto);
                if (user == null) return Conflict(new { message = "Username already exists" });
                return CreatedAtAction(nameof(GetUserById), new { id = user.UserId }, user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating user", error = ex.Message });
            }
        }

        // Course Management
        [HttpGet("courses")]
        public async Task<ActionResult<List<CourseDto>>> GetAllCourses()
        {
            try
            {
                var courses = await _courseService.GetAll();
                return Ok(courses);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving courses", error = ex.Message });
            }
        }

        [HttpGet("courses/{id}")]
        public async Task<ActionResult<CourseDto>> GetCourseById(int id)
        {
            try
            {
                var course = await _courseService.GetById(id);
                if (course == null) return NotFound(new { message = "Course not found" });
                return Ok(course);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving course", error = ex.Message });
            }
        }

        [HttpPost("courses")]
        public async Task<ActionResult<CourseDto>> CreateCourse(CreateCourseDto dto)
        {
            try
            {
                var course = await _courseService.Create(dto);
                return CreatedAtAction(nameof(GetCourseById), new { id = course.CourseId }, course);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating course", error = ex.Message });
            }
        }

        [HttpPut("courses/{id}")]
        public async Task<ActionResult<CourseDto>> UpdateCourse(int id, UpdateCourseDto dto)
        {
            try
            {
                var course = await _courseService.Update(id, dto);
                if (course == null) return NotFound(new { message = "Course not found" });
                return Ok(course);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating course", error = ex.Message });
            }
        }

        [HttpDelete("courses/{id}")]
        public async Task<ActionResult> DeleteCourse(int id)
        {
            try
            {
                var result = await _courseService.Delete(id);
                if (!result) return NotFound(new { message = "Course not found" });
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error deleting course", error = ex.Message });
            }
        }

        // Enrollment Management
        [HttpGet("enrollments")]
        public async Task<ActionResult<List<EnrollmentDto>>> GetAllEnrollments()
        {
            try
            {
                var enrollments = await _enrollmentService.GetAll();
                return Ok(enrollments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving enrollments", error = ex.Message });
            }
        }

        [HttpGet("enrollments/pending")]
        public async Task<ActionResult<List<EnrollmentDto>>> GetPendingEnrollments()
        {
            try
            {
                var enrollments = await _enrollmentService.GetAll();
                var pendingEnrollments = enrollments.Where(e => e.Status == "Pending").ToList();
                return Ok(pendingEnrollments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving pending enrollments", error = ex.Message });
            }
        }

        [HttpPut("enrollments/{id}/approve")]
        public async Task<ActionResult<EnrollmentDto>> ApproveEnrollment(int id)
        {
            try
            {
                var enrollment = await _enrollmentService.UpdateStatus(id, "Approved");
                if (enrollment == null) return NotFound(new { message = "Enrollment not found" });
                return Ok(enrollment);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error approving enrollment", error = ex.Message });
            }
        }

        [HttpPut("enrollments/{id}/reject")]
        public async Task<ActionResult<EnrollmentDto>> RejectEnrollment(int id)
        {
            try
            {
                var enrollment = await _enrollmentService.UpdateStatus(id, "Rejected");
                if (enrollment == null) return NotFound(new { message = "Enrollment not found" });
                return Ok(enrollment);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error rejecting enrollment", error = ex.Message });
            }
        }

        // Reports
        [HttpGet("reports/users")]
        public async Task<ActionResult<UserReport>> GetUserReport()
        {
            try
            {
                var users = await _userService.GetAll();
                var report = new UserReport
                {
                    TotalUsers = users.Count,
                    Students = users.Count(u => u.Role == "Student"),
                    Instructors = users.Count(u => u.Role == "Instructor"),
                    RecentUsers = users.Take(5).ToList()
                };
                return Ok(report);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating user report", error = ex.Message });
            }
        }

        [HttpGet("reports/enrollments")]
        public async Task<ActionResult<EnrollmentReport>> GetEnrollmentReport()
        {
            try
            {
                var enrollments = await _enrollmentService.GetAll();
                var report = new EnrollmentReport
                {
                    TotalEnrollments = enrollments.Count,
                    PendingEnrollments = enrollments.Count(e => e.Status == "Pending"),
                    ApprovedEnrollments = enrollments.Count(e => e.Status == "Approved"),
                    RejectedEnrollments = enrollments.Count(e => e.Status == "Rejected"),
                    RecentEnrollments = enrollments.Take(10).ToList()
                };
                return Ok(report);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating enrollment report", error = ex.Message });
            }
        }
    }

    // DTOs for Admin APIs
    public class AdminDashboardStats
    {
        public int TotalUsers { get; set; }
        public int TotalCourses { get; set; }
        public int TotalEnrollments { get; set; }
        public int PendingEnrollments { get; set; }
        public int Students { get; set; }
        public int Instructors { get; set; }
        public int ApprovedEnrollments { get; set; }
        public int RejectedEnrollments { get; set; }
    }

    public class UserReport
    {
        public int TotalUsers { get; set; }
        public int Students { get; set; }
        public int Instructors { get; set; }
        public List<UserDto> RecentUsers { get; set; } = new();
    }

    public class EnrollmentReport
    {
        public int TotalEnrollments { get; set; }
        public int PendingEnrollments { get; set; }
        public int ApprovedEnrollments { get; set; }
        public int RejectedEnrollments { get; set; }
        public List<EnrollmentDto> RecentEnrollments { get; set; } = new();
    }
}
