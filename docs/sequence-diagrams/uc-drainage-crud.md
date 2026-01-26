## UC - Quản lý Thoát nước (CRUD)

```mermaid
sequenceDiagram
autonumber
actor Admin
participant UI as Drainage Management
participant API as Backend API
participant AuthMW as Auth Middleware
participant DrainCtrl as DrainageController
participant DB as MongoDB

Admin->>UI: Tạo dữ liệu thoát nước
activate UI
UI->>API: POST /api/drainage
activate API
API->>AuthMW: protect + authorize(admin)
activate AuthMW
AuthMW-->>API: ok
deactivate AuthMW
API->>DrainCtrl: createDrainageData
activate DrainCtrl
DrainCtrl->>DB: create
activate DB
DB-->>DrainCtrl: drainage
deactivate DB
DrainCtrl-->>API: 201 drainage
API-->>UI: tạo thành công
deactivate DrainCtrl
deactivate API
deactivate UI

Admin->>UI: Cập nhật dữ liệu thoát nước
activate UI
UI->>API: PUT /api/drainage/:id
activate API
API->>AuthMW: protect + authorize(admin)
activate AuthMW
AuthMW-->>API: ok
deactivate AuthMW
API->>DrainCtrl: updateDrainageData
activate DrainCtrl
DrainCtrl->>DB: findByIdAndUpdate
activate DB
DB-->>DrainCtrl: updated
deactivate DB
DrainCtrl-->>API: 200 updated
API-->>UI: cập nhật thành công
deactivate DrainCtrl
deactivate API
deactivate UI

Admin->>UI: Xóa dữ liệu thoát nước
activate UI
UI->>API: DELETE /api/drainage/:id
activate API
API->>AuthMW: protect + authorize(admin)
activate AuthMW
AuthMW-->>API: ok
deactivate AuthMW
API->>DrainCtrl: deleteDrainageData
activate DrainCtrl
DrainCtrl->>DB: delete by id
activate DB
DB-->>DrainCtrl: ok
deactivate DB
DrainCtrl-->>API: 200 message
API-->>UI: xóa thành công
deactivate DrainCtrl
deactivate API
deactivate UI
```

### Mô tả luồng (dạng bảng)

**Bảng 2.72: Đặc tả Sequence Diagram – Quản lý Thoát nước (CRUD)**

**Tác nhân/Thành phần**

| Thành phần | Mô tả |
|:-----------|:------|
| Admin | Quản trị hệ thống |
| Drainage Management | Giao diện quản lý thoát nước |
| Auth Middleware | Xác thực + phân quyền |
| DrainageController | CRUD dữ liệu thoát nước |
| Cơ sở dữ liệu | Lưu trữ dữ liệu |

**Điều kiện tiên quyết**

| Điều kiện | Mô tả |
|:----------|:------|
| Quyền truy cập | Admin đã đăng nhập và có quyền admin |

**Luồng chính (Create)**

| Bước | Mô tả |
|:-----|:------|
| 1 | Admin truy cập vào trang Drainage Management và nhập thông tin dữ liệu thoát nước mới. |
| 2 | Admin nhấn nút "Tạo mới", và giao diện gửi yêu cầu POST `/api/drainage` đến Backend API. |
| 3 | Backend API nhận yêu cầu và gọi Auth Middleware để xác thực token và kiểm tra quyền admin. |
| 4 | Auth Middleware xác nhận người dùng có quyền admin và cho phép tiếp tục. |
| 5 | Backend API chuyển yêu cầu đến DrainageController để xử lý. |
| 6 | DrainageController thực hiện kiểm tra tính hợp lệ của dữ liệu đầu vào. |
| 7 | DrainageController tạo bản ghi dữ liệu thoát nước mới và lưu vào cơ sở dữ liệu. |
| 8 | Cơ sở dữ liệu lưu thành công và trả về drainage data đã tạo. |
| 9 | DrainageController trả kết quả tạo thành công về Backend API. |
| 10 | Backend API trả kết quả về giao diện Drainage Management. |
| 11 | Giao diện hiển thị thông báo "Tạo thành công" cho Admin. |

**Luồng chính (Update)**

| Bước | Mô tả |
|:-----|:------|
| 1 | Admin chọn bản ghi dữ liệu thoát nước cần cập nhật và chỉnh sửa thông tin. |
| 2 | Admin nhấn nút "Cập nhật", và giao diện gửi yêu cầu PUT `/api/drainage/:id` đến Backend API. |
| 3 | Backend API nhận yêu cầu và gọi Auth Middleware để xác thực và phân quyền. |
| 4 | DrainageController tìm bản ghi theo ID và cập nhật thông tin trong cơ sở dữ liệu. |
| 5 | Cơ sở dữ liệu cập nhật thành công và trả về bản ghi đã cập nhật. |
| 6 | DrainageController trả kết quả cập nhật thành công về giao diện. |
| 7 | Giao diện hiển thị thông báo "Cập nhật thành công" cho Admin. |

**Luồng chính (Delete)**

| Bước | Mô tả |
|:-----|:------|
| 1 | Admin chọn bản ghi dữ liệu thoát nước cần xóa và nhấn nút "Xóa". |
| 2 | Giao diện gửi yêu cầu DELETE `/api/drainage/:id` đến Backend API. |
| 3 | Backend API nhận yêu cầu và gọi Auth Middleware để xác thực và phân quyền. |
| 4 | DrainageController tìm bản ghi theo ID và xóa bản ghi trong cơ sở dữ liệu. |
| 5 | Cơ sở dữ liệu xóa thành công. |
| 6 | DrainageController trả kết quả xóa thành công về giao diện. |
| 7 | Giao diện hiển thị thông báo "Xóa thành công" cho Admin. |

**Luồng sự kiện phụ**

**A1 – Không đủ quyền**

| Bước | Mô tả |
|:-----|:------|
| A1.1 | Auth Middleware phát hiện người dùng không có quyền admin hoặc token không hợp lệ. |
| A1.2 | Auth Middleware trả về lỗi 403 Forbidden. |
| A1.3 | Backend API chuyển lỗi về giao diện. |
| A1.4 | Giao diện hiển thị thông báo lỗi "Không có quyền truy cập" cho Admin. |
