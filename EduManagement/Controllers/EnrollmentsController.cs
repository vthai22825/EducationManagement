using EduManagementAPI.DTOs;
using EduManagementAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace EduManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EnrollmentsController : ControllerBase
    {
        private readonly IEnrollmentService _service;
        public EnrollmentsController(IEnrollmentService service) => _service = service;

        [HttpGet]
        public async Task<ActionResult<List<EnrollmentDto>>> GetAll()
            => Ok(await _service.GetAll());

        [HttpGet("student/{studentId}")]
        public async Task<ActionResult<List<EnrollmentDto>>> GetByStudent(int studentId)
            => Ok(await _service.GetByStudent(studentId));

        [HttpPost]
        public async Task<ActionResult<EnrollmentDto>> Enroll(CreateEnrollmentDto dto)
        {
            var enrollment = await _service.Enroll(dto);
            if (enrollment == null) return Conflict("Student already enrolled in this course.");
            return Ok(enrollment);
        }

        [HttpPut("{id}/status")]
        public async Task<ActionResult<EnrollmentDto>> UpdateStatus(int id, [FromQuery] string status)
        {
            var updated = await _service.UpdateStatus(id, status);
            if (updated == null) return BadRequest("Invalid enrollment ID or status.");
            return Ok(updated);
        }
    }
}
