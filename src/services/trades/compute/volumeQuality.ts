import { Candle } from "../../../types/candle";

export function computeVolumeQuality(candles: Candle[]): number {
  if (candles.length < 5) return 1;

  const vols = candles.map(c => c.volume);
  const avg = vols.reduce((a, b) => a + b, 0) / vols.length;

  let score = 1;
  if (vols.length >= 5) {
    if (vols[4] !== undefined && vols[4] > avg * 1.2) score++;
    if (vols[4] !== undefined && vols[3] !== undefined && vols[4] > vols[3]) score++;
    if (vols[3] !== undefined && vols[2] !== undefined && vols[3] > vols[2]) score++;
    if (vols[2] !== undefined && vols[1] !== undefined && vols[2] > vols[1]) score++;
  }
  
  

  return Math.min(score, 5);
}
