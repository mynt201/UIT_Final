# Postman Collection cho User APIs

## 📋 Tổng quan
File `postman-user-api-bodies.json` chứa các request body mẫu để test tất cả User API endpoints.

## 🚀 Cách import vào Postman

### Bước 1: Tạo Collection mới
1. Mở Postman
2. Click **"New"** → **"Collection"**
3. Đặt tên: `Flood Risk User APIs`
4. Thêm description: `Test APIs for user management`

### Bước 2: Tạo Environment Variables
1. Click **"Environments"** (bên trái)
2. Click **"Create Environment"**
3. Đặt tên: `Flood Risk Dev`
4. Thêm variables:
   ```
   base_url = http://localhost:5000
   jwt_token = (để trống, sẽ điền sau khi login)
   admin_jwt_token = (để trống, sẽ điền sau khi login admin)
   user_id = (để trống, sẽ điền sau khi tạo user)
   ```

### Bước 3: Tạo Requests theo thứ tự

#### 1. Register User
- **Method:** POST
- **URL:** `{{base_url}}/api/users/register`
- **Body (raw JSON):**
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "fullName": "Nguyễn Văn Test",
  "phone": "0123456789",
  "address": "123 Đường ABC, Quận 1, TP.HCM"
}
```

#### 2. Login User
- **Method:** POST
- **URL:** `{{base_url}}/api/users/login`
- **Body (raw JSON):**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```
- **Tests (để lưu token):**
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("jwt_token", response.token);
    pm.environment.set("user_id", response.user._id);
}
```

#### 3. Get Profile
- **Method:** GET
- **URL:** `{{base_url}}/api/users/profile`
- **Headers:**
  - `Authorization: Bearer {{jwt_token}}`

#### 4. Update Profile
- **Method:** PUT
- **URL:** `{{base_url}}/api/users/profile`
- **Headers:**
  - `Authorization: Bearer {{jwt_token}}`
- **Body (raw JSON):**
```json
{
  "fullName": "Nguyễn Văn Updated",
  "phone": "0987654321",
  "address": "456 Đường XYZ, Quận 2, TP.HCM"
}
```

#### 5. Change Password
- **Method:** PUT
- **URL:** `{{base_url}}/api/users/change-password`
- **Headers:**
  - `Authorization: Bearer {{jwt_token}}`
- **Body (raw JSON):**
```json
{
  "currentPassword": "password123",
  "newPassword": "newpassword123"
}
```

#### 6. Get Users (Admin only)
- **Method:** GET
- **URL:** `{{base_url}}/api/users?page=1&limit=10`
- **Headers:**
  - `Authorization: Bearer {{admin_jwt_token}}`

#### 7. Get User by ID (Admin only)
- **Method:** GET
- **URL:** `{{base_url}}/api/users/{{user_id}}`
- **Headers:**
  - `Authorization: Bearer {{admin_jwt_token}}`

#### 8. Update User (Admin only)
- **Method:** PUT
- **URL:** `{{base_url}}/api/users/{{user_id}}`
- **Headers:**
  - `Authorization: Bearer {{admin_jwt_token}}`
- **Body (raw JSON):**
```json
{
  "fullName": "Updated by Admin",
  "role": "admin",
  "isActive": true
}
```

#### 9. Delete User (Admin only)
- **Method:** DELETE
- **URL:** `{{base_url}}/api/users/{{user_id}}`
- **Headers:**
  - `Authorization: Bearer {{admin_jwt_token}}`

#### 10. Get User Stats (Admin only)
- **Method:** GET
- **URL:** `{{base_url}}/api/users/stats`
- **Headers:**
  - `Authorization: Bearer {{admin_jwt_token}}`

#### 11. Create Admin User (Admin only)
- **Method:** POST
- **URL:** `{{base_url}}/api/users/create-admin`
- **Headers:**
  - `Authorization: Bearer {{admin_jwt_token}}`
- **Body (raw JSON):**
```json
{
  "username": "adminuser",
  "email": "admin@example.com",
  "password": "adminpassword123",
  "fullName": "Admin User"
}
```

## ⚠️ Lưu ý quan trọng

### 1. Thứ tự test
- Luôn test **Register** → **Login** trước để có JWT token
- Các API có `(cần token)` yêu cầu authentication header
- API có `(Admin only)` yêu cầu admin token

### 2. Token Management
- User token: `{{jwt_token}}`
- Admin token: `{{admin_jwt_token}}`
- User ID: `{{user_id}}`

### 3. Common Error Responses
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Please provide a valid email",
      "value": "invalid-email"
    }
  ]
}
```

```json
{
  "success": false,
  "error": "Access denied. No token provided."
}
```

### 4. Validation Rules
- **Username:** 3-50 ký tự, chỉ chứa letters, numbers, underscores
- **Email:** Phải là email hợp lệ
- **Password:** Tối thiểu 6 ký tự
- **Phone:** Chỉ chứa số và ký tự đặc biệt
- **FullName:** Tối đa 100 ký tự
- **Address:** Tối đa 200 ký tự

## 🧪 Test Scenarios

### Positive Tests
1. ✅ Register with valid data
2. ✅ Login with correct credentials
3. ✅ Get profile with valid token
4. ✅ Update profile with valid data
5. ✅ Change password with correct current password
6. ✅ Admin operations with admin token

### Negative Tests
1. ❌ Register with existing email
2. ❌ Login with wrong password
3. ❌ Access protected API without token
4. ❌ Update profile with invalid email
5. ❌ Access admin API with user token

## 🔧 Troubleshooting

### Backend không khởi động
```bash
cd flood-risk
npm start
```

### Database connection issues
- Kiểm tra MongoDB đang chạy
- Kiểm tra connection string trong config

### Token expired
- Đăng nhập lại để lấy token mới
- Update environment variable

---

**📁 Files:** `postman-user-api-bodies.json` | `POSTMAN-USER-API-README.md`