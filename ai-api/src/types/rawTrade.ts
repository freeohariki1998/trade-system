export interface RawTrade {
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
  }
    