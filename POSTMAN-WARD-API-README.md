# Postman Collection cho Ward APIs

## 📋 Tổng quan
File `postman-ward-api-bodies.json` chứa các request body mẫu để test tất cả Ward API endpoints trong hệ thống Flood Risk Management.

## 🏘️ Ward APIs Overview

### **Public APIs (không cần token):**
- ✅ `GET /api/wards` - Lấy danh sách phường/xã (có pagination, filtering, sorting)
- ✅ `GET /api/wards/:id` - Lấy thông tin phường/xã theo ID
- ✅ `GET /api/wards/name/:name` - Lấy thông tin theo tên
- ✅ `GET /api/wards/risk/:level` - Lấy danh sách theo mức độ rủi ro
- ✅ `GET /api/wards/stats` - Thống kê tổng quan

### **Admin APIs (cần admin token):**
- ✅ `POST /api/wards` - Tạo phường/xã mới
- ✅ `PUT /api/wards/:id` - Cập nhật thông tin
- ✅ `DELETE /api/wards/:id` - Xóa phường/xã (soft delete)
- ✅ `POST /api/wards/:id/calculate-risk` - Tính toán rủi ro ngập lụt
- ✅ `POST /api/wards/bulk-import` - Import hàng loạt

## 📝 Request Body Mẫu

### 1. Tạo phường/xã mới
```json
{
  "ward_name": "Phường Nguyễn Thái Bình",
  "district": "Quận 1",
  "province": "TP.HCM",
  "area": 4.2,
  "population": 38000,
  "coordinates": [106.6958, 10.7767],
  "population_density": 9047.62,
  "rainfall": 1850.5,
  "low_elevation": 1.1,
  "urban_land": 88.5,
  "drainage_capacity": 95.2
}
```

### 2. Cập nhật thông tin
```json
{
  "population": 42000,
  "population_density": 10000.0,
  "rainfall": 1950.8,
  "urban_land": 92.1
}
```

### 3. Import hàng loạt
```json
{
  "wards": [
    {
      "ward_name": "Phường A",
      "district": "Quận 1",
      "province": "TP.HCM",
      "area": 2.5,
      "population": 25000,
      "coordinates": [106.6958, 10.7767],
      "population_density": 10000,
      "rainfall": 1650.0,
      "low_elevation": 0.8,
      "urban_land": 85.2,
      "drainage_capacity": 92.5
    }
  ]
}
```

## 🔍 Query Parameters

### Pagination & Filtering
```
GET /api/wards?page=1&limit=10&district=Quận 1&province=TP.HCM&risk_level=High&ward_name=Nguyễn&sort=flood_risk&order=desc
```

### Risk Level Filtering
```
GET /api/wards/risk/High
```
**Valid risk levels:** Very Low, Low, Medium, High, Very High

## 📊 Response Examples

### Ward Data Structure
```json
{
  "_id": "ward_id",
  "ward_name": "Phường Nguyễn Thái Bình",
  "district": "Quận 1",
  "province": "TP.HCM",
  "area": 4.2,
  "population": 38000,
  "coordinates": [106.6958, 10.7767],
  "population_density": 9047.62,
  "rainfall": 1850.5,
  "low_elevation": 1.1,
  "urban_land": 88.5,
  "drainage_capacity": 95.2,
  "flood_risk": 0.75,
  "risk_level": "High",
  "isActive": true,
  "createdAt": "2024-01-15T08:00:00.000Z",
  "updatedAt": "2024-01-15T08:00:00.000Z"
}
```

### Statistics Response
```json
{
  "success": true,
  "statistics": {
    "totalWards": 150,
    "avgRisk": 0.45,
    "maxRisk": 0.95,
    "avgRainfall": 1750.8,
    "avgElevation": 1.3,
    "avgDrainage": 82.5,
    "totalPopulation": 4500000
  },
  "riskDistribution": [
    {
      "label": "Very Low",
      "count": 25,
      "percentage": "16.7"
    },
    {
      "label": "Low",
      "count": 35,
      "percentage": "23.3"
    },
    {
      "label": "Medium",
      "count": 40,
      "percentage": "26.7"
    },
    {
      "label": "High",
      "count": 30,
      "percentage": "20.0"
    },
    {
      "label": "Very High",
      "count": 20,
      "percentage": "13.3"
    }
  ]
}
```

