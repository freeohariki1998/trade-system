import { Router } from "express";
import { getTradeCollection } from "../../services/rag/chromaClient";

const router = Router();

router.post("/", async (req, res) => {
    const { query } = req.body;

    const collection = await getTradeCollection();

    const result = await collection.query({
        queryTexts: [query],
        nResults: 5,
    });

    res.json({ similar: result.documents });
});

export default router;