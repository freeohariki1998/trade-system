export interface OldLog {
    id: number;
    code: number;
    action: "ENTRY" | "SELL";
    side: "BUY" | "SELL";
    price: number;
    quantity: number;
    trade_datetime: string;
    strategy_name: string;
    is_sim: number;
}
