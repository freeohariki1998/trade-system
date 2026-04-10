// src/services/trades/buildTradeData.ts

import { RawTrade } from "../../types/rawTrade";
import { Trade } from "../../types/trade";
import { Candle } from "../../types/candle";

import { getCandles } from "../../db/candles";

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

export async function buildTradeData(rawTrade: RawTrade): Promise<Trade> {
  const entry = new Date(rawTrade.entry_time);

  // 直前5分〜直前1分
  const fiveMinBefore = new Date(entry.getTime() - 5 * 60 * 1000);
  const oneMinBefore = new Date(entry.getTime() - 1 * 60 * 1000);

  // 1分足取得
  let candles: Candle[] = [];
  try {
    candles = await getCandles(rawTrade.code, fiveMinBefore, oneMinBefore);
  } catch (e) {
    console.error("getCandles error:", e);
    candles = [];
  }

  // volume
  const { volume_5min_before, volume_5min_entry } = computeVolumeMetrics(candles);

  // 各種指標
  const candle_quality = computeCandleQuality(candles);
  const breakout_score = computeBreakoutScore(candles);
  const consecutive_green = countConsecutiveGreen(candles);
  const consecutive_red = countConsecutiveRed(candles);
  const trend_5min = computeTrend5min(candles);
  const wick = computeWickStrength(candles);
  const is_choppy = computeChoppy(candles);
  const wave_position = computeWavePosition(candles);
  const breakout_quality = computeBreakoutQuality(candles);
  const volume_quality = computeVolumeQuality(candles);

  // 地合い
  const market_strength = await computeMarketStrength(entry);

  return {
    ...rawTrade,
    volume_5min_before,
    volume_5min_entry,
    candle_quality,
    breakout_score,
    consecutive_green,
    consecutive_red,
    trend_5min,
    market_strength,
    wick_upper_strength: wick.upper,
    wick_lower_strength: wick.lower,
    is_choppy,
    wave_position,
    breakout_quality,
    volume_quality,
  };
}
