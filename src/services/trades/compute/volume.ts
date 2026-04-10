import { Candle } from "../../../types/candle";

export function computeVolumeMetrics(candles: Candle[]) {
    const volume_5min_before = candles.reduce((s, c) => s + c.volume, 0);
    const volume_5min_entry = candles[candles.length - 1]?.volume ?? 0;
    return { volume_5min_before, volume_5min_entry };
}
  