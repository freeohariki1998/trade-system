// src/services/trades/pairTrades.ts

import { db } from "../../db/mysql";
import { RawTrade } from "../../types/rawTrade";

interface TradeLogRow {
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

export async function getPairedTrades(): Promise<RawTrade[]> {
  const [rows] = await db.query(
    `
      SELECT code, action, side, price, quantity, trade_datetime, strategy_name, is_sim
      FROM trade_logs
      ORDER BY code ASC, trade_datetime ASC
    `
  );

  const logs = rows as TradeLogRow[];
  const paired: RawTrade[] = [];

  const buffer: { [key: string]: TradeLogRow | null } = {};

  for (const log of logs) {
    const key = `${log.code}-${log.side}`;

    if (log.action === "ENTRY") {
      // ENTRY をバッファに保存
      buffer[key] = log;
    }

    if (log.action === "SELL") {
      const entry = buffer[key];
      if (!entry) {
        // ENTRY がない SELL → 無視
        continue;
      }

      // ENTRY → SELL のペアが完成
      paired.push({
        id: entry.id,
        code: log.code,
        side: log.side,
        entry_price: entry.price,
        exit_price: log.price,
        qty: entry.quantity,
        entry_time: entry.trade_datetime,
        exit_time: log.trade_datetime,
        strategy: entry.strategy_name,
        is_sim: entry.is_sim,
      });

      // バッファをクリア
      buffer[key] = null;
    }
  }

  return paired;
}
