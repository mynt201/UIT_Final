/**
 * Ngưỡng min/max tham chiếu theo chỉ số — đối chiếu với dữ liệu thực tế để chuẩn hóa đúng.
 * Dùng làm mặc định khi tạo indicator_thresholds hoặc kiểm tra tính toán normalized_value.
 *
 * Công thức:
 * - Thuận (T, P, Pop): I = (X - Xmin) / (Xmax - Xmin)
 * - Nghịch (H, D):      I = (Xmax - X) / (Xmax - Xmin)
 *
 * Kết quả chuẩn hóa đúng (I) khi dùng ngưỡng và raw value thực tế:
 *   Chỉ số        | 2020 (I) | 2022 (I) | 2024 (I) | 2025 (I)
 *   Địa hình     | 0.75     | 0.77     | 0.80     | 0.82
 *   Triều cường  | 0.42     | 0.50     | 0.60     | 0.64
 *   Lượng mưa    | 0.43     | 0.90     | 0.70     | 0.75
 *   Mật độ cống  | 0.77     | 0.57     | 0.33     | 0.23
 *   Dân số       | 0.17     | 0.42     | 0.71     | 0.83
 */

export interface ReferenceThreshold {
  /** Mã chỉ số (H, T, P, POP, D) */
  code: string;
  /** Tên hiển thị */
  name: string;
  /** Ngưỡng thấp (số để tính toán) */
  x_min: number;
  /** Ngưỡng cao (số để tính toán) */
  x_max: number;
  /** Đơn vị hiển thị */
  unit: string;
  /** Lý do chọn ngưỡng */
  reason: string;
}

export const REFERENCE_THRESHOLDS: ReferenceThreshold[] = [
  {
    code: "H",
    name: "Địa hình",
    x_min: 0.8,
    x_max: 2.0,
    unit: "m",
    reason:
      "0.8m là vùng rất trũng tại An Khánh; 2.0m là cao độ chuẩn không ngập của TP.HCM.",
  },
  {
    code: "T",
    name: "Triều cường",
    x_min: 1.5,
    x_max: 2.0,
    unit: "m",
    reason:
      "1.50m là mức Báo động I; 2.00m là kịch bản triều cực đoan do BĐKH.",
  },
  {
    code: "P",
    name: "Lượng mưa",
    x_min: 1500,
    x_max: 2500,
    unit: "mm",
    reason:
      "Dựa trên lượng mưa trung bình năm thấp nhất và cao nhất tại trạm Tân Sơn Nhất.",
  },
  {
    code: "POP",
    name: "Dân số",
    x_min: 10000,
    x_max: 40000,
    unit: "người",
    reason:
      "Quy mô dân số phường An Khánh theo quy hoạch đến năm 2025.",
  },
  {
    code: "D",
    name: "Mật độ cống",
    x_min: 3.0,
    x_max: 7.0,
    unit: "km/km²",
    reason:
      "Mật độ hạ tầng thoát nước khu dân cư cũ và khu đô thị mới Thủ Thiêm.",
  },
];

/** Map code → reference threshold (để lấy x_min, x_max mặc định). */
export const REFERENCE_THRESHOLDS_BY_CODE: Record<string, ReferenceThreshold> =
  REFERENCE_THRESHOLDS.reduce(
    (acc, t) => {
      acc[t.code] = t;
      if (t.code === "POP") acc["Pop"] = t; // alias
      return acc;
    },
    {} as Record<string, ReferenceThreshold>
  );
