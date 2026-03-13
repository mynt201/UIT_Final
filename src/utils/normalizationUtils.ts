/**
 * Chuẩn hóa giá trị chỉ số theo ngưỡng X_min, X_max và hướng (direction).
 * Áp dụng theo từng phường (unit) và từng chỉ số (indicator).
 *
 * Bảng ánh xạ chỉ số → direction (phải khớp với DB flood_indicators.direction):
 *
 *   Chỉ số              | Ký hiệu | direction | Công thức              | Ý nghĩa
 *   --------------------|---------|-----------|------------------------|---------------------------
 *   Địa hình (I1)        | H       | 0 Nghịch  | I = (Xmax−X)/(Xmax−Xmin)| X nhỏ → I cao (rủi ro cao)
 *   Triều cường (I2)    | T       | 1 Thuận   | I = (X−Xmin)/(Xmax−Xmin) | X lớn → I cao
 *   Lượng mưa (I3)      | P       | 1 Thuận   | I = (X−Xmin)/(Xmax−Xmin) | X lớn → I cao
 *   Dân số (I4)         | POP     | 1 Thuận   | I = (X−Xmin)/(Xmax−Xmin) | X lớn → I cao
 *   Mật độ cống (I5)    | D       | 0 Nghịch  | I = (Xmax−X)/(Xmax−Xmin) | X nhỏ → I cao
 *
 * Ví dụ kết quả chuẩn hóa đúng (I trong [0,1]) — đối chiếu ngưỡng REFERENCE_THRESHOLDS:
 *   Địa hình:    2020→0.75, 2022→0.77, 2024→0.80, 2025→0.82 (Nghịch: I tăng khi X giảm)
 *   Triều cường: 2020→0.42, 2022→0.50, 2024→0.60, 2025→0.64 (Thuận)
 *   Lượng mưa:   2020→0.43, 2022→0.90, 2024→0.70, 2025→0.75 (Thuận)
 *   Mật độ cống: 2020→0.77, 2022→0.57, 2024→0.33, 2025→0.23 (Nghịch: I giảm khi X tăng)
 *   Dân số:      2020→0.17, 2022→0.42, 2024→0.71, 2025→0.83 (Thuận)
 */

export const DIRECTION_THUAN = 1 as const;
export const DIRECTION_NGHICH = 0 as const;

/** Ánh xạ tên/ mã chỉ số → direction (fallback khi API không trả direction). */
export const INDICATOR_DIRECTION: Record<string, 0 | 1> = {
  "Địa hình": 0,
  H: 0,
  I1: 0,
  "Triều cường": 1,
  T: 1,
  I2: 1,
  "Lượng mưa": 1,
  P: 1,
  I3: 1,
  "Dân số": 1,
  POP: 1,
  I4: 1,
  "Mật độ cống": 0,
  D: 0,
  I5: 0,
};

export type NormalizationDirection = 0 | 1;

/**
 * Tính giá trị chuẩn hóa I từ raw value X và ngưỡng.
 * Backend PHẢI dùng đúng: direction 1 → (X-Xmin)/range; direction 0 → (Xmax-X)/range. Không đảo.
 *
 * @param rawValue X - giá trị thô
 * @param xMin Xmin - ngưỡng tối thiểu
 * @param xMax Xmax - ngưỡng tối đa
 * @param direction 1 = Thuận: I=(X-Xmin)/(Xmax-Xmin) | 0 = Nghịch: I=(Xmax-X)/(Xmax-Xmin)
 * @returns I (có thể >1 hoặc <0; dùng clampNormalized để bó về [0,1])
 */
export function normalizeIndicatorValue(
  rawValue: number,
  xMin: number,
  xMax: number,
  direction: NormalizationDirection
): number {
  const range = xMax - xMin;
  if (range <= 0) return NaN;
  if (direction === DIRECTION_THUAN) {
    // Thuận (T, P, POP): X càng lớn → I càng lớn
    return (rawValue - xMin) / range;
  }
  // Nghịch (H, D): X càng nhỏ → I càng lớn
  return (xMax - rawValue) / range;
}

/**
 * Clamp giá trị chuẩn hóa về [0, 1] (khi X ngoài [Xmin, Xmax]).
 */
export function clampNormalized(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

/**
 * Lấy direction (0 Nghịch, 1 Thuận) từ mã hoặc tên chỉ số.
 * Dùng khi API không trả direction hoặc để kiểm tra nhất quán.
 */
export function getDirectionForIndicator(codeOrName: string | undefined): NormalizationDirection {
  if (!codeOrName) return DIRECTION_THUAN;
  const key = String(codeOrName).trim();
  if (key in INDICATOR_DIRECTION) return INDICATOR_DIRECTION[key];
  return DIRECTION_THUAN;
}

/**
 * Chuẩn hóa và clamp về [0,1]. Dùng khi tính normalized_value sau import/update.
 */
export function normalizeAndClamp(
  rawValue: number,
  xMin: number,
  xMax: number,
  direction: NormalizationDirection
): number {
  const i = normalizeIndicatorValue(rawValue, xMin, xMax, direction);
  return clampNormalized(i);
}
