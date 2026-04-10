import { Candle } from "../../../types/candle";

export function computeBreakoutQuality(candles: Candle[]): number {
  if (candles.length < 2) return 1;

  const last = candles[candles.length - 1];
  const prev = candles[candles.length - 2];

  if (!last || !prev) return 1;

  let score = 0;

  if (last.close_price > prev.high_price) score += 2;
  if (last.volume > prev.volume * 1.3) score += 2;
  if (last.close_price > last.open_price) score += 1;

  return Math.min(score, 5);
}
