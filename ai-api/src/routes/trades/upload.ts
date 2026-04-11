import { Router } from "express";
const router = Router();

// → トレードログ（CSV / JSON）をアップロード
// → DB に保存
// → 必要なら embedding 化して検索可能にする


router.post("/", async (req, res) => {
    const { trades } = req.body;
    if (!trades) return res.status(400).json({ error: "trades が必要です" });
  
    // ここに分析ロジックを入れる
});
  
export default router;