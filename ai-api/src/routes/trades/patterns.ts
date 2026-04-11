import { Router } from "express";
const router = Router();


// → 過去ログから勝ちパターン・負けパターンを抽出
// → その日のトレードと照合
// → 「今日の負けはこのパターンに該当」などを返す


router.post("/", async (req, res) => {
    const { trades } = req.body;
    if (!trades) return res.status(400).json({ error: "trades が必要です" });

    // ここに分析ロジックを入れる
});

export default router;