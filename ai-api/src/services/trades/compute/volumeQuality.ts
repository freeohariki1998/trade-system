import { Candle } from "../../../types/candle";

/**
 * 出来高の「質」を 1〜5 点でスコア化する関数。
 *
 * トレードでは、
 * ・出来高の連続的な増加
 * ・直近の出来高の跳ね上がり
 * がブレイク成功率に直結するため、
 * 5本のローソク足の出来高を使って
 * 「勢いの継続」と「直近の強さ」を評価する。
 */
export function computeVolumeQuality(candles: Candle[]): number {
  // データが5本未満 → 評価不能 → 最低スコア1
  if (candles.length < 5) return 1;

  // 出来高だけの配列を作成
  const vols = candles.map(c => c.volume);

  // 5本の平均出来高（基準値）
  const avg = vols.reduce((a, b) => a + b, 0) / vols.length;

  // 初期スコア（最低1点）
  let score = 1;

  // ---------------------------------------------------------
  // ① 直近の出来高が平均より20%高い → 勢いが強い
  // ---------------------------------------------------------
  if (vols[4] !== undefined && vols[4] > avg * 1.2) score++;

  // ---------------------------------------------------------
  // ② 出来高が直近で連続的に増えているかを評価
  //    vols[1] → vols[2] → vols[3] → vols[4]
  // ---------------------------------------------------------

  // 直近の出来高が1本前より増えている
  if (vols[4] !== undefined && vols[3] !== undefined && vols[4] > vols[3]) score++;

  // 2本前 → 3本前も増加
  if (vols[3] !== undefined && vols[2] !== undefined && vols[3] > vols[2]) score++;

  // 3本前 → 4本前も増加
  if (vols[2] !== undefined && vols[1] !== undefined && vols[2] > vols[1]) score++;

  // 最大スコアは5
  return Math.min(score, 5);
}
