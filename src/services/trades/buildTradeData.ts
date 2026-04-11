// src/services/trades/buildTradeData.ts

import { RawTrade } from "../../types/rawTrade";
import { Trade } from "../../types/trade";
import { Candle } from "../../types/candle";

import { getCandles } from "../../db/candles";

// --- 各種指標計算ロジック ---
import { computeCandleQuality } from "./compute/candleQuality";
import { computeBreakoutScore } from "./compute/breakoutScore";
import { computeTrend5min } from "./compute/trend";
import { countConsecutiveGreen, countConsecutiveRed } from "./compute/consecutive";
import { computeVolumeMetrics } from "./compute/volume";
import { computeMarketStrength } from "./compute/marketStrength";
import { computeWickStrength } from "./compute/wickStrength";
import { computeChoppy } from "./compute/choppy";
import { computeWavePosition } from "./compute/wavePosition";
import { computeBreakoutQuality } from "./compute/breakoutQuality";
import { computeVolumeQuality } from "./compute/volumeQuality";

/**
 * RawTrade（生のトレード情報）を受け取り、
 * チャートの構造・勢い・地合いなどの指標を付与した
 * 完全な Trade オブジェクトを生成する関数。
 *
 * トレードをすべて数値化し、
 * RAG や LLM 分析に使える「構造化されたトレードデータ」を作る。
 */
export async function buildTradeData(rawTrade: RawTrade): Promise<Trade> {
  // エントリー時刻
  const entry = new Date(rawTrade.entry_time);

  // ---------------------------------------------------------
  // エントリー直前5分間のローソク足を取得
  // ---------------------------------------------------------
  // 直前5分〜直前1分のデータを使う理由：
  // → エントリー直前の勢い・質・地合いが勝敗に最も影響するため
  const fiveMinBefore = new Date(entry.getTime() - 5 * 60 * 1000);
  const oneMinBefore = new Date(entry.getTime() - 1 * 60 * 1000);

  let candles: Candle[] = [];
  try {
    candles = await getCandles(rawTrade.code, fiveMinBefore, oneMinBefore);
  } catch (e) {
    console.error("getCandles error:", e);
    candles = []; // データが取れない場合は空配列で安全に処理
  }

  // ---------------------------------------------------------
  // 出来高関連（勢いのベース & 直前の強さ）
  // ---------------------------------------------------------
  const { volume_5min_before, volume_5min_entry } = computeVolumeMetrics(candles);

  // ---------------------------------------------------------
  // チャート構造・勢い・質の指標を計算
  // ---------------------------------------------------------
  const candle_quality = computeCandleQuality(candles);           // チャートの綺麗さ
  const breakout_score = computeBreakoutScore(candles);           // ブレイクの形状
  const consecutive_green = countConsecutiveGreen(candles);       // 連続陽線
  const consecutive_red = countConsecutiveRed(candles);           // 連続陰線
  const trend_5min = computeTrend5min(candles);                   // 直近5分のトレンド
  const wick = computeWickStrength(candles);                      // ヒゲ圧力
  const is_choppy = computeChoppy(candles);                       // チャートのノイズ
  const wave_position = computeWavePosition(candles);             // 波の位置（初動/2段目/3段目）
  const breakout_quality = computeBreakoutQuality(candles);       // ブレイクの瞬間の質
  const volume_quality = computeVolumeQuality(candles);           // 出来高の質（連続性）

  // ---------------------------------------------------------
  // 地合い（指数の5分間の変化率）
  // ---------------------------------------------------------
  const market_strength = await computeMarketStrength(entry);

  // ---------------------------------------------------------
  // Trade オブジェクトとして返す
  // ---------------------------------------------------------
  // rawTrade の情報に、上で計算した指標をすべて付与する
  return {
    ...rawTrade,

    // 出来高
    volume_5min_before,
    volume_5min_entry,

    // チャート構造
    candle_quality,
    breakout_score,
    consecutive_green,
    consecutive_red,
    trend_5min,
    market_strength,

    // ヒゲ
    wick_upper_strength: wick.upper,
    wick_lower_strength: wick.lower,

    // ノイズ・波
    is_choppy,
    wave_position,

    // ブレイクの質
    breakout_quality,

    // 出来高の質
    volume_quality,
  };
}
