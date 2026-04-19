import { Request, Response, Router } from "express";
import { getCandlesOld } from "../../db/candles_odl"
import { buildTradeData } from "../../services/trades/buildTradeData";
const router = Router();

import { getPairedTradesOld } from "../../services/trades/pairTradesOld";
const listHandler = async (_req: Request, res: Response) => {
    const rawTrades = await getPairedTradesOld();
    const trades = await Promise.all(rawTrades.map(t => buildTradeData(t)));
    res.json(trades);
};


router.get("/", listHandler);
router.post("/", listHandler);
export default router;