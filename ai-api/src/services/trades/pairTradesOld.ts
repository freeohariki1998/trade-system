import { RawTrade } from "../../types/rawTrade";
import { OldLog } from "../../types/oldLog";
import { getCandlesOld } from "../../db/candles_odl";


export async function getPairedTradesOld(): Promise<RawTrade[]> {
    const rows: OldLog[] = await getCandlesOld();


    const map = new Map<string, OldLog>();
    const paired: RawTrade[] = [];

    for (const row of rows) {
        const key = `${row.code}_${row.side}`;

        if (row.action === "ENTRY") {
            map.set(key, row);
        }

        if (row.action === "SELL") {
            const entry = map.get(key);
            if (!entry) continue;

            if (new Date(row.trade_datetime) < new Date(entry.trade_datetime)) {
                continue;
            }

            paired.push({
                id: entry.id,
                code: entry.code,
                side: entry.side,
                entry_price: entry.price,
                exit_price: row.price,
                qty: entry.quantity,
                entry_time: entry.trade_datetime,
                exit_time: row.trade_datetime,
                strategy: entry.strategy_name,
                is_sim: entry.is_sim,
            });

            map.delete(key);
        }
    }

    return paired;
}
