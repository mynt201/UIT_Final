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
      return [239, 68, 68, 0.7];
    case 'trungBinh':
      return [252, 211, 77, 0.7];
    case 'thap':
      return [134, 239, 172, 0.7];
    default:
      return [200, 200, 200, 0.5];
  }
};

export const getRiskOutlineColor = (level: 'cao' | 'trungBinh' | 'thap'): number[] => {
  switch (level) {
    case 'cao':
      return [220, 38, 38, 0.8];
    case 'trungBinh':
      return [249, 115, 22, 0.8];
    case 'thap':
      return [34, 197, 94, 0.8];
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
