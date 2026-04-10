import { Candle } from "../../../types/candle";

export function computeChoppy(candles: Candle[]): boolean {
  if (candles.length < 5) return false;

  let gaps = 0;

  for (let i = 1; i < candles.length; i++) {
    const prev = candles[i - 1];
    const cur = candles[i];

    if (!prev || !cur) continue; // ★ TS が安心するガード

    const gap = Math.abs(cur.open_price - prev.close_price);

    if (gap > prev.close_price * 0.003) gaps++; // 0.3% 以上のギャップ
  }

  return gaps >= 2;
}
