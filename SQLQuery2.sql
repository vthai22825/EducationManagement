create database EduManagementDB
go

use EduManagementDB
go

CREATE TABLE Users (
    UserId INT IDENTITY(1,1) PRIMARY KEY,
	UserName nvarchar(50) not null,
    UserPassword NVARCHAR(255) NOT NULL,
	FullName NVARCHAR(100) NOT NULL,
    Role NVARCHAR(20) NOT NULL CHECK (Role IN ('Student', 'Instructor')),
);

CREATE TABLE Courses (
    CourseId INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX),
);

CREATE TABLE Enrollments (
    EnrollmentId INT IDENTITY(1,1) PRIMARY KEY,
    CourseId INT NOT NULL,
    StudentId INT NOT NULL,
    Status NVARCHAR(20) NOT NULL CHECK (Status IN ('Pending', 'Approved', 'Rejected')) DEFAULT 'Pending',
    FOREIGN KEY (CourseId) REFERENCES Courses(CourseId),
    FOREIGN KEY (StudentId) REFERENCES Users(UserId),
    CONSTRAINT UQ_Enrollment UNIQUE (CourseId, StudentId) -- tránh đăng ký trùng
);