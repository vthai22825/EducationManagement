# Frontend - Hệ Thống Quản Lý Giáo Dục

## Tổng quan

Frontend của hệ thống quản lý giáo dục được xây dựng bằng HTML, CSS và JavaScript thuần, tương thích với backend ASP.NET Core API.

## Cấu trúc thư mục

```
frontend/
├── css/
│   ├── style.css          # CSS chính cho toàn bộ ứng dụng
│   ├── auth.css           # CSS cho trang đăng nhập/đăng ký
│   ├── courses.css        # CSS cho trang khóa học
│   ├── users.css          # CSS cho trang người dùng
│   └── enrollments.css    # CSS cho trang đăng ký
├── js/
│   ├── main.js            # JavaScript chính và API utilities
│   ├── auth.js            # Xử lý đăng nhập/đăng ký và phân quyền
│   ├── dashboard.js       # Xử lý trang chủ và thống kê
│   ├── courses.js         # Xử lý trang khóa học
│   ├── users.js           # Xử lý trang người dùng
│   └── enrollments.js     # Xử lý trang đăng ký
├── images/                # Thư mục chứa hình ảnh
├── index.html             # Trang chủ
├── login.html             # Trang đăng nhập/đăng ký
├── courses.html           # Trang quản lý khóa học
├── users.html             # Trang quản lý người dùng
├── enrollments.html       # Trang quản lý đăng ký
└── README.md              # File hướng dẫn này
```

## Phân quyền người dùng

### 1. Admin (Instructor)
- **Quyền truy cập:**
  - Xem tất cả khóa học
  - Thêm/sửa/xóa khóa học
  - Xem tất cả người dùng
  - Xem tất cả đăng ký
  - Duyệt/từ chối đăng ký
  - Thêm đăng ký cho sinh viên

- **Trang có thể truy cập:**
  - Trang chủ (dashboard)
  - Quản lý khóa học
  - Quản lý người dùng
  - Quản lý đăng ký

### 2. Student (Sinh viên)
- **Quyền truy cập:**
  - Xem danh sách khóa học
  - Đăng ký khóa học
  - Xem đăng ký của mình
  - Hủy đăng ký (nếu chưa được duyệt)

- **Trang có thể truy cập:**
  - Trang chủ (dashboard)
  - Xem khóa học
  - Xem đăng ký khóa học của mình

### 3. Khách (Chưa đăng nhập)
- **Quyền truy cập:**
  - Xem trang chủ
  - Đăng nhập/đăng ký

- **Trang có thể truy cập:**
  - Trang chủ
  - Trang đăng nhập

## Cách sử dụng

### 1. Khởi chạy
1. Đảm bảo backend đang chạy trên `http://localhost:5071`
2. Mở file `index.html` trong trình duyệt
3. Hoặc sử dụng live server để chạy local

### 2. Đăng ký tài khoản
1. Truy cập trang đăng nhập
2. Chọn tab "Đăng ký"
3. Điền thông tin:
   - Tên đăng nhập
   - Họ và tên
   - Mật khẩu
   - Vai trò (Student/Instructor)
4. Nhấn "Đăng ký"

### 3. Đăng nhập
1. Truy cập trang đăng nhập
2. Điền tên đăng nhập và mật khẩu
3. Nhấn "Đăng nhập"

### 4. Sử dụng hệ thống

#### Cho Admin:
- **Quản lý khóa học:** Thêm, xem, xóa khóa học
- **Quản lý người dùng:** Xem danh sách người dùng
- **Quản lý đăng ký khóa học:** Duyệt/từ chối đăng ký của sinh viên

#### Cho Sinh viên:
- **Xem khóa học:** Duyệt danh sách khóa học có sẵn
- **Đăng ký khóa học:** Đăng ký khóa học mới
- **Xem đăng ký khóa học:** Theo dõi trạng thái đăng ký

## API Endpoints

Frontend sử dụng các API endpoints sau:

### Users
- `POST /api/users/register` - Đăng ký người dùng mới
- `POST /api/users/login` - Đăng nhập
- `GET /api/users` - Lấy danh sách người dùng
- `GET /api/users/{id}` - Lấy thông tin người dùng

### Courses
- `GET /api/courses` - Lấy danh sách khóa học
- `GET /api/courses/{id}` - Lấy thông tin khóa học
- `POST /api/courses` - Tạo khóa học mới

### Enrollments
- `GET /api/enrollments` - Lấy danh sách đăng ký
- `GET /api/enrollments/student/{studentId}` - Lấy đăng ký của sinh viên
- `POST /api/enrollments` - Tạo đăng ký mới
- `PUT /api/enrollments/{id}/status` - Cập nhật trạng thái đăng ký

## Tính năng chính

### 1. Responsive Design
- Giao diện tương thích với mọi thiết bị
- Mobile-first approach
- Navigation menu responsive

### 2. Authentication & Authorization
- Hệ thống đăng nhập/đăng ký
- Phân quyền dựa trên vai trò
- Bảo vệ trang theo quyền truy cập

### 3. Real-time Updates
- Cập nhật dữ liệu real-time
- Thông báo thành công/lỗi
- Loading states

### 4. Search & Filter
- Tìm kiếm khóa học, người dùng, đăng ký
- Lọc theo trạng thái, vai trò
- Tìm kiếm nhanh

### 5. Modal Dialogs
- Form thêm/sửa dữ liệu
- Xem chi tiết
- Xác nhận hành động

## Cấu hình

### API Base URL
Mặc định: `http://localhost:5071/api`
Có thể thay đổi trong file `js/main.js`:

```javascript
const API_BASE_URL = 'http://localhost:5071/api';
```

### Local Storage
Hệ thống sử dụng localStorage để lưu:
- Thông tin người dùng đăng nhập
- Token authentication (nếu có)

## Troubleshooting

### 1. Lỗi kết nối API
- Kiểm tra backend có đang chạy không
- Kiểm tra URL API có đúng không
- Kiểm tra CORS configuration

### 2. Lỗi đăng nhập
- Kiểm tra thông tin đăng nhập
- Xóa localStorage và thử lại
- Kiểm tra console để xem lỗi

### 3. Lỗi hiển thị
- Kiểm tra console browser
- Kiểm tra network tab
- Refresh trang và thử lại

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Development

### Cấu trúc JavaScript
- **main.js:** Utilities, API calls, common functions
- **auth.js:** Authentication, authorization, navigation
- **dashboard.js:** Homepage statistics and content
- **courses.js:** Course management functionality
- **users.js:** User management functionality
- **enrollments.js:** Enrollment management functionality

### Cấu trúc CSS
- **style.css:** Global styles, layout, components
- **auth.css:** Login/register page styles
- **courses.css:** Course page specific styles
- **users.css:** User page specific styles
- **enrollments.css:** Enrollment page specific styles

## Contributing

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## License

MIT License - xem file LICENSE để biết thêm chi tiết.
