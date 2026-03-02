/** Tên đầy đủ (fallback khi API không trả name) — dùng để hiển thị thay cho viết tắt H, T, P... */
export const INDICATOR_LABELS: Record<string, string> = {
  H: "Địa hình",
  T: "Triều cường",
  P: "Lượng mưa",
  POP: "Dân số",
  D: "Mật độ cống",
};

/**
 * Hiển thị tên đầy đủ và ký hiệu cho chỉ số (không dùng viết tắt H, T... đơn thuần).
 * Ví dụ: "Địa hình (Height/Elevation) — ký hiệu: H" hoặc "Địa hình — ký hiệu: H"
 */
export function getIndicatorLabel(
  ind: { code?: string; name?: string } | null | undefined
): string {
  if (!ind) return "—";
  const tenDayDu = (
    ind.name?.trim() ||
    INDICATOR_LABELS[ind.code ?? ""] ||
    ind.code ||
    "—"
  ).trim();
  const kyHieu = ind.code ? ` — ký hiệu: ${ind.code}` : "";
  return tenDayDu + kyHieu;
}
