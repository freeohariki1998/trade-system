import { db } from "./mysql";
import { Candle } from "../types/candle";

export async function getCandles(code: number, start: Date, end: Date): Promise<Candle[]> {
  const [rows] = await db.query(
    `
      SELECT id, code, datetime, open_price, high_price, low_price, close_price, volume
      FROM stock_prices
      WHERE code = ?
        AND datetime BETWEEN ? AND ?
      ORDER BY datetime ASC
    `,
    [code, start, end]
  );

  return rows as Candle[];
}
