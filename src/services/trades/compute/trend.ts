import { Candle } from "../../../types/candle";

export function computeTrend5min(candles: Candle[]): "UP" | "DOWN" | "FLAT" {
  // データがない場合
  if (candles.length === 0) return "FLAT";

  // 安全に first / last を取得
  const first = candles[0];
  const last = candles[candles.length - 1];

  // 念のため undefined ガード（TS 的に完全安全）
  if (!first || !last) return "FLAT";

  const start = first.close_price;
  const end = last.close_price;

  // 0除算防止
  if (start === 0) return "FLAT";

  const changeRate = (end - start) / start;

  if (changeRate > 0.002) return "UP";     // +0.2%
  if (changeRate < -0.002) return "DOWN";  // -0.2%

  return "FLAT";
}
