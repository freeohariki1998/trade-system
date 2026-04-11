import { Router } from "express";
import { getLosingPatternCollection } from "../../services/rag/losingPatternCollection";
import { client } from "../../lib/openai";

const router = Router();

router.post("/", async (req, res) => {
    const tradeCollection = await getLosingPatternCollection();

    // 過去の負けトレードを検索
    const result = await tradeCollection.query({
        queryTexts: ["負けトレードの特徴"],
        nResults: 50,
    });

    // LLM に負けパターン抽出を依頼
    const answer = await client.responses.create({
        model: "gpt-4.1-mini",
        input: `
    以下は過去の負けトレードです。
    共通点を分析し、負けパターンを抽出してください。

    【負けトレード】
    ${JSON.stringify(result.documents)}

    以下を出力してください：
    1. 負けパターンの名前
    2. パターンの説明
    3. そのパターンの条件（数値ベース）
    4. なぜ負けやすいのか（論理的に）
    5. このパターンを避けるための対策
        `
    });

    const pattern = answer.output_text;

    // パターン辞書に保存
    await tradeCollection.upsert({
        ids: [`losing_${Date.now()}`],
        documents: [pattern],
    });

    res.json({ message: "負けパターン辞書を更新しました", pattern });
});

export default router;
