import { Candle } from "../../../types/candle";

/**
 * 直近5本（最大）のローソク足から「5分間のトレンド方向」を判定する関数。
 *
 * トレードでは、
 * ・直近のミニトレンドが上向きならブレイク成功率が上がる
 * ・逆に下向きならフェイクブレイクが増える
 * ため、5分間の変化率を使って UP / DOWN / FLAT を返す。
 *
 * 判定基準：
 *   +0.2%以上 → "UP"
 *   -0.2%以下 → "DOWN"
 *   それ以外 → "FLAT"
 */
export function computeTrend5min(candles: Candle[]): "UP" | "DOWN" | "FLAT" {
  // ローソク足が無い場合はトレンド不明 → FLAT
  if (candles.length === 0) return "FLAT";

  // 最初と最後のローソク足を安全に取得
  const first = candles[0];                       // 5分前の足
  const last = candles[candles.length - 1];       // 最新の足

  // TS の undefined ガード（安全性のため）
  if (!first || !last) return "FLAT";

  const start = first.close_price;                // 5分前の終値
  const end = last.close_price;                   // 現在の終値

  // 0除算防止（異常データ対策）
  if (start === 0) return "FLAT";

  // 5分間の変化率（rate）を計算
  const changeRate = (end - start) / start;

  // ---------------------------------------------------------
  // 変化率に応じてトレンド方向を返す
  // ---------------------------------------------------------

  // +0.2% 以上 → 明確な上昇トレンド
  if (changeRate > 0.002) return "UP";

  // -0.2% 以下 → 明確な下降トレンド
  if (changeRate < -0.002) return "DOWN";

  // ±0.2% 以内 → トレンドなし（レンジ）
  return "FLAT";
}
