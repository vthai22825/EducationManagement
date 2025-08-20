using System.Security.Cryptography;
using System.Text;
using EduManagementAPI.Data;
using EduManagementAPI.DTOs;
using EduManagementAPI.Models;
using Microsoft.EntityFrameworkCore;


namespace EduManagementAPI.Services
{
    public interface IUserService
    {
        Task<UserDto?> Register(UserRegisterDto dto);
        Task<User?> Authenticate(string username, string password);
        Task<List<UserDto>> GetAll();
        Task<UserDto?> GetById(int id);
    }

    public class UserService : IUserService
    {
        private readonly AppDbContext _context;
        public UserService(AppDbContext context) => _context = context;

        public async Task<UserDto?> Register(UserRegisterDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.UserName == dto.UserName))
                return null;

            var user = new User
            {
                UserName = dto.UserName,
                UserPassword = HashPassword(dto.UserPassword),
                FullName = dto.FullName,
                Role = dto.Role
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return new UserDto
            {
                UserId = user.UserId,
                UserName = user.UserName,
                FullName = user.FullName,
                Role = user.Role
            };
        }
        public async Task<User?> Authenticate(string username, string password)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == username);
            if (user == null) return null;
            return VerifyPassword(password, user.UserPassword) ? user : null;
        }

        public async Task<List<UserDto>> GetAll()
        {
            return await _context.Users
            .Select(u => new UserDto
            {
                UserId = u.UserId,
                UserName = u.UserName,
                FullName = u.FullName,
                Role = u.Role
            })
            .ToListAsync();
        }

        public async Task<UserDto?> GetById(int id)
        {
            var u = await _context.Users.FindAsync(id);
            if (u == null) return null;
            return new UserDto
            {
                UserId = u.UserId,
                UserName = u.UserName,
                FullName = u.FullName,
                Role = u.Role
            };
        }

        private static string HashPassword(string password)
        {
            using var sha = SHA256.Create();
            var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }

        private static bool VerifyPassword(string password, string hashed)
            => HashPassword(password) == hashed;
    }
}