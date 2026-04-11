import { Router } from "express";
import { getTradeCollection } from "../../services/rag/chromaClient"
import { Trade } from "../../types/trade";
const router = Router();

router.post("/", async (req, res) => {
    const trades: Trade[] = req.body.trades;

    const collection = await getTradeCollection();

    const ids = trades.map(t => String(t.id));
    const docs = trades.map(t => JSON.stringify(t));

    await collection.upsert({ ids, documents: docs});

    res.json({message: "保存完了"})
});

export default router;