import { Candle } from "../../../types/candle";

/**
 * 連続陽線の本数を数える関数。
 * チャートの「直近の勢い」を測るために使用する。
 *
 * ・最新のローソク足から遡って数える
 * ・陽線が途切れたらそこで終了
 * ・例：🟩🟩🟩🟥🟩 → 結果は 3
 */
export function countConsecutiveGreen(candles: Candle[]): number {
  if (candles.length === 0) return 0;

  let count = 0;

  // 最新のローソク足（末尾）から逆順にチェック
  for (let i = candles.length - 1; i >= 0; i--) {
    const c = candles[i]!; // TS に「undefined じゃない」と保証

    // 陽線（close > open）ならカウント
    if (c.close_price > c.open_price) {
      count++;
    } else {
      // 陽線が途切れたら終了（勢いが止まった）
      break;
    }
  }

  return count;
}

/**
 * 連続陰線の本数を数える関数。
 * 「売り圧力の継続」を測るために使用する。
 *
 * ・最新のローソク足から遡って数える
 * ・陰線が途切れたら終了
 * ・例：🟥🟥🟥🟩🟥 → 結果は 3
 */
export function countConsecutiveRed(candles: Candle[]): number {
  if (candles.length === 0) return 0;

  let count = 0;

  for (let i = candles.length - 1; i >= 0; i--) {
    const c = candles[i]!;

    // 陰線（close < open）ならカウント
    if (c.close_price < c.open_price) {
      count++;
    } else {
      // 陰線が途切れたら終了
      break;
    }
  }

  return count;
}
