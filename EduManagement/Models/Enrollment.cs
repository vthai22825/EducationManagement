namespace EduManagementAPI.Models
{
    public class Enrollment
    {
        public int EnrollmentId { get; set; }
        public int CourseId { get; set; }
        public int StudentId { get; set; }
        public string Status { get; set; } = "Pending"; // Pending | Approved | Rejected
    }
}