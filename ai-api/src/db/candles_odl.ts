import { db } from "./mysql";
import { RawTrade } from "../types/rawTrade";
import { OldLog } from "../types/oldLog";
export async function getCandlesOld(): Promise<OldLog[]> {
  const [rows] = await db.query(
    `
    SELECT *
    FROM trade_logs_old
    WHERE is_sim = '0'
    ORDER BY id
  `
  );

  return rows as OldLog[];
}
