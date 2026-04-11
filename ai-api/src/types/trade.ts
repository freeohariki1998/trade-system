export interface Trade {
    id: number;
    code: number;
    side: "BUY" | "SELL";
    entry_price: number;
    exit_price: number;
    qty: number;
    entry_time: string;
    exit_time: string;
    strategy: string;
    is_sim: number;
  
    volume_5min_before: number;
    volume_5min_entry: number;
    candle_quality: number;
    breakout_score: number;
    consecutive_green: number;
    consecutive_red: number;
    trend_5min: "UP" | "DOWN" | "FLAT";
    market_strength: number;
    wick_upper_strength: number;
    wick_lower_strength: number;
    is_choppy: boolean;
    wave_position: number;
    breakout_quality: number;
    volume_quality: number;
  }
  
  

export interface SummaryResult {
    trade_count: number;
    total_profit: number;
    win_rate: number;
    avg_win: number;
    avg_loss: number;
    best_trade: Trade | null;
    worst_trade: Trade | null;
  }


  export type PatternResult = string[];

