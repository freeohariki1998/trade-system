import { Candle } from "../../../types/candle";

export function computeWavePosition(candles: Candle[]): number {
  if (candles.length < 5) return 1;

  const highs = candles.map(c => c.high_price);
  if (highs.length < 5) return 1;

  const max = Math.max(...highs);
  const last = highs[highs.length - 1]!;

  if (last >= max * 0.98) return 2; // 2段目
  if (last >= max * 0.90) return 3; // 3段目

  return 1; // 初動
}
