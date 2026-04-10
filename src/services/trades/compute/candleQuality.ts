import { Candle } from "../../../types/candle";

export function computeCandleQuality(candles: Candle[]): number {
    if (candles.length === 0) return 0;
  
    let score = 0;
  
    // 陽線率
    const greenCount = candles.filter(c => c.close_price > c.open_price).length;
    const greenRate = greenCount / candles.length;
    if (greenRate >= 0.6) score += 2;
    else if (greenRate >= 0.4) score += 1;
  
    // 実体の大きさ（ボラティリティ）
    const avgBody =
      candles.reduce((s, c) => s + Math.abs(c.close_price - c.open_price), 0) /
      candles.length;
    if (avgBody > 0.5) score += 1;
  
    // ヒゲの短さ
    const avgUpperWick =
      candles.reduce(
        (s, c) => s + (c.high_price - Math.max(c.open_price, c.close_price)),
        0
      ) / candles.length;
  
    const avgLowerWick =
      candles.reduce(
        (s, c) => s + (Math.min(c.open_price, c.close_price) - c.low_price),
        0
      ) / candles.length;
  
    if (avgUpperWick < 0.3 && avgLowerWick < 0.3) score += 1;
  
    // 出来高増加（←ここを安全にする）
    const volumes = candles.map(c => c.volume);

    if (volumes.length >= 2) {
        const first = volumes[0]!;
        const last = volumes[volumes.length - 1]!;
        if (last > first) score += 1;
    }

  
    return Math.min(score, 5);
}
  