import { Candle } from "../../../types/candle";

/**
 * 最新ローソク足の「ヒゲの強さ」を計算する関数。
 *
 * トレードでは、
 * ・上ヒゲが長い → 売り圧力が強い（上値が重い）
 * ・下ヒゲが長い → 買い圧力が強い（下値が固い）
 * という重要な判断材料になるため、
 * ヒゲの長さを「実体の大きさで正規化」して返す。
 *
 * 戻り値：
 *   upper: 上ヒゲの強さ（0〜∞）
 *   lower: 下ヒゲの強さ（0〜∞）
 *
 * 値が大きいほどヒゲが強い（圧力が強い）ことを意味する。
 */
export function computeWickStrength(candles: Candle[]) {
  // 最新ローソク足が無い場合 → ヒゲなし扱い
  const last = candles[candles.length - 1];
  if (!last) return { upper: 0, lower: 0 };

  // 実体の大きさ（正規化の基準）
  const body = Math.abs(last.close_price - last.open_price);

  // 上ヒゲ = high - max(open, close)
  const upper = last.high_price - Math.max(last.close_price, last.open_price);

  // 下ヒゲ = min(open, close) - low
  const lower = Math.min(last.close_price, last.open_price) - last.low_price;

  return {
    // 実体 + 1 で割ることで「正規化」し、極端な値を防ぐ
    upper: upper / (body + 1),
    lower: lower / (body + 1),
  };
}
