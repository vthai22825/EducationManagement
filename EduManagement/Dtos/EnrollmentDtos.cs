namespace EduManagementAPI.DTOs
{
    public class CreateEnrollmentDto
    {
        public int CourseId { get; set; }
        public int StudentId { get; set; } // will be taken from token in Student endpoints, but kept for flexibility
    }


    public class EnrollmentDto
    {
        public int EnrollmentId { get; set; }
        public int CourseId { get; set; }
        public int StudentId { get; set; }
        public string Status { get; set; } = "Pending";
    }


    public class UpdateEnrollmentStatusDto
    {
        public string Status { get; set; } = "Pending"; // Approved | Rejected
    }
}