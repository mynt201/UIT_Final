export const calcFloodRiskIndex = (
  exposure: number,
  susceptibility: number,
  resilience: number
): number => {
  return (exposure + susceptibility) / resilience;
};

export const getRiskLevel = (riskIndex: number): 'cao' | 'trungBinh' | 'thap' => {
  if (riskIndex >= 3.5) return 'cao';
  if (riskIndex >= 2.0) return 'trungBinh';
  return 'thap';
};

export const getRiskColor = (level: 'cao' | 'trungBinh' | 'thap'): number[] => {
  switch (level) {
    case 'cao':
      return [220, 38, 38, 0.75]; // Đỏ
    case 'trungBinh':
      return [234, 179, 8, 0.75]; // Vàng
    case 'thap':
      return [209, 213, 219, 0.7]; // Xám
    default:
      return [200, 200, 200, 0.5];
  }
};

export const getRiskOutlineColor = (level: 'cao' | 'trungBinh' | 'thap'): number[] => {
  switch (level) {
    case 'cao':
      return [185, 28, 28, 0.9]; // Đỏ đậm
    case 'trungBinh':
      return [202, 138, 4, 0.9]; // Vàng đậm
    case 'thap':
      return [156, 163, 175, 0.8]; // Xám
    default:
      return [100, 100, 100, 0.6];
  }
};

export const getRiskLevelLabel = (level: 'cao' | 'trungBinh' | 'thap'): string => {
  switch (level) {
    case 'cao':
      return 'Cao';
    case 'trungBinh':
      return 'Trung Bình';
    case 'thap':
      return 'Thấp';
    default:
      return 'Không xác định';
  }
};

/** 3 mức rủi ro: Thấp (xám), Trung bình (vàng), Cao (đỏ) */
export const getRiskColorFromBackend = (level: string | undefined): number[] => {
  const l = level?.trim?.() ?? '';
  if (l === 'Rất cao' || l === 'Cao') return [220, 38, 38, 0.75]; // Đỏ
  if (l === 'Trung bình') return [234, 179, 8, 0.75]; // Vàng
  return [209, 213, 219, 0.7]; // Thấp / Rất thấp / default → Xám
};

export const getRiskOutlineColorFromBackend = (level: string | undefined): number[] => {
  const l = level?.trim?.() ?? '';
  if (l === 'Rất cao' || l === 'Cao') return [185, 28, 28, 0.9]; // Đỏ đậm
  if (l === 'Trung bình') return [202, 138, 4, 0.9]; // Vàng đậm
  return [156, 163, 175, 0.8]; // Xám
};
