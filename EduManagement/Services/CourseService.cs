using EduManagementAPI.Data;
using EduManagementAPI.DTOs;
using EduManagementAPI.Models;
using Microsoft.EntityFrameworkCore;


namespace EduManagementAPI.Services
{
    public interface ICourseService
    {
        Task<List<CourseDto>> GetAll();
        Task<CourseDto?> GetById(int id);
        Task<CourseDto> Create(CreateCourseDto dto);
        Task<CourseDto?> Update(int id, UpdateCourseDto dto);
        Task<bool> Delete(int id);
    }

    public class CourseService : ICourseService
    {
        private readonly AppDbContext _context;
        public CourseService(AppDbContext context) => _context = context;

        public async Task<List<CourseDto>> GetAll()
        {
            return await _context.Courses
            .Select(c => new CourseDto
            {
                CourseId = c.CourseId,
                Title = c.Title,
                Description = c.Description
            })
            .ToListAsync();
        }

        public async Task<CourseDto?> GetById(int id)
        {
            var c = await _context.Courses.FindAsync(id);
            if (c == null) return null;
            return new CourseDto { CourseId = c.CourseId, Title = c.Title, Description = c.Description };
        }

        public async Task<CourseDto> Create(CreateCourseDto dto)
        {
            var c = new Course { Title = dto.Title, Description = dto.Description };
            _context.Courses.Add(c);
            await _context.SaveChangesAsync();
            return new CourseDto { CourseId = c.CourseId, Title = c.Title, Description = c.Description };
        }

        public async Task<CourseDto?> Update(int id, UpdateCourseDto dto)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null) return null;

            course.Title = dto.Title;
            course.Description = dto.Description;
            
            await _context.SaveChangesAsync();
            return new CourseDto { CourseId = course.CourseId, Title = course.Title, Description = course.Description };
        }

        public async Task<bool> Delete(int id)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null) return false;

            _context.Courses.Remove(course);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}