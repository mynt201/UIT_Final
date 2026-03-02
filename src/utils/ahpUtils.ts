/**
 * Phân tích thứ bậc AHP (Analytic Hierarchy Process)
 * Chuyển đánh giá định tính (ma trận so sánh cặp) thành trọng số định lượng
 */

export interface AHPResult {
  weights: number[];
  consistencyRatio: number;
  isValid: boolean;
}

/**
 * Tính trọng số AHP từ ma trận so sánh cặp
 * @param matrix - Ma trận vuông n×n (a[i][j] = mức quan trọng của i so với j)
 * @returns Trọng số, CR, và isValid (CR < 0.1)
 */
export function calculateAHP(matrix: number[][]): AHPResult {
  const n = matrix.length;
  if (n === 0) return { weights: [], consistencyRatio: 0, isValid: true };

  // Bước 1: Tổng từng cột
  const columnSums = new Array(n).fill(0);
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      columnSums[j] += matrix[i][j];
    }
  }

  // Bước 2: Chuẩn hóa và trung bình dòng (trọng số)
  const weights = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    let rowSumNormalized = 0;
    for (let j = 0; j < n; j++) {
      rowSumNormalized += matrix[i][j] / columnSums[j];
    }
    weights[i] = rowSumNormalized / n;
  }

  // Bước 3: Consistency Ratio (CR)
  let lamdaMax = 0;
  for (let j = 0; j < n; j++) {
    lamdaMax += columnSums[j] * weights[j];
  }
  const ci = n > 1 ? (lamdaMax - n) / (n - 1) : 0;
  const riTable = [0, 0, 0, 0.58, 0.9, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49];
  const ri = riTable[Math.min(n, 10)] ?? 1.49;
  const cr = ri === 0 ? 0 : ci / ri;
  // n < 3: ma trận luôn nhất quán (không cần CR)
  const isValid = n < 3 ? true : cr < 0.1;

  return {
    weights: weights.map((w) => parseFloat(w.toFixed(4))),
    consistencyRatio: parseFloat(cr.toFixed(4)),
    isValid,
  };
}

/**
 * Tạo ma trận mặc định (tất cả = 1) cho n chỉ số
 */
export function createEmptyAHPMatrix(n: number): number[][] {
  return Array.from({ length: n }, () => new Array(n).fill(1));
}

/**
 * Cập nhật ô [i][j], tự động set [j][i] = 1/value
 */
export function setMatrixCell(
  matrix: number[][],
  i: number,
  j: number,
  value: number
): number[][] {
  const next = matrix.map((row) => [...row]);
  const v = Math.max(0.111, Math.min(9, value));
  next[i][j] = v;
  next[j][i] = i === j ? 1 : parseFloat((1 / v).toFixed(4));
  return next;
}
