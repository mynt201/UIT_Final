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
      return [220, 38, 38, 0.75]; // Đỏ đậm hơn
    case 'trungBinh':
      return [251, 146, 60, 0.75]; // Cam/vàng đậm hơn
    case 'thap':
      return [209, 213, 219, 0.7]; // Xám nhạt như trong hình
    default:
      return [200, 200, 200, 0.5];
  }
};

export const getRiskOutlineColor = (level: 'cao' | 'trungBinh' | 'thap'): number[] => {
  switch (level) {
    case 'cao':
      return [185, 28, 28, 0.9]; // Đỏ đậm
    case 'trungBinh':
      return [234, 88, 12, 0.9]; // Cam đậm
    case 'thap':
      return [156, 163, 175, 0.8]; // Xám nhạt
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
