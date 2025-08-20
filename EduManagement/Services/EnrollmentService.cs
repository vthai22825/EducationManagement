using EduManagementAPI.Data;
using EduManagementAPI.DTOs;
using EduManagementAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace EduManagementAPI.Services
{
    public interface IEnrollmentService
    {
        Task<List<EnrollmentDto>> GetAll();
        Task<List<EnrollmentDto>> GetByStudent(int studentId);
        Task<EnrollmentDto?> Enroll(CreateEnrollmentDto dto);
        Task<EnrollmentDto?> UpdateStatus(int enrollmentId, string status);
    }

    public class EnrollmentService : IEnrollmentService
    {
        private readonly AppDbContext _context;
        public EnrollmentService(AppDbContext context) => _context = context;

        public async Task<List<EnrollmentDto>> GetAll()
        {
            return await _context.Enrollments
                .Select(e => new EnrollmentDto
                {
                    EnrollmentId = e.EnrollmentId,
                    CourseId = e.CourseId,
                    StudentId = e.StudentId,
                    Status = e.Status
                })
                .ToListAsync();
        }

        public async Task<List<EnrollmentDto>> GetByStudent(int studentId)
        {
            return await _context.Enrollments
                .Where(e => e.StudentId == studentId)
                .Select(e => new EnrollmentDto
                {
                    EnrollmentId = e.EnrollmentId,
                    CourseId = e.CourseId,
                    StudentId = e.StudentId,
                    Status = e.Status
                })
                .ToListAsync();
        }

        public async Task<EnrollmentDto?> Enroll(CreateEnrollmentDto dto)
        {
            // Check nếu đã tồn tại enrollment cho StudentId + CourseId
            bool exists = await _context.Enrollments
                .AnyAsync(e => e.CourseId == dto.CourseId && e.StudentId == dto.StudentId);

            if (exists)
            {
                return null; // đã tồn tại, controller sẽ handle
            }

            var enrollment = new Enrollment
            {
                CourseId = dto.CourseId,
                StudentId = dto.StudentId,
                Status = "Pending" // default
            };

            _context.Enrollments.Add(enrollment);
            await _context.SaveChangesAsync();

            return new EnrollmentDto
            {
                EnrollmentId = enrollment.EnrollmentId,
                CourseId = enrollment.CourseId,
                StudentId = enrollment.StudentId,
                Status = enrollment.Status
            };
        }

        public async Task<EnrollmentDto?> UpdateStatus(int enrollmentId, string status)
        {
            var enrollment = await _context.Enrollments.FindAsync(enrollmentId);
            if (enrollment == null) return null;

            // validate status (Pending, Approved, Rejected)
            var validStatuses = new[] { "Pending", "Approved", "Rejected" };
            if (!validStatuses.Contains(status))
            {
                return null; // invalid status
            }

            enrollment.Status = status;
            await _context.SaveChangesAsync();

            return new EnrollmentDto
            {
                EnrollmentId = enrollment.EnrollmentId,
                CourseId = enrollment.CourseId,
                StudentId = enrollment.StudentId,
                Status = enrollment.Status
            };
        }
    }
}
