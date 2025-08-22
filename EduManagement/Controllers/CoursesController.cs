using EduManagementAPI.DTOs;
using EduManagementAPI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace EduManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CoursesController : ControllerBase
    {
        private readonly ICourseService _service;
        public CoursesController(ICourseService service) => _service = service;

        [HttpGet]
        public async Task<ActionResult<List<CourseDto>>> GetAll()
            => Ok(await _service.GetAll());

        [HttpGet("{id}")]
        public async Task<ActionResult<CourseDto>> GetById(int id)
        {
            var course = await _service.GetById(id);
            if (course == null) return NotFound();
            return Ok(course);
        }

        [HttpPost]
        [Authorize(Roles = "Instructor")]
        public async Task<ActionResult<CourseDto>> Create(CreateCourseDto dto)
        {
            var course = await _service.Create(dto);
            return CreatedAtAction(nameof(GetById), new { id = course.CourseId }, course);
        }
    }
}
