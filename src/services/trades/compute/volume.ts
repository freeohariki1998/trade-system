import { Candle } from "../../../types/candle";

/**
 * 出来高に関する2つの指標を計算する関数。
 *
 * トレードでは、
 * 「直近5分間の出来高の推移」がブレイク成功率に直結するため、
 * ・5分間の合計出来高（volume_5min_before）
 * ・直近1本の出来高（volume_5min_entry）
 * の2つを返す。
 *
 * これにより、
 * ・直前の出来高が増えているか
 * ・勢いが継続しているか
 * ・ブレイクに裏付けがあるか
 * を判定できる。
 */
export function computeVolumeMetrics(candles: Candle[]) {
    // 5分間の出来高合計（勢いのベース）
    const volume_5min_before = candles.reduce((s, c) => s + c.volume, 0);

    // 直近1本の出来高（ブレイク直前の勢い）
    const volume_5min_entry = candles[candles.length - 1]?.volume ?? 0;

    return { volume_5min_before, volume_5min_entry };
}
