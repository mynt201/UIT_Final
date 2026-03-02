export const calcFloodRiskIndex = (
  exposure: number,
  susceptibility: number,
  resilience: number,
): number => {
  return (exposure + susceptibility) / resilience;
};

export const getRiskLevel = (
  riskIndex: number,
): "cao" | "trungBinh" | "thap" => {
  if (riskIndex >= 3.5) return "cao";
  if (riskIndex >= 2.0) return "trungBinh";
  return "thap";
};

export const getRiskColor = (
  level: "cao" | "trungBinh" | "thap" | "chuaCoDuLieu",
): number[] => {
  switch (level) {
    case "cao":
      return [220, 38, 38, 0.75]; // Đỏ
    case "trungBinh":
      return [234, 179, 8, 0.75]; // Vàng
    case "chuaCoDuLieu":
      return [229, 231, 235, 0.5]; // Xám nhạt
    case "thap":
    default:
      return [209, 213, 219, 0.7]; // Xám
  }
};

export const getRiskOutlineColor = (
  level: "cao" | "trungBinh" | "thap" | "chuaCoDuLieu",
): number[] => {
  switch (level) {
    case "cao":
      return [185, 28, 28, 0.9]; // Đỏ đậm
    case "trungBinh":
      return [202, 138, 4, 0.9]; // Vàng đậm
    case "chuaCoDuLieu":
      return [156, 163, 175, 0.6]; // Xám nhạt
    case "thap":
    default:
      return [156, 163, 175, 0.8]; // Xám
  }
};

export const getRiskLevelLabel = (
  level: "cao" | "trungBinh" | "thap" | "chuaCoDuLieu",
): string => {
  switch (level) {
    case "cao":
      return "Cao";
    case "trungBinh":
      return "Trung Bình";
    case "thap":
      return "Thấp";
    case "chuaCoDuLieu":
      return "Chưa có dữ liệu";
    default:
      return "Không xác định";
  }
};

/** 4 trạng thái: Cao (đỏ), Trung bình (vàng), Thấp (xám), Chưa có dữ liệu (xám nhạt) */
export const getRiskColorFromBackend = (
  level: string | undefined,
): number[] => {
  const l = level?.trim?.() ?? "";
  if (l === "Rất cao" || l === "Cao") return [220, 38, 38, 0.75]; // Đỏ
  if (l === "Trung bình") return [234, 179, 8, 0.75]; // Vàng
  if (l === "Chưa có dữ liệu") return [229, 231, 235, 0.5]; // Xám nhạt, opacity thấp
  return [209, 213, 219, 0.7]; // Thấp / Rất thấp
};

export const getRiskOutlineColorFromBackend = (
  level: string | undefined,
): number[] => {
  const l = level?.trim?.() ?? "";
  if (l === "Rất cao" || l === "Cao") return [185, 28, 28, 0.9]; // Đỏ đậm
  if (l === "Trung bình") return [202, 138, 4, 0.9]; // Vàng đậm
  if (l === "Chưa có dữ liệu") return [156, 163, 175, 0.6]; // Xám nhạt
  return [156, 163, 175, 0.8]; // Xám
};
