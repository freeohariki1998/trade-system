// src/services/trades/compute/marketStrength.ts

import { Candle } from "../../../types/candle";
import { getCandles } from "../../../db/candles";

/**
 * 市場全体（TOPIX/Nikkei）の「地合いの強さ」を -2〜+2 で返す関数。
 *
 * トレードでは、
 * ・地合いが強いとブレイク成功率が上がる
 * ・地合いが弱いとフェイクブレイクが増える
 * ため、指数の直近5分間の変化率を使って地合いを数値化している。
 *
 * 判定基準：
 *   +2 → +0.3%以上の上昇（強い）
 *   +1 → +0.1%以上の上昇（やや強い）
 *    0 → ±0.1%以内（ニュートラル）
 *   -1 → -0.1%以下の下落（やや弱い）
 *   -2 → -0.3%以下の下落（弱い）
 */
export async function computeMarketStrength(entryTime: Date): Promise<number> {
  // まだ指数データが DB にないため、仮のコードを使用
  // 将来的には TOPIX のコードを入れる予定
  const INDEX_CODE = 9999;

  // entry の 5 分前〜1 分前の指数を取得する
  const fiveMinBefore = new Date(entryTime.getTime() - 5 * 60 * 1000);
  const oneMinBefore = new Date(entryTime.getTime() - 1 * 60 * 1000);

  let candles: Candle[] = [];

  try {
    // 指数のローソク足を取得（1分足）
    candles = await getCandles(INDEX_CODE, fiveMinBefore, oneMinBefore);
  } catch (e) {
    // DB に指数データが無い場合 → 地合い不明 → ニュートラル扱い
    return 0;
  }

  // データが少なすぎる場合もニュートラル
  if (candles.length < 2) return 0;

  const first = candles[0];                     // 5分前の指数
  const last = candles[candles.length - 1];     // 1分前の指数

  if (!first || !last) return 0;

  const start = first.close_price;
  const end = last.close_price;

  if (start === 0) return 0;

  // 5分間の変化率（rate）を計算
  const rate = (end - start) / start;

  // ---------------------------------------------------------
  // 変化率に応じて地合いスコアを返す
  // ---------------------------------------------------------

  // +0.3% 以上 → 強い上昇 → 地合い +2
  if (rate > 0.003) return 2;

  // +0.1% 以上 → やや強い → 地合い +1
  if (rate > 0.001) return 1;

  // -0.3% 以下 → 強い下落 → 地合い -2
  if (rate < -0.003) return -2;

  // -0.1% 以下 → やや弱い → 地合い -1
  if (rate < -0.001) return -1;

  // ±0.1% 以内 → 地合いニュートラル
  return 0;
}
