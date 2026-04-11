import { Trade } from "../../types/trade";

export function analyzePatterns(trades: Trade[]): string[] {
  const patterns: string[] = [];

  for (const t of trades) {
    const profit = (t.exit_price - t.entry_price) * t.qty;

    const entryDate = new Date(t.entry_time);
    const entryHour = entryDate.getHours();
    const entryMin = entryDate.getMinutes();
    const entryMinutes = entryHour * 60 + entryMin;


    const isWin = profit > 0;
    const isLose = profit < 0;

    // ============================
    // 出来高系
    // ============================
    if (isWin && t.volume_5min_entry > t.volume_5min_before) {
      patterns.push(
        `[出来高] ${t.code}  
         ・勝ち理由：直前5分で出来高が増加し、短期勢の買い圧力が強い状態でエントリーできた  
         ・改善点：このパターンは継続して狙うべき。出来高急増はあなたの得意パターン`
      );
    }

    if (isLose && t.volume_5min_entry < t.volume_5min_before) {
      patterns.push(
        `[出来高] ${t.code}  
         ・負け理由：直前5分で出来高が減少し、勢いが弱い状態でエントリーしてしまった  
         ・改善点：出来高が減っている時は “見送り” を基本にするべき`
      );
    }

    // ============================
    // 時間帯
    // ============================
    if (isWin && entryMinutes >= 540 && entryMinutes <= 630) {
      patterns.push(
        `[時間帯] ${t.code}  
         ・勝ち理由：朝の強い時間帯（9:00〜10:30）でエントリーできた  
         ・改善点：この時間帯は積極的に攻めてOK`
      );
    }

    if (isLose && entryHour === 12 && entryMin >= 50) {
      patterns.push(
        `[時間帯] ${t.code}  
         ・負け理由：後場の薄い時間帯（12:50〜13:10）でエントリーし、板が薄く逆行しやすい状況だった  
         ・改善点：この時間帯は “基本ノートレ” にするべき`
      );
    }

    // ============================
    // ブレイク形状
    // ============================
    if (isWin && t.breakout_score >= 4) {
      patterns.push(
        `[形状] ${t.code}  
         ・勝ち理由：ブレイクの形状が良く、勢いのあるポイントで入れている  
         ・改善点：形状が良い時はロットを増やす余地あり`
      );
    }

    if (isLose && t.breakout_score <= 2) {
      patterns.push(
        `[形状] ${t.code}  
         ・負け理由：ブレイクが汚く、騙しの可能性が高い場面で入ってしまった  
         ・改善点：形状が悪い時は “絶対に入らない” を徹底するべき`
      );
    }

    // ============================
    // ローソク足の質
    // ============================
    if (isWin && t.candle_quality >= 4) {
      patterns.push(
        `[ローソク足] ${t.code}  
         ・勝ち理由：ローソク足の質が良く、買い優勢の流れに乗れている  
         ・改善点：質が良い時は積極的に攻めてOK`
      );
    }

    if (isLose && t.candle_quality <= 2) {
      patterns.push(
        `[ローソク足] ${t.code}  
         ・負け理由：ローソク足が汚く、方向感のない場面でエントリーしてしまった  
         ・改善点：ローソク足が汚い時は “見送り” を徹底するべき`
      );
    }

    // ============================
    // 地合い
    // ============================
    if (isWin && t.market_strength >= 1) {
      patterns.push(
        `[地合い] ${t.code}  
         ・勝ち理由：地合いが強いタイミングでエントリーできた  
         ・改善点：地合いが強い日は積極的に攻めてOK`
      );
    }

    if (isLose && t.market_strength <= -1) {
      patterns.push(
        `[地合い] ${t.code}  
         ・負け理由：地合いが弱い中でエントリーし、逆行しやすい状況だった  
         ・改善点：地合いが弱い日は “逆張り禁止” を徹底するべき`
      );
    }

    // ============================
    // 連続陽線 / 連続陰線
    // ============================
    if (isWin && t.consecutive_green >= 2) {
      patterns.push(
        `[モメンタム] ${t.code}  
         ・勝ち理由：連続陽線のモメンタムに乗れている  
         ・改善点：モメンタムが強い時はロットを増やす余地あり`
      );
    }

    if (isLose && t.consecutive_red >= 2) {
      patterns.push(
        `[モメンタム] ${t.code}  
         ・負け理由：連続陰線の流れに逆らい、逆張りになってしまった  
         ・改善点：連続陰線の時は “順張りのみ” にするべき`
      );
    }

    // ============================
    // トレンド方向
    // ============================
    if (isWin && t.trend_5min === "UP") {
      patterns.push(
        `[トレンド] ${t.code}  
         ・勝ち理由：5分足の上昇トレンドに順張りできている  
         ・改善点：トレンド一致はあなたの得意パターン`
      );
    }

    if (isLose && t.trend_5min === "DOWN") {
      patterns.push(
        `[トレンド] ${t.code}  
         ・負け理由：下降トレンドに逆らってしまった  
         ・改善点：下降トレンドでは “買い禁止” を徹底するべき`
      );
    }
  }

  return patterns;
}
