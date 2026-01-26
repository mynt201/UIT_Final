## UC - Quản lý Phường/Xã (CRUD)

```mermaid
sequenceDiagram
autonumber
actor Admin
participant UI as Ward Management
participant API as Backend API
participant AuthMW as Auth Middleware
participant WardCtrl as WardController
participant DB as MongoDB

Admin->>UI: Tạo phường/xã
activate UI
UI->>API: POST /api/wards
activate API
API->>AuthMW: protect + authorize(admin)
activate AuthMW
AuthMW-->>API: ok
deactivate AuthMW
API->>WardCtrl: createWard
activate WardCtrl
WardCtrl->>DB: create
activate DB
DB-->>WardCtrl: ward
deactivate DB
WardCtrl-->>API: 201 ward
API-->>UI: tạo thành công
deactivate WardCtrl
deactivate API
deactivate UI

Admin->>UI: Cập nhật phường/xã
activate UI
UI->>API: PUT /api/wards/:id
activate API
API->>AuthMW: protect + authorize(admin)
activate AuthMW
AuthMW-->>API: ok
deactivate AuthMW
API->>WardCtrl: updateWard
activate WardCtrl
WardCtrl->>DB: findByIdAndUpdate
activate DB
DB-->>WardCtrl: updated ward
deactivate DB
WardCtrl-->>API: 200 ward
API-->>UI: cập nhật thành công
deactivate WardCtrl
deactivate API
deactivate UI

Admin->>UI: Xóa phường/xã (soft delete)
activate UI
UI->>API: DELETE /api/wards/:id
activate API
API->>AuthMW: protect + authorize(admin)
activate AuthMW
AuthMW-->>API: ok
deactivate AuthMW
API->>WardCtrl: deleteWard
activate WardCtrl
WardCtrl->>DB: findById + update isActive=false
activate DB
DB-->>WardCtrl: ok
deactivate DB
WardCtrl-->>API: 200 message
API-->>UI: xóa thành công
deactivate WardCtrl
deactivate API
deactivate UI
```

### Mô tả luồng (dạng bảng)

**Bảng 2.68: Đặc tả Sequence Diagram – Quản lý Phường/Xã (CRUD)**

**Tác nhân/Thành phần**

| Thành phần | Mô tả |
|:-----------|:------|
| Admin | Quản trị hệ thống |
| Ward Management | Giao diện quản lý phường/xã |
| Auth Middleware | Xác thực + phân quyền |
| WardController | CRUD Ward |
| Cơ sở dữ liệu | Lưu trữ ward |

**Điều kiện tiên quyết**

| Điều kiện | Mô tả |
|:----------|:------|
| Quyền truy cập | Admin đã đăng nhập và có quyền admin |

**Luồng chính (Create)**

| Bước | Mô tả |
|:-----|:------|
| 1 | Admin truy cập vào trang Ward Management và nhập thông tin phường/xã mới. |
| 2 | Admin nhấn nút "Tạo mới", và giao diện gửi yêu cầu POST `/api/wards` đến Backend API. |
| 3 | Backend API nhận yêu cầu và gọi Auth Middleware để xác thực token và kiểm tra quyền admin. |
| 4 | Auth Middleware xác nhận người dùng có quyền admin và cho phép tiếp tục. |
| 5 | Backend API chuyển yêu cầu đến WardController để xử lý. |
| 6 | WardController thực hiện kiểm tra tính hợp lệ của dữ liệu đầu vào. |
| 7 | WardController tạo ward mới và lưu vào cơ sở dữ liệu. |
| 8 | Cơ sở dữ liệu lưu thành công và trả về ward đã tạo. |
| 9 | WardController trả kết quả tạo thành công về Backend API. |
| 10 | Backend API trả kết quả về giao diện Ward Management. |
| 11 | Giao diện hiển thị thông báo "Tạo thành công" cho Admin. |

**Luồng chính (Update)**

| Bước | Mô tả |
|:-----|:------|
| 1 | Admin chọn ward cần cập nhật và chỉnh sửa thông tin. |
| 2 | Admin nhấn nút "Cập nhật", và giao diện gửi yêu cầu PUT `/api/wards/:id` đến Backend API. |
| 3 | Backend API nhận yêu cầu và gọi Auth Middleware để xác thực và phân quyền. |
| 4 | WardController tìm ward theo ID và cập nhật thông tin trong cơ sở dữ liệu. |
| 5 | Cơ sở dữ liệu cập nhật thành công và trả về ward đã cập nhật. |
| 6 | WardController trả kết quả cập nhật thành công về giao diện. |
| 7 | Giao diện hiển thị thông báo "Cập nhật thành công" cho Admin. |

**Luồng chính (Delete)**

| Bước | Mô tả |
|:-----|:------|
| 1 | Admin chọn ward cần xóa và nhấn nút "Xóa". |
| 2 | Giao diện gửi yêu cầu DELETE `/api/wards/:id` đến Backend API. |
| 3 | Backend API nhận yêu cầu và gọi Auth Middleware để xác thực và phân quyền. |
| 4 | WardController tìm ward theo ID và đánh dấu `isActive=false` (soft delete) trong cơ sở dữ liệu. |
| 5 | Cơ sở dữ liệu cập nhật thành công. |
| 6 | WardController trả kết quả xóa thành công về giao diện. |
| 7 | Giao diện hiển thị thông báo "Xóa thành công" cho Admin. |

**Luồng sự kiện phụ**

**A1 – Không đủ quyền**

| Bước | Mô tả |
|:-----|:------|
| A1.1 | Auth Middleware phát hiện người dùng không có quyền admin hoặc token không hợp lệ. |
| A1.2 | Auth Middleware trả về lỗi 403 Forbidden. |
| A1.3 | Backend API chuyển lỗi về giao diện. |
| A1.4 | Giao diện hiển thị thông báo lỗi "Không có quyền truy cập" cho Admin. |
