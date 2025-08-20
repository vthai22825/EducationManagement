namespace EduManagementAPI.Models
{
    public class User
    {
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string UserPassword { get; set; } = string.Empty; // SHA256 hash stored
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = "Student"; // Student | Instructor
    }
}