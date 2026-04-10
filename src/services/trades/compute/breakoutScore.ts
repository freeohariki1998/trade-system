import { Candle } from "../../../types/candle";

export function computeBreakoutScore(candles: Candle[]): number {
  if (candles.length === 0) return 0;

  let score = 0;

  // ============================
  // 高値更新
  // ============================
  const highs = candles.map(c => c.high_price);

  if (highs.length >= 2) {
    const lastHigh = highs.at(-1)!;
    const prevHigh = Math.max(...highs.slice(0, -1));
    if (lastHigh > prevHigh) score += 2;
  }

  // ============================
  // 出来高増加
  // ============================
  const volumes = candles.map(c => c.volume);

  if (volumes.length >= 2) {
    const first = volumes.at(0)!;
    const last = volumes.at(-1)!;
    if (last > first) score += 1;
  }

  // ============================
  // 陽線連続
  // ============================
  const greenCount = candles.filter(c => c.close_price > c.open_price).length;
  if (greenCount >= 3) score += 1;

  // ============================
  // 実体が大きい
  // ============================
  const lastCandle = candles.at(-1)!;
  if (Math.abs(lastCandle.close_price - lastCandle.open_price) > 0.5) {
    score += 1;
  }

  return Math.min(score, 5);
}
