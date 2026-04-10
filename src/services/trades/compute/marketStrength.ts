// src/services/trades/compute/marketStrength.ts

import { Candle } from "../../../types/candle";
import { getCandles } from "../../../db/candles";

export async function computeMarketStrength(entryTime: Date): Promise<number> {
  // まだ指数データが DB にない場合はニュートラル
  const INDEX_CODE = 9999; // TOPIX を入れる予定の仮コード

  const fiveMinBefore = new Date(entryTime.getTime() - 5 * 60 * 1000);
  const oneMinBefore = new Date(entryTime.getTime() - 1 * 60 * 1000);

  let candles: Candle[] = [];

  try {
    candles = await getCandles(INDEX_CODE, fiveMinBefore, oneMinBefore);
  } catch (e) {
    // DB に指数データがない → ニュートラル
    return 0;
  }

  // データがない → ニュートラル
  if (candles.length < 2) return 0;

  const first = candles[0];
  const last = candles[candles.length - 1];

  if (!first || !last) return 0;

  const start = first.close_price;
  const end = last.close_price;

  if (start === 0) return 0;

  const rate = (end - start) / start;

  // +0.3% 以上 → 強い
  if (rate > 0.003) return 2;
  // +0.1% 以上 → やや強い
  if (rate > 0.001) return 1;
  // -0.3% 以下 → 弱い
  if (rate < -0.003) return -2;
  // -0.1% 以下 → やや弱い
  if (rate < -0.001) return -1;

  // それ以外 → ニュートラル
  return 0;
}
