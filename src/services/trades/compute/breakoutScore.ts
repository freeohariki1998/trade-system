import { Candle } from "../../../types/candle";

/**
 * ブレイクアウトの「形」を 0〜5 点でスコア化する関数。
 * 直近の複数ローソク足から、
 * ・高値更新の強さ
 * ・出来高の増加
 * ・陽線の連続性
 * ・実体の大きさ
 * を総合評価する。
 *
 * computeBreakoutQuality が「直近2本の質」を見るのに対し、
 * この関数は「直近数本の流れ・形状」を見る役割。
 */
export function computeBreakoutScore(candles: Candle[]): number {
  // ローソク足が無い場合はスコア 0
  if (candles.length === 0) return 0;

  let score = 0;

  // =========================================================
  // 高値更新（ブレイクの形として最重要）
  // =========================================================
  // 各ローソク足の high を配列化
  const highs = candles.map(c => c.high_price);

  if (highs.length >= 2) {
    const lastHigh = highs.at(-1)!;          // 最新ローソク足の高値
    const prevHigh = Math.max(...highs.slice(0, -1)); // 過去の最高値

    // 最新の高値が過去最高値を更新している → 明確なブレイク
    if (lastHigh > prevHigh) score += 2;
  }

  // =========================================================
  // 出来高増加（勢いの裏付け）
  // =========================================================
  const volumes = candles.map(c => c.volume);

  if (volumes.length >= 2) {
    const first = volumes.at(0)!;            // 最初の出来高
    const last = volumes.at(-1)!;            // 最新の出来高

    // 出来高が増えている → ブレイクに勢いがある
    if (last > first) score += 1;
  }

  // =========================================================
  // 陽線連続（買い圧力の継続）
  // =========================================================
  const greenCount = candles.filter(c => c.close_price > c.open_price).length;

  // 陽線が3本以上 → 買いが継続している強い流れ
  if (greenCount >= 3) score += 1;

  // =========================================================
  // 実体が大きい（方向性が明確）
  // =========================================================
  const lastCandle = candles.at(-1)!;

  // 実体 = |close - open|
  // 実体が大きい → 迷いが少なく、方向性が強い
  if (Math.abs(lastCandle.close_price - lastCandle.open_price) > 0.5) {
    score += 1;
  }

  // 最大スコアは 5
  return Math.min(score, 5);
}
