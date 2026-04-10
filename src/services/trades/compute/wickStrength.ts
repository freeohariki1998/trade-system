import { Candle } from "../../../types/candle";

export function computeWickStrength(candles: Candle[]) {
    const last = candles[candles.length - 1];
    if (!last) return { upper: 0, lower: 0 };
  
    const body = Math.abs(last.close_price - last.open_price);
    const upper = last.high_price - Math.max(last.close_price, last.open_price);
    const lower = Math.min(last.close_price, last.open_price) - last.low_price;
  
    return {
      upper: upper / (body + 1), // 正規化
      lower: lower / (body + 1),
    };
  }
  