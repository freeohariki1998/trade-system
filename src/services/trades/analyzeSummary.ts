import { Router } from "express";
const router = Router();
import { Trade, SummaryResult } from "../../types/trade";



// トレードの基本統計を返す関数
export function analyzeSummary(trades: Trade[]): SummaryResult {
    let totalProfit = 0;
    let wins = 0;
    let losses = 0;
    let winProfits: number[] = [];
    let lossProfits: number[] = [];

    
    for (const t of trades) {
        const profit = (t.exit_price - t.entry_price) * t.qty;
        totalProfit += profit;
        if (profit > 0) {
            wins++;
            winProfits.push(profit)
        }else {
            losses++;
            lossProfits.push(profit)
        }
    }
    

    const bestTrade = 
        trades.length > 0
            ?   trades.reduce((a, b) => {
                    const pa = (a.exit_price - a.entry_price) * a.qty;
                    const pb = (b.exit_price - b.entry_price) * b.qty;
                    return pa > pb ? a : b;
                })
            : null;
            
    const worstTrade = 
        trades.length > 0
        ?   trades.reduce((a, b) => {
                const pa = (a.exit_price - a.entry_price) * a.qty;
                const pb = (b.exit_price - b.entry_price) * b.qty;
                return pa < pb ? a : b;
            })
        : null;


  
    return {
        trade_count: trades.length,
        total_profit: totalProfit,
        win_rate: trades.length ? (wins / trades.length) * 100 : 0,
        avg_win: winProfits.length ? average(winProfits) : 0,
        avg_loss: lossProfits.length ? average(lossProfits) : 0,
        best_trade: bestTrade,
        worst_trade: worstTrade,
        };
}

const average = (arr: number[]): number => {
    return arr.reduce((a, b) => a + b ,0) / arr.length;
}
