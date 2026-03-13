# Chuẩn hóa chỉ số (normalized_value) — Yêu cầu Backend

**Chuẩn hóa luôn do Backend tính toán và ghi vào DB.** Frontend chỉ gửi `raw_value`; Backend bắt buộc tính `normalized_value` và lưu vào collection/field tương ứng.

---

## ⚠️ Quan trọng: Công thức không được đảo

- **direction = 1 (Thuận)** → dùng **đúng** công thức `I = (X - Xmin) / (Xmax - Xmin)`.
- **direction = 0 (Nghịch)** → dùng **đúng** công thức `I = (Xmax - X) / (Xmax - Xmin)`.

**Không** dùng ngược (ví dụ: không dùng (Xmax−X)/(...) cho Thuận). Đảo công thức sẽ ra kết quả chuẩn hóa sai.

---

## Công thức tính (pseudocode BE)

- **X** = `raw_value` (giá trị thô từ CSV / form).
- Lấy **x_min**, **x_max** từ `indicator_thresholds` theo `(unit_id, indicator_id)`.
- Lấy **direction** từ `flood_indicators` theo `indicator_id`: `1` = Thuận, `0` = Nghịch.

```text
range = x_max - x_min
if range <= 0: normalized_value = 0  (hoặc bỏ qua / báo lỗi)

if direction == 1:   // Thuận (T, P, POP)
    I = (X - x_min) / range
else:               // direction == 0, Nghịch (H, D)
    I = (x_max - X) / range

normalized_value = max(0, min(1, I))   // clamp về [0, 1]
```

---

## Ánh xạ chỉ số → direction (phải khớp DB)

| Chỉ số       | Code | direction | Công thức dùng |
|-------------|------|-----------|----------------|
| Địa hình    | H    | **0** Nghịch | `I = (x_max - X) / (x_max - x_min)` |
| Triều cường | T    | **1** Thuận  | `I = (X - x_min) / (x_max - x_min)` |
| Lượng mưa   | P    | **1** Thuận  | `I = (X - x_min) / (x_max - x_min)` |
| Dân số      | POP  | **1** Thuận  | `I = (X - x_min) / (x_max - x_min)` |
| Mật độ cống | D    | **0** Nghịch | `I = (x_max - X) / (x_max - x_min)` |

---

## Ngưỡng tham chiếu (Xmin, Xmax)

| Chỉ số       | Code | x_min  | x_max  | Đơn vị   |
|-------------|------|--------|--------|----------|
| Địa hình    | H    | 0.8    | 2.0    | m        |
| Triều cường | T    | 1.5    | 2.0    | m        |
| Lượng mưa   | P    | 1500   | 2500   | mm       |
| Dân số      | POP  | 10000  | 40000  | người    |
| Mật độ cống | D    | 3.0    | 7.0    | km/km²   |

---

## Kiểm chứng (unit test): raw_value → normalized_value đúng

Dùng các cặp (raw_value, normalized_value kỳ vọng) dưới đây để kiểm tra hàm chuẩn hóa trên BE.

| Chỉ số       | x_min | x_max | direction | raw_value (X) | normalized_value (I) kỳ vọng |
|-------------|-------|-------|-----------|----------------|------------------------------|
| Địa hình    | 0.8   | 2.0   | 0         | 1.1            | 0.75                         |
| Triều cường | 1.5   | 2.0   | 1         | 1.71           | 0.42                         |
| Lượng mưa   | 1500  | 2500  | 1         | 1930           | 0.43                         |
| Mật độ cống | 3.0   | 7.0   | 0         | 3.92           | 0.77                         |
| Dân số      | 10000 | 40000 | 1         | 15100          | 0.17                         |

Cách kiểm: với mỗi dòng, tính I từ X và so sánh với cột “normalized_value kỳ vọng”. Nếu khác → công thức hoặc direction đang sai.

---

## Khi nào phải tính và cập nhật normalized_value

1. **POST /indicator-values** — từ `raw_value` + ngưỡng + direction → tính `normalized_value` → lưu DB.
2. **PUT /indicator-values/:id** — khi đổi `raw_value` → tính lại `normalized_value` → cập nhật DB.
3. **POST /indicator-values/bulk-upsert** — mỗi item: tính `normalized_value` → lưu/upsert.
4. **POST /indicator-values/upload-csv** — mỗi dòng/ chỉ số: tính `normalized_value` → lưu DB.

Frontend không gửi `normalized_value`; Backend luôn tính và ghi vào DB.
