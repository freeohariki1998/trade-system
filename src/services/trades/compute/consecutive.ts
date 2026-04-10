import { Candle } from "../../../types/candle";

export function countConsecutiveGreen(candles: Candle[]): number {
  if (candles.length === 0) return 0;

  let count = 0;

  // 後ろ（最新）から遡って数える
  for (let i = candles.length - 1; i >= 0; i--) {
    const c = candles[i]!;
    if (c.close_price > c.open_price) {
      count++;
    } else {
      break;
    }
  }

  return count;
}

export function countConsecutiveRed(candles: Candle[]): number {
  if (candles.length === 0) return 0;

  let count = 0;

  for (let i = candles.length - 1; i >= 0; i--) {
    const c = candles[i]!;
    if (c.close_price < c.open_price) {
      count++;
    } else {
      break;
    }
  }

  return count;
}
