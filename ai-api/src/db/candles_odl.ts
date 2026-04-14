import { db } from "./mysql";
import { RawTrade } from "../types/rawTrade";

export async function getCandlesOld(): Promise<RawTrade[]> {
  const [rows] = await db.query(
    `
    SELECT code, action, side, price, quantity, trade_datetime, strategy_name, is_sim
    FROM trade_logs_old
    ORDER BY code ASC, trade_datetime ASC
  `
  );

  return rows as RawTrade[];
}
