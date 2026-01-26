# Postman Collection cho Weather APIs

## 📋 Tổng quan
File `postman-weather-api-bodies.json` chứa các request body mẫu để test tất cả Weather API endpoints trong hệ thống Flood Risk Management.

## 🚀 Các API Endpoints

### **Public APIs (không cần token):**
- ✅ `GET /api/weather` - Lấy danh sách dữ liệu thời tiết
- ✅ `GET /api/weather/:id` - Lấy dữ liệu thời tiết theo ID
- ✅ `GET /api/weather/ward/:wardId` - Lấy dữ liệu theo phường/xã
- ✅ `GET /api/weather/latest` - Lấy dữ liệu mới nhất tất cả phường
- ✅ `GET /api/weather/stats/:wardId` - Thống kê thời tiết

### **Admin APIs (cần admin token):**
- ✅ `POST /api/weather` - Tạo dữ liệu thời tiết mới
- ✅ `PUT /api/weather/:id` - Cập nhật dữ liệu thời tiết
- ✅ `DELETE /api/weather/:id` - Xóa dữ liệu thời tiết
- ✅ `POST /api/weather/bulk-import` - Import hàng loạt

## 📝 Request Body Mẫu

### 1. Tạo dữ liệu thời tiết mới
```json
{
  "ward_id": "67a1b2c3d4e5f6789abcdef0",
  "date": "2024-01-15T10:00:00.000Z",
  "temperature": {
    "current": 28.5,
    "min": 24.0,
    "max": 32.0
  },
  "humidity": 75.5,
  "rainfall": 5.2,
  "wind_speed": 12.5,
  "wind_direction": 180,
  "pressure": 1013.2,
  "is_forecast": false
}
```

### 2. Import hàng loạt
```json
{
  "weatherData": [
    {
      "ward_id": "67a1b2c3d4e5f6789abcdef0",
      "date": "2024-01-15T06:00:00.000Z",
      "temperature": {
        "current": 26.0,
        "min": 23.0,
        "max": 29.0
      },
      "humidity": 85.0,
      "rainfall": 2.5,
      "wind_speed": 8.0,
      "wind_direction": 135,
      "pressure": 1012.5,
      "is_forecast": false
    }
  ]
}
```

## 🔍 Query Parameters

### Pagination & Filtering
```
GET /api/weather?page=1&limit=10&ward_id=WARD_ID&date_from=2024-01-01&date_to=2024-12-31&sort=date&order=desc
```

### Statistics
```
GET /api/weather/stats/WARD_ID?days=30
```

## 📊 Response Examples

### Success Response - Get Weather Data
```json
{
  "success": true,
  "weatherData": [
    {
      "_id": "weather_id",
      "ward_id": {
        "ward_name": "Phường 1",
        "district": "Quận 1"
      },
      "date": "2024-01-15T10:00:00.000Z",
      "temperature": {
        "current": 28.5,
        "min": 24.0,
        "max": 32.0
      },
      "humidity": 75.5,
      "rainfall": 5.2,
      "wind_speed": 12.5,
      "wind_direction": 180,
      "pressure": 1013.2,
      "is_forecast": false
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "pages": 15
  }
}
```

### Success Response - Weather Statistics
```json
{
  "success": true,
  "ward": {
    "_id": "ward_id",
    "ward_name": "Phường 1",
    "district": "Quận 1"
  },
  "period": {
    "days": 30,
    "startDate": "2023-12-16T08:00:00.000Z",
    "endDate": "2024-01-15T08:00:00.000Z"
  },
  "statistics": {
    "count": 30,
    "avgTemperature": 27.8,
    "maxTemperature": 32.0,
    "minTemperature": 23.5,
    "avgHumidity": 76.2,
    "totalRainfall": 45.8,
    "avgRainfall": 1.5,
    "maxRainfall": 12.5,
    "rainyDays": 12
  }
}
```

## ⚠️ Lưu ý quan trọng

### 1. **WARD_ID Requirements**
- Phải là MongoDB ObjectId hợp lệ
- Ward phải tồn tại trong database
- Có thể lấy từ API `GET /api/wards`

### 2. **Date Format**
- Sử dụng ISO 8601 format: `2024-01-15T10:00:00.000Z`
- Bao gồm timezone (UTC)

### 3. **Data Constraints**
```javascript
temperature: -50°C đến 60°C
humidity: 0% đến 100%
rainfall: ≥ 0 mm
wind_speed: ≥ 0 km/h
wind_direction: 0° đến 360°
pressure: 800 đến 1200 hPa
```

### 4. **Duplicate Prevention**
- Không thể tạo 2 bản ghi cho cùng ward + date
- Bulk import sẽ bỏ qua duplicates

### 5. **Authentication**
- Public APIs: không cần token
- Admin APIs: cần JWT token với role "admin"

## 🧪 Testing Steps

### Chuẩn bị dữ liệu
1. **Tạo ward data trước:**
   ```json
   POST /api/wards
   {
     "ward_name": "Phường Test",
     "district": "Quận Test",
     "province": "TP.HCM",
     "coordinates": [106.6297, 10.8231]
   }
   ```

2. **Lấy WARD_ID từ response**

### Test các API
1. **GET /api/weather** - Xem danh sách trống
2. **POST /api/weather** - Tạo dữ liệu mẫu
3. **GET /api/weather** - Xem dữ liệu vừa tạo
4. **GET /api/weather/stats/:wardId** - Xem thống kê
5. **PUT /api/weather/:id** - Cập nhật dữ liệu
6. **DELETE /api/weather/:id** - Xóa dữ liệu

### Test Advanced Features
1. **Bulk import** với nhiều bản ghi
2. **Filtering** theo date range, ward
3. **Sorting** theo các trường khác nhau
4. **Pagination** với page/limit

## 🚨 Error Handling

### Validation Errors
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    "Temperature must be between -50°C and 60°C",
    "Humidity must be between 0% and 100%"
  ]
}
```

### Duplicate Data
```json
{
  "success": false,
  "error": "Weather data for this ward and date already exists"
}
```

### Invalid Ward
```json
{
  "success": false,
  "error": "Invalid ward ID"
}
```

## 📁 Files
- `postman-weather-api-bodies.json` - Request body mẫu
- `POSTMAN-WEATHER-API-README.md` - Hướng dẫn chi tiết

## 🔗 Related APIs
- **Ward APIs**: `GET /api/wards` (để lấy ward_id)
- **User APIs**: Login để lấy admin token

---

**Happy Testing! 🎯**