## ⚠️ Lưu ý quan trọng

### 1. **Required Fields**
- `ward_name` (unique)
- `district`
- `province`

### 2. **Risk Calculation Parameters**
Để tính flood risk, ward cần có đầy đủ các parameters:
- `population_density`
- `rainfall`
- `low_elevation`
- `urban_land`
- `drainage_capacity`

### 3. **Coordinates Format**
```json
"coordinates": [longitude, latitude]
// Ví dụ: [106.6958, 10.7767] (TP.HCM coordinates)
```

### 4. **Data Constraints**
```javascript
area: > 0 (km²)
population: ≥ 0
population_density: ≥ 0 (people/km²)
rainfall: ≥ 0 (mm/year)
low_elevation: ≥ 0 (meters)
urban_land: 0-100 (%)
drainage_capacity: 0-100 (%)
```

### 5. **Soft Delete**
- DELETE operation chỉ set `isActive = false`
- Ward vẫn tồn tại trong database nhưng không hiển thị trong queries thông thường

### 6. **Duplicate Prevention**
- Không thể tạo 2 wards với cùng `ward_name`
- Bulk import sẽ bỏ qua duplicates

## 🧪 Testing Steps

### Chuẩn bị dữ liệu
1. **Login với admin account** để lấy JWT token
2. **Test GET /api/wards** để xem danh sách hiện có

### Test từng API
1. **POST /api/wards** - Tạo ward mới với đầy đủ thông tin
2. **GET /api/wards/:id** - Xem ward vừa tạo
3. **PUT /api/wards/:id** - Cập nhật thông tin
4. **POST /api/wards/:id/calculate-risk** - Tính flood risk
5. **GET /api/wards/stats** - Xem thống kê tổng quan
6. **GET /api/wards/risk/High** - Xem wards có rủi ro cao
7. **POST /api/wards/bulk-import** - Import nhiều wards

### Test Advanced Features
1. **Filtering:** `GET /api/wards?district=Quận 1&risk_level=High`
2. **Sorting:** `GET /api/wards?sort=flood_risk&order=desc`
3. **Search:** `GET /api/wards?ward_name=Nguyễn`
4. **Pagination:** `GET /api/wards?page=2&limit=20`

## 🚨 Error Handling

### Validation Errors
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    "Ward name is required",
    "Area must be a positive number",
    "Coordinates must be an array of exactly 2 numbers"
  ]
}
```

### Duplicate Ward Name
```json
{
  "success": false,
  "error": "Ward with this name already exists"
}
```

### Missing Risk Parameters
```json
{
  "success": false,
  "error": "Ward must have all risk parameters to calculate flood risk"
}
```

### Invalid Risk Level
```json
{
  "success": false,
  "error": "Invalid risk level. Must be: Very Low, Low, Medium, High, Very High"
}
```

## 📊 Flood Risk Calculation

### Risk Parameters & Weights
- **Population Density:** 25% (higher density = higher risk)
- **Rainfall:** 20% (higher rainfall = higher risk)
- **Low Elevation:** 25% (lower elevation = higher risk)
- **Urban Land:** 15% (higher urban area = higher risk)
- **Drainage Capacity:** 15% (lower capacity = higher risk)

### Risk Level Classification
- **Very Low:** 0.0 - 0.2
- **Low:** 0.2 - 0.4
- **Medium:** 0.4 - 0.6
- **High:** 0.6 - 0.8
- **Very High:** 0.8 - 1.0

## 🗂️ Files
- `postman-ward-api-bodies.json` - Request body mẫu
- `POSTMAN-WARD-API-README.md` - Hướng dẫn chi tiết

---

**Happy Testing! 🏘️**