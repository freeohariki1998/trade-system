import { Candle } from "../../../types/candle";


/**
 * ローソク足の「質」を0 ~ 5 点でスコア化する関数
 * トレードロジックに基づき
 * ・陽線率
 * ・実態の大きさ（ボラティリティ）
 * ・ヒゲの短さ
 * ・出来高の増加
 * を総合評価する
 */

export function computeCandleQuality(candles: Candle[]): number {
  // ローソク足がない場合はスコア0
  if (candles.length === 0) return 0;

  let score = 0;

  // ------------------------------------------------------------------
  // 陽線率(買い優勢かどうか)
  // ------------------------------------------------------------------
  // close > open のローソク足をカウント
  const greenCount = candles.filter(c => c.close_price > c.open_price).length;
  const greenRate = greenCount / candles.length;
  // 陽線率が高いほど買い圧力が強い → スコア加点
  if (greenRate >= 0.6) score += 2; // 強い買い優勢
  else if (greenRate >= 0.4) score += 1; // そこそこ買い優勢

  // ---------------------------------------------------------
  // 実体の大きさ（ボラティリティ）
  // ---------------------------------------------------------
  // 実体 = |close - open|
  const avgBody =
    candles.reduce((s, c) => s + Math.abs(c.close_price - c.open_price), 0) /
    candles.length;
  // 実体が大きい → 明確な方向性がある → スコア加点
  if (avgBody > 0.5) score += 1;

  // ---------------------------------------------------------
  // ヒゲの短さ（ノイズの少なさ）
  // ---------------------------------------------------------
  // 上ヒゲ = high - max(open, close)
  const avgUpperWick =
    candles.reduce(
      (s, c) => s + (c.high_price - Math.max(c.open_price, c.close_price)),
      0
    ) / candles.length;
  // 下ヒゲ = min(open, close) - low
  const avgLowerWick =
    candles.reduce(
      (s, c) => s + (Math.min(c.open_price, c.close_price) - c.low_price),
      0
    ) / candles.length;
  // ヒゲが短い → ノイズが少なく綺麗なチャート → スコア加点
  if (avgUpperWick < 0.3 && avgLowerWick < 0.3) score += 1;

  // ---------------------------------------------------------
  // 出来高の増加（勢いの有無）
  // ---------------------------------------------------------
  // 出来高配列を作成
  const volumes = candles.map(c => c.volume);
  // 安全に first/last を参照（length チェック）
  if (volumes.length >= 2) {
    const first = volumes[0]!;
    const last = volumes[volumes.length - 1]!;
    // 最後の出来高が最初より増えている → 勢いがある → 加点
    if (last > first) score += 1;
  }
  // スコアは最大 5 点に制限
  return Math.min(score, 5);
}
