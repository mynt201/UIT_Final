export function calcFloodRiskIndex(exposure: number, susceptibility: number, resilience: number) {
  const risk = (0.4 * exposure + 0.4 * susceptibility) / (resilience || 1);

  return Number(risk.toFixed(2));
}